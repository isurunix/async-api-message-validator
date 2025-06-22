# AsyncAPI Validator - GitHub Copilot Instructions

You are an AI assistant helping with an **AsyncAPI Message Validation Server** project. This is a Node.js/Express application that provides both REST API endpoints and a web interface for validating message payloads against AsyncAPI schemas.

## Project Overview

This project is an AsyncAPI validation server that:
- Supports AsyncAPI 2.x and 3.0 specifications
- Validates message payloads against schema definitions
- Provides a modern web interface with Monaco Editor
- Offers REST API endpoints for programmatic access
- Handles multiple message types and operation patterns (publish/subscribe, send/receive)
- Supports protocol-agnostic validation (Kafka, RabbitMQ, WebSocket, HTTP, etc.)

## Architecture & Stack

**Backend (Node.js/Express):**
- `src/server.js` - Main Express server with validation logic
- Uses `asyncapi-validator` npm package for schema validation
- CORS enabled for web interface integration
- JSON payload limit: 10MB

**Frontend (Vanilla JS + Modern UI):**
- `public/index.html` - Single-page web application
- `public/js/validator.js` - Frontend logic with Monaco Editor integration
- TailwindCSS for styling with dark/light theme support
- Monaco Editor for JSON/YAML editing with syntax highlighting

**Schema Management:**
- `schemas/` directory contains AsyncAPI YAML definitions
- Default schema: `user-api-schema.yaml`
- Runtime schema loading from URLs supported

**Testing:**
- Jest testing framework
- Tests in `test/` directory
- Coverage reporting configured

## Key Features & Functionality

### API Endpoints
- `POST /api/validate/:messageId` - Validate message payload
- `GET /api/schema-info` - Get available messages and channels
- `POST /api/schema/load-from-url` - Load schema from remote URL
- `POST /api/schema/reset-default` - Reset to default schema
- `GET /api/schema/current` - Get current schema information
- `GET /api/message/:messageId/operation` - Get operation info for message

### Message Validation
- Validates against AsyncAPI message schemas
- Supports nested oneOf/anyOf schema patterns
- Provides detailed error reporting with field-level validation
- Handles both AsyncAPI 2.x (publish/subscribe) and 3.0 (send/receive) formats

### Web Interface Features
- Real-time message validation with Monaco Editor
- Schema information display (messages, channels, operations)
- Dark/light theme toggle with localStorage persistence
- Copy-to-clipboard functionality
- Example message templates
- Responsive design for mobile/desktop

## Code Style & Patterns

### Backend Patterns
- Express middleware for CORS and JSON parsing
- Global validator instance with lazy initialization
- Async/await for promise handling
- Comprehensive error handling with try-catch blocks
- Schema information extraction and caching

### Frontend Patterns
- ES6+ JavaScript with async/await
- Monaco Editor integration with theme synchronization
- localStorage for theme and user preferences
- Fetch API for REST communication
- DOM manipulation without frameworks

### Testing Patterns
- Jest unit tests with describe/it structure
- Mock objects for AsyncAPI schemas
- Test coverage for schema extraction logic
- Async test handling with proper cleanup

## Development Guidelines

### When adding new features:
1. **API Endpoints**: Add to `src/server.js` with proper error handling
2. **Frontend**: Update `public/js/validator.js` and corresponding HTML
3. **Tests**: Add corresponding test cases in `test/` directory
4. **Documentation**: Update README.md with new features

### When modifying validation logic:
- Ensure compatibility with both AsyncAPI 2.x and 3.0 formats
- Handle edge cases in schema structure (oneOf, references, etc.)
- Maintain backward compatibility with existing message formats
- Test against the provided schema examples

### When working with schemas:
- Default schema is `schemas/user-api-schema.yaml`
- Support for remote schema loading via URLs
- Validate schema format before loading
- Extract message/channel information for frontend display

### Performance considerations:
- Schema information is cached after loading
- Monaco Editor lazy loading for better page load times
- JSON payload size limited to 10MB
- Static file serving optimized

### Security considerations:
- CORS properly configured for web interface
- Input validation for all API endpoints
- Safe schema loading with error handling
- No direct file system access from client

## Common Tasks

### Adding a new message type:
1. Update the AsyncAPI schema YAML file
2. Restart server to reload schema
3. Test validation through web interface
4. Add test cases for the new message type

### Adding new API endpoints:
1. Define route in `src/server.js`
2. Implement validation and error handling
3. Update frontend if UI integration needed
4. Document in README.md API section

### UI enhancements:
1. Modify `public/index.html` structure
2. Update `public/js/validator.js` logic
3. Ensure dark/light theme compatibility
4. Test responsive design

### Schema management:
1. AsyncAPI schemas go in `schemas/` directory
2. Use YAML format for readability
3. Support both 2.x and 3.0 specifications
4. Test schema loading via URL endpoint

## Error Handling Patterns
- Always use try-catch for async operations
- Provide meaningful error messages to users
- Log errors server-side for debugging
- Return appropriate HTTP status codes
- Validate inputs before processing

## Dependencies
- **Production**: express, cors, asyncapi-validator
- **Development**: jest, nodemon, supertest, axios
- **Frontend**: Monaco Editor (CDN), TailwindCSS (CDN), Font Awesome (CDN)

Remember: This is a validation tool, so accuracy and clear error reporting are paramount. Always test thoroughly with various message formats and edge cases.
