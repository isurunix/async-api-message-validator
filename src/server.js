const express = require("express");
const path = require("path");
const cors = require("cors");
const AsyncApiValidator = require("asyncapi-validator");
const { Parser, fromFile, fromURL } = require("@asyncapi/parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../public")));

// Global validator instance
let validator = null;
let schemaInfo = null;

// Initialize AsyncAPI validator
async function initializeValidator() {
  try {
    console.log("Loading AsyncAPI schema...");
    const schemaPath = path.join(
      __dirname,
      "../schemas",
      "user-api-schema.yaml",
    );

    // Load validator with messageId as the identifier
    validator = await AsyncApiValidator.fromSource(schemaPath, {
      msgIdentifier: "messageId",
      ignoreArray: true,
    });

    console.log("AsyncAPI schema loaded successfully");

    // Extract schema information for frontend using the official parser
    schemaInfo = await extractSchemaInfo(schemaPath);
  } catch (error) {
    console.error("Error loading AsyncAPI schema:", error.message);
    throw error;
  }
}

// Extract message information from the parsed AsyncAPI document
async function extractSchemaInfo(source) {
  const parser = new Parser();
  let document, diagnostics;

  // Determine if source is a URL or file path
  if (
    typeof source === "string" &&
    (source.startsWith("http://") || source.startsWith("https://"))
  ) {
    // Handle URL source
    const result = await fromURL(parser, source).parse();
    document = result.document;
    diagnostics = result.diagnostics;
  } else {
    // Handle file path source
    const result = await fromFile(parser, source).parse();
    document = result.document;
    diagnostics = result.diagnostics;
  }

  if (!document) {
    console.error("Failed to parse AsyncAPI document:", diagnostics);
    throw new Error("Invalid AsyncAPI document");
  }

  const info = {
    messages: {},
    channels: {},
    messageOperations: {}, // Map messageId to operation and channel
  };

  // Extract channel information using the official parser API
  const channels = document.channels();
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const channelId = channel.id();

    info.channels[channelId] = {
      description: channel.hasDescription()
        ? channel.description()
        : "No description available",
      publish: false,
      subscribe: false,
      address: channel.address() || null,
    };

    // Get operations for this channel
    const operations = channel.operations();
    for (let j = 0; j < operations.length; j++) {
      const operation = operations[j];
      const action = operation.action(); // publish, subscribe, send, receive

      // Update channel operation flags
      if (action === "publish") {
        info.channels[channelId].publish = true;
      } else if (action === "subscribe") {
        info.channels[channelId].subscribe = true;
      }

      // Get messages for this operation
      const messages = operation.messages();
      for (let k = 0; k < messages.length; k++) {
        const message = messages[k];
        const messageId = getMessageId(message);
        if (messageId) {
          info.messageOperations[messageId] = {
            operation: action,
            channel: channelId,
          };
        }
      }
    }
  }

  // Extract message information from components
  const components = document.components();
  if (components && components.messages) {
    const messages = components.messages();
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageId = message.id(); // Use id() method for component messages

      info.messages[messageId] = {
        messageId: messageId,
        title: message.hasTitle() ? message.title() : "No title",
        description: message.hasDescription()
          ? message.description()
          : "No description",
        contentType: message.hasContentType()
          ? message.contentType()
          : "application/json",
      };
    }
  }

  // Also extract messages from channels (for AsyncAPI 2.x where messages might not be in components)
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const channelMessages = channel.messages();

    for (let j = 0; j < channelMessages.length; j++) {
      const message = channelMessages[j];
      const messageId = getMessageId(message);
      if (messageId && !info.messages[messageId]) {
        info.messages[messageId] = {
          messageId: messageId,
          title: message.hasTitle() ? message.title() : "No title",
          description: message.hasDescription()
            ? message.description()
            : "No description",
          contentType: message.hasContentType()
            ? message.contentType()
            : "application/json",
        };
      }
    }
  }

  return info;
}

// Helper function to extract message ID from a message object
function getMessageId(message) {
  // Try to get the messageId from the message JSON
  if (message.json && typeof message.json === "function") {
    const json = message.json();
    if (json.messageId) {
      return json.messageId;
    }
    if (json.id) {
      return json.id;
    }
  }

  // Try direct property access
  if (message.messageId) {
    return message.messageId;
  }
  if (message.id && typeof message.id === "function") {
    return message.id();
  }
  if (message.id) {
    return message.id;
  }

  // Try _json property (internal structure)
  if (message._json && message._json.messageId) {
    return message._json.messageId;
  }

  return null;
}

// API Routes

// Load schema from URL
app.post("/api/schema/load-from-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Validate URL format (basic validation)
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format. URL must start with http:// or https://",
      });
    }

    console.log(`Loading AsyncAPI schema from URL: ${url}`);

    // Load validator from URL
    validator = await AsyncApiValidator.fromSource(url, {
      msgIdentifier: "messageId",
      ignoreArray: true,
    });

    console.log("AsyncAPI schema loaded successfully from URL");

    // Extract schema information for frontend using the official parser
    schemaInfo = await extractSchemaInfo(url);

    res.json({
      success: true,
      message: "Schema loaded successfully from URL",
      data: {
        title: validator.schema.info?.title || "Custom Schema",
        version: validator.schema.info?.version || "Unknown",
        description:
          validator.schema.info?.description || "No description available",
        messageCount: Object.keys(schemaInfo.messages).length,
        channelCount: Object.keys(schemaInfo.channels).length,
        url: url,
      },
    });
  } catch (error) {
    console.error("Error loading schema from URL:", error.message);

    res.status(500).json({
      success: false,
      message: `Failed to load schema from URL: ${error.message}`,
      error: error.name,
    });
  }
});

// Reset to default schema
app.post("/api/schema/reset-default", async (req, res) => {
  try {
    console.log("Resetting to default AsyncAPI schema...");

    const schemaPath = path.join(
      __dirname,
      "../schemas",
      "user-api-schema.yaml",
    );

    // Load validator with messageId as the identifier
    validator = await AsyncApiValidator.fromSource(schemaPath, {
      msgIdentifier: "messageId",
      ignoreArray: true,
    });

    console.log("Default AsyncAPI schema loaded successfully");

    // Extract schema information for frontend using the official parser
    schemaInfo = await extractSchemaInfo(schemaPath);

    res.json({
      success: true,
      message: "Default schema loaded successfully",
      data: {
        title: validator.schema.info?.title || "Default Schema",
        version: validator.schema.info?.version || "Unknown",
        description:
          validator.schema.info?.description || "No description available",
        messageCount: Object.keys(schemaInfo.messages).length,
        channelCount: Object.keys(schemaInfo.channels).length,
        url: "default",
      },
    });
  } catch (error) {
    console.error("Error loading default schema:", error.message);

    res.status(500).json({
      success: false,
      message: `Failed to load default schema: ${error.message}`,
      error: error.name,
    });
  }
});

// Get current schema information
app.get("/api/schema/current", (req, res) => {
  if (!validator || !schemaInfo) {
    return res.status(500).json({
      success: false,
      message: "No schema currently loaded",
    });
  }

  res.json({
    success: true,
    data: {
      title: validator.schema.info?.title || "Unknown Schema",
      version: validator.schema.info?.version || "Unknown",
      description:
        validator.schema.info?.description || "No description available",
      messageCount: Object.keys(schemaInfo.messages).length,
      channelCount: Object.keys(schemaInfo.channels).length,
    },
  });
});

// Get available messages and channels
app.get("/api/schema-info", (req, res) => {
  if (!schemaInfo) {
    return res.status(500).json({
      error: "Schema not loaded",
      message: "AsyncAPI schema is not yet loaded",
    });
  }

  res.json({
    success: true,
    data: schemaInfo,
  });
});

// Get specific message schema
app.get("/api/message/:messageId/schema", (req, res) => {
  const messageId = req.params.messageId;
  console.log(messageId);
  console.log(schemaInfo.messages);
  if (!schemaInfo || !schemaInfo.messages[messageId]) {
    return res.status(404).json({
      error: "Message not found",
      message: `Message '${messageId}' not found in schema`,
    });
  }

  res.json({
    success: true,
    data: schemaInfo.messages[messageId],
  });
});

// Get operation information for a specific message
app.get("/api/message/:messageId/operation", (req, res) => {
  const messageId = req.params.messageId;

  if (!schemaInfo) {
    return res.status(500).json({
      error: "Schema not loaded",
      message: "AsyncAPI schema is not yet loaded",
    });
  }

  if (!schemaInfo.messages[messageId]) {
    return res.status(404).json({
      error: "Message not found",
      message: `Message '${messageId}' not found in schema`,
    });
  }

  const operationInfo = schemaInfo.messageOperations[messageId];
  if (!operationInfo) {
    return res.status(404).json({
      error: "Operation not found",
      message: `Operation information for message '${messageId}' not found in schema`,
    });
  }

  res.json({
    success: true,
    data: {
      messageId,
      operation: operationInfo.operation,
      channel: operationInfo.channel,
    },
  });
});

// Validate message payload
app.post("/api/validate", async (req, res) => {
  try {
    const { messageId, payload, channel, operation } = req.body;

    if (!messageId || !payload || !channel || !operation) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "messageId, payload, channel, and operation are required",
      });
    }

    if (!validator) {
      return res.status(500).json({
        error: "Validator not ready",
        message: "AsyncAPI validator is not initialized",
      });
    }

    // Perform validation
    const validationResult = validator.validate(
      messageId,
      payload,
      channel,
      operation,
    );

    res.json({
      success: true,
      valid: validationResult,
      message: validationResult
        ? "Message is valid"
        : "Message validation failed",
    });
  } catch (error) {
    console.error("Validation error:", error);

    if (error.name === "AsyncAPIValidationError") {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Validation failed",
        message: error.message,
        details: {
          key: error.key,
          errors: error.errors || [],
        },
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// TODO: Re-implement example payload generation endpoint
// Currently disabled because payload information was removed from extractSchemaInfo
// app.get('/api/message/:messageId/example', ...)

// TODO: Re-implement helper functions for example generation
// Currently disabled because payload information was removed from extractSchemaInfo
// function generateExampleFromSchema(schema, includeOptional = false) { ... }
// function generateExampleValue(propSchema) { ... }

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    validator: validator ? "ready" : "not ready",
  });
});

// Serve static files (index.html, etc.)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

// Start server
async function startServer() {
  try {
    await initializeValidator();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

// Backward compatibility function for tests that use schema objects
// This maintains the old interface while the main function uses the official parser
function extractSchemaInfoFromObject(schema) {
  const info = {
    messages: {},
    channels: {},
    messageOperations: {}, // Map messageId to operation and channel
  };

  // Extract channel information (legacy format)
  if (schema.channels) {
    Object.keys(schema.channels).forEach((channelName) => {
      const channel = schema.channels[channelName];

      info.channels[channelName] = {
        description: channel.description || "No description available",
        publish: !!channel.publish,
        subscribe: !!channel.subscribe,
        address: channel.address || null,
      };

      // Handle AsyncAPI 2.x format (publish/subscribe in channels)
      if (channel.publish && channel.publish.message) {
        extractMessagesFromOperationLegacy(
          channel.publish.message,
          "publish",
          channelName,
          info.messageOperations,
        );
      }
      if (channel.subscribe && channel.subscribe.message) {
        extractMessagesFromOperationLegacy(
          channel.subscribe.message,
          "subscribe",
          channelName,
          info.messageOperations,
        );
      }

      // Handle AsyncAPI 3.0 format (messages directly in channels)
      if (channel.messages) {
        Object.keys(channel.messages).forEach((messageKey) => {
          const messageRef = channel.messages[messageKey];
          if (messageRef.$ref) {
            const messageId = messageRef.$ref.split("/").pop();
            info.messageOperations[messageId] = {
              operation: "channel",
              channel: channelName,
            };
          }
        });
      }
    });
  }

  // Extract operations information (AsyncAPI 3.0)
  if (schema.operations) {
    Object.keys(schema.operations).forEach((operationKey) => {
      const operation = schema.operations[operationKey];
      const action = operation.action;

      // Extract channel name from channel reference
      let channelName = null;
      if (operation.channel && operation.channel.$ref) {
        channelName = operation.channel.$ref.split("/").pop();
      }

      // Map messages to operations
      if (operation.messages && Array.isArray(operation.messages)) {
        operation.messages.forEach((msgRef) => {
          if (msgRef.$ref) {
            const refParts = msgRef.$ref.split("/");
            const messageId = refParts[refParts.length - 1];

            if (
              channelName &&
              schema.channels[channelName] &&
              schema.channels[channelName].messages
            ) {
              const channelMessage =
                schema.channels[channelName].messages[messageId];
              if (channelMessage && channelMessage.$ref) {
                const componentMessageId = channelMessage.$ref.split("/").pop();
                info.messageOperations[componentMessageId] = {
                  operation: action,
                  channel: channelName,
                };
              }
            }
          }
        });
      }
    });
  }

  // Extract message information
  if (schema.components && schema.components.messages) {
    Object.keys(schema.components.messages).forEach((messageKey) => {
      const message = schema.components.messages[messageKey];
      info.messages[messageKey] = {
        messageId: message.messageId || messageKey,
        title: message.title || "No title",
        description: message.description || "No description",
        contentType: message.contentType || "application/json",
      };
    });
  }

  return info;
}

// Helper function for backward compatibility (handles oneOf, $ref, direct message)
function extractMessagesFromOperationLegacy(
  messageSpec,
  operation,
  channelName,
  messageOperations,
) {
  if (messageSpec.oneOf && Array.isArray(messageSpec.oneOf)) {
    // Handle oneOf array of messages
    messageSpec.oneOf.forEach((msg) => {
      if (msg.$ref) {
        // Handle $ref case
        const messageId = msg.$ref.split("/").pop();
        messageOperations[messageId] = { operation, channel: channelName };
      } else if (msg.messageId) {
        // Handle direct message object with messageId
        messageOperations[msg.messageId] = { operation, channel: channelName };
      }
    });
  } else if (messageSpec.$ref) {
    // Handle direct $ref
    const messageId = messageSpec.$ref.split("/").pop();
    messageOperations[messageId] = { operation, channel: channelName };
  } else if (messageSpec.messageId) {
    // Handle direct message
    messageOperations[messageSpec.messageId] = {
      operation,
      channel: channelName,
    };
  }
}

// Export functions for testing
module.exports = {
  extractSchemaInfo,
  extractSchemaInfoFromObject, // For backward compatibility with tests
  app,
  startServer,
};
