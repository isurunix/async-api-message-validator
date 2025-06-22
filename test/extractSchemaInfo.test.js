const { extractSchemaInfoFromObject: extractSchemaInfo } = require('../src/server');

// Mock schema based on the provided AsyncAPI 3.0 specification
const mockSchema = {
  asyncapi: '3.0.0',
  info: {
    title: 'Viax funding updates',
    version: '1.0.0',
    description: 'This contract describes events that Viax emits when funding related events occur',
    license: {
      name: 'Wiley'
    },
    contact: {
      name: 'Philippe Lavoie',
      email: 'plavoie@wiley.com'
    }
  },
  servers: {
    development: {
      host: 'localhost:9092',
      protocol: 'kafka',
      protocolVersion: '1.0.0',
      description: 'Development server'
    }
  },
  channels: {
    updateFunding: {
      address: 'wly.glb.viax.funding.updates.dev',
      description: 'TBD',
      messages: {
        updateDeal: {
          $ref: '#/components/messages/DealUpdateMessage'
        },
        updateDealFunding: {
          $ref: '#/components/messages/DealFundingUpdateMessage'
        }
      }
    }
  },
  operations: {
    'update-deal': {
      action: 'send',
      channel: {
        $ref: '#/channels/updateFunding'
      },
      messages: [
        {
          $ref: '#/channels/updateFunding/messages/updateDeal'
        }
      ]
    },
    'update-funding': {
      action: 'send',
      channel: {
        $ref: '#/channels/updateFunding'
      },
      messages: [
        {
          $ref: '#/channels/updateFunding/messages/updateDealFunding'
        }
      ]
    }
  },
  components: {
    messages: {
      DealUpdateMessage: {
        messageId: 'DealUpdateMessage',
        title: 'Message indicating that a deal is updated or created',
        contentType: 'application/json',
        payload: {
          type: 'object',
          allOf: [
            {
              $ref: '#/components/schemas/MessageMetadata'
            },
            {
              type: 'object',
              required: ['data'],
              properties: {
                data: {
                  $ref: '#/components/schemas/WileyasDealUpdate'
                }
              }
            }
          ]
        }
      },
      DealFundingUpdateMessage: {
        messageId: 'DealFundingUpdateMessage',
        title: 'Message indicating that a deal funding is updated',
        contentType: 'application/json',
        payload: {
          type: 'object',
          allOf: [
            {
              $ref: '#/components/schemas/MessageMetadata'
            },
            {
              type: 'object',
              required: ['data'],
              properties: {
                data: {
                  $ref: '#/components/schemas/WileyasDealFundingUpdate'
                }
              }
            }
          ]
        }
      }
    },
    schemas: {
      MessageMetadata: {
        description: 'This schema represents the metadata required by the Wiley event guide',
        type: 'object',
        required: [
          'apiversion', 'tenant', 'traceid', 'id', 'source', 'specversion',
          'type', 'subtype', 'subject', 'time', 'datacontenttype'
        ],
        properties: {
          apiversion: { type: 'string', enum: ['1.0.0'] },
          tenant: { type: 'string', format: 'uuid' },
          traceid: { type: 'string', format: 'uuid' },
          id: { type: 'string', format: 'uuid' },
          source: { type: 'string', enum: ['urn:appcat:viax'] },
          specversion: { type: 'string', enum: ['1.0'] },
          type: { type: 'string', enum: ['deal.created', 'deal.updated', 'deal.funding.updated'] },
          subtype: { type: 'string', enum: ['Deal', 'DealFunding'] },
          subject: { type: 'string' },
          time: { type: 'string', format: 'date-time' },
          datacontenttype: { type: 'string', enum: ['application/json'] }
        }
      },
      WileyasDealUpdate: {
        type: 'object',
        description: 'Describes how a deal is configured by WOAD',
        required: [
          'uid', 'versionId', 'previousVersionId', 'name', 'status',
          'dealStatus', 'currency', 'startDate', 'endDate', 'rootNode'
        ],
        properties: {
          uid: { type: 'string', format: 'uuid' },
          versionId: { type: 'string', example: '10333' },
          previousVersionId: { type: 'string', example: '10234' },
          name: { type: 'string', example: 'Justice Group' },
          status: { type: 'string', enum: ['Active', 'Ready'] },
          dealStatus: { type: 'string', enum: ['Active', 'Ready', 'Expired'] },
          currency: { type: 'string', example: 'USD' },
          startDate: { type: 'string', format: 'date', example: '2024-01-01' },
          endDate: { type: 'string', format: 'date', example: '2024-12-31' },
          createdAt: { type: 'string', format: 'date-time', example: '2023-08-24T14:15:22Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2023-10-14T16:38:56Z' }
        }
      },
      WileyasDealFundingUpdate: {
        type: 'object',
        required: [
          'uid', 'versionId', 'name', 'dealStatus', 'currency',
          'startDate', 'endDate', 'rootNode', 'updatedAt',
          'allPools', 'allFundingNodes', 'allAllocationNodes'
        ],
        properties: {
          uid: { type: 'string', format: 'uuid' },
          versionId: { type: 'string', example: '10333' },
          name: { type: 'string', example: 'Justice Group' },
          dealStatus: { type: 'string', enum: ['Active', 'Ready', 'Expired'] },
          currency: { type: 'string', example: 'USD' },
          startDate: { type: 'string', format: 'date', example: '2024-01-01' },
          endDate: { type: 'string', format: 'date', example: '2024-12-31' },
          updatedAt: { type: 'string', format: 'date-time', example: '2023-10-14T16:38:56Z' },
          allPools: { type: 'array', items: {} },
          allFundingNodes: { type: 'array', items: {} },
          allAllocationNodes: { type: 'array', items: {} }
        }
      }
    }
  }
};

describe('extractSchemaInfo', () => {

  test('should extract schema information correctly', () => {
    const result = extractSchemaInfo(mockSchema);

    // Test the structure of the result
    expect(result).toHaveProperty('messages');
    expect(result).toHaveProperty('channels');
    expect(result).toHaveProperty('messageOperations');
  });

  test('should extract channels information correctly', () => {
    const result = extractSchemaInfo(mockSchema);

    expect(result.channels).toHaveProperty('updateFunding');
    expect(result.channels.updateFunding).toEqual({
      description: 'TBD',
      publish: false,
      subscribe: false,
      address: 'wly.glb.viax.funding.updates.dev'
    });
  });

  test('should extract messages information correctly', () => {
    const result = extractSchemaInfo(mockSchema);

    // Check DealUpdateMessage
    expect(result.messages).toHaveProperty('DealUpdateMessage');
    expect(result.messages.DealUpdateMessage).toEqual({
      messageId: 'DealUpdateMessage',
      title: 'Message indicating that a deal is updated or created',
      description: 'No description',
      contentType: 'application/json'
    });

    // Check DealFundingUpdateMessage
    expect(result.messages).toHaveProperty('DealFundingUpdateMessage');
    expect(result.messages.DealFundingUpdateMessage).toEqual({
      messageId: 'DealFundingUpdateMessage',
      title: 'Message indicating that a deal funding is updated',
      description: 'No description',
      contentType: 'application/json'
    });
  });

  test('should extract message operations mapping correctly', () => {
    const result = extractSchemaInfo(mockSchema);

    expect(result.messageOperations).toHaveProperty('DealUpdateMessage');
    expect(result.messageOperations.DealUpdateMessage).toEqual({
      operation: 'send',
      channel: 'updateFunding'
    });

    expect(result.messageOperations).toHaveProperty('DealFundingUpdateMessage');
    expect(result.messageOperations.DealFundingUpdateMessage).toEqual({
      operation: 'send',
      channel: 'updateFunding'
    });
  });

  test('should handle empty schema gracefully', () => {
    const emptySchema = {};
    const result = extractSchemaInfo(emptySchema);

    expect(result).toEqual({
      messages: {},
      channels: {},
      messageOperations: {}
    });
  });

  test('should handle schema without channels', () => {
    const schemaWithoutChannels = {
      components: {
        messages: {
          TestMessage: {
            messageId: 'TestMessage',
            title: 'Test Message',
            contentType: 'application/json'
          }
        }
      }
    };

    const result = extractSchemaInfo(schemaWithoutChannels);

    expect(result.channels).toEqual({});
    expect(result.messages).toHaveProperty('TestMessage');
    expect(result.messageOperations).toEqual({});
  });

  test('should handle schema without messages', () => {
    const schemaWithoutMessages = {
      channels: {
        testChannel: {
          description: 'Test Channel'
        }
      }
    };

    const result = extractSchemaInfo(schemaWithoutMessages);

    expect(result.messages).toEqual({});
    expect(result.channels).toHaveProperty('testChannel');
    expect(result.messageOperations).toEqual({});
  });

  // TODO: Re-implement payload validation tests
  // Currently disabled because payload information was removed from extractSchemaInfo
  // test('should validate message payload structure for DealUpdateMessage', ...)
  // test('should validate message payload structure for DealFundingUpdateMessage', ...)

  test('should handle AsyncAPI 3.0 operations with send/receive actions', () => {
    const asyncApi3Schema = {
      channels: {
        userUpdates: {
          description: 'User update channel',
          messages: {
            userCreated: { $ref: '#/components/messages/UserCreated' },
            userDeleted: { $ref: '#/components/messages/UserDeleted' }
          }
        }
      },
      operations: {
        'send-user-created': {
          action: 'send',
          channel: { $ref: '#/channels/userUpdates' },
          messages: [{ $ref: '#/channels/userUpdates/messages/userCreated' }]
        },
        'receive-user-deleted': {
          action: 'receive',
          channel: { $ref: '#/channels/userUpdates' },
          messages: [{ $ref: '#/channels/userUpdates/messages/userDeleted' }]
        }
      },
      components: {
        messages: {
          UserCreated: { title: 'User Created', contentType: 'application/json' },
          UserDeleted: { title: 'User Deleted', contentType: 'application/json' }
        }
      }
    };

    const result = extractSchemaInfo(asyncApi3Schema);

    expect(result.messageOperations.UserCreated).toEqual({
      operation: 'send',
      channel: 'userUpdates'
    });

    expect(result.messageOperations.UserDeleted).toEqual({
      operation: 'receive',
      channel: 'userUpdates'
    });
  });

  test('should include channel address in AsyncAPI 3.0 format', () => {
    const result = extractSchemaInfo(mockSchema);

    expect(result.channels.updateFunding).toHaveProperty('address');
    expect(result.channels.updateFunding.address).toBe('wly.glb.viax.funding.updates.dev');
  });

  describe('AsyncAPI 2.5.x format support', () => {
    const asyncApi25Schema = {
      asyncapi: '2.5.0',
      info: {
        title: 'AMP Order Async API contract',
        version: '1.3.0',
        description: 'This contract describes the Order API between Author Services and AMP (Agile Monetization Platform)',
        contact: {
          name: 'Denis Melentyev'
        },
        license: {
          name: 'Wiley License'
        }
      },
      servers: {
        development: {
          url: 'kafka-dev1.re.wiley.com:29095',
          protocol: 'kafka',
          description: 'The external Kafka dev server'
        }
      },
      channels: {
        'wly.glb.as.viax.orderprocessing.dev': {
          description: 'Order processing channel',
          publish: {
            operationId: 'publish-OrdersNotification',
            description: 'Enables AS to send order commands to viax',
            message: {
              oneOf: [
                { $ref: '#/components/messages/OrderSubmissionMessage' },
                { $ref: '#/components/messages/OrderUpdateMessage' },
                { $ref: '#/components/messages/OrderCancellationEventASNotificationMessage' }
              ]
            }
          },
          subscribe: {
            operationId: 'subscribe-OrdersNotification',
            description: 'Enable viax to report on status updates back to AS',
            message: {
              oneOf: [
                { $ref: '#/components/messages/OrderCreationConfirmationEventNotificationMessage' },
                { $ref: '#/components/messages/OrderUpdateConfirmationEventNotificationMessage' },
                { $ref: '#/components/messages/OrderCreationFailedEventNotificationMessage' },
                { $ref: '#/components/messages/OrderPaidEventNotificationMessage' },
                { $ref: '#/components/messages/OrderCancellationEventAMPNotificationMessage' }
              ]
            }
          }
        }
      },
      defaultContentType: 'application/json',
      components: {
        messages: {
          OrderSubmissionMessage: {
            title: 'Message from AS, reflects submitted order. Message eventType = order.submitted',
            contentType: 'application/json',
            messageId: 'OrderSubmissionMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/Order' }
              ]
            }
          },
          OrderUpdateMessage: {
            title: 'Message from AS reflect updated order. Message eventType = order.updated. Order Unique Id is the same',
            contentType: 'application/json',
            messageId: 'OrderUpdateMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/Order' }
              ]
            }
          },
          OrderCancellationEventASNotificationMessage: {
            title: 'Message indicates that order cancellation requested in AS. Message eventType = order.cancelled, source system - as-order-service.',
            contentType: 'application/json',
            messageId: 'OrderCancellationEventASNotificationMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/OrderCancellationEvent' }
              ]
            }
          },
          OrderCreationConfirmationEventNotificationMessage: {
            title: 'Message received when the order is procesed in AMP and created in SAP. Message eventType = order.created',
            contentType: 'application/json',
            messageId: 'OrderCreationConfirmationEventNotificationMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/OrderConfirmationEvent' }
              ]
            }
          },
          OrderUpdateConfirmationEventNotificationMessage: {
            title: 'Message received when the cancel order is properly handled by AMP. Message eventType = order.updated, source system - viax.',
            contentType: 'application/json',
            messageId: 'OrderUpdateConfirmationEventNotificationMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/OrderConfirmationEvent' }
              ]
            }
          },
          OrderCreationFailedEventNotificationMessage: {
            title: 'Message received when an order generated by AS could not be created inside AMP or SAP. Message eventType = order.creation.failed',
            contentType: 'application/json',
            messageId: 'OrderCreationFailedEventNotificationMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/OrderCreationFailedEvent' }
              ]
            }
          },
          OrderPaidEventNotificationMessage: {
            title: 'Message received to indicate that an order is fully paid. Message eventType = order.paid',
            contentType: 'application/json',
            messageId: 'OrderPaidEventNotificationMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/OrderPaidEvent' }
              ]
            }
          },
          OrderCancellationEventAMPNotificationMessage: {
            title: 'Message indicates that order have been cancelled in AMP(and SAP). Message eventType = order.cancelled, source system - viax.',
            contentType: 'application/json',
            messageId: 'OrderCancellationEventAMPNotificationMessage',
            payload: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/MessageMetadata' },
                { $ref: '#/components/schemas/OrderCancellationEvent' }
              ]
            }
          }
        },
        schemas: {
          MessageMetadata: {
            description: 'This schema represents the metadata required by the Wiley event guide',
            required: ['id', 'eventType', 'source', 'specVersion', 'eventDate', 'dataContentType'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              eventType: { type: 'string', enum: ['order.submitted', 'order.created', 'order.updated', 'order.cancelled', 'order.paid'] },
              source: { type: 'string', enum: ['viax', 'as-order-service'] },
              specVersion: { type: 'string', example: '1.0' },
              eventDate: { type: 'string', format: 'date-time' },
              dataContentType: { type: 'string', enum: ['application/json'] }
            }
          }
        }
      }
    };

         test('should extract AsyncAPI 2.5.x schema structure correctly', () => {
       const result = extractSchemaInfo(asyncApi25Schema);

       expect(result).toHaveProperty('messages');
       expect(result).toHaveProperty('channels');
       expect(result).toHaveProperty('messageOperations');
     });

         test('should extract channels with publish and subscribe operations correctly', () => {
       const result = extractSchemaInfo(asyncApi25Schema);

       const channelName = 'wly.glb.as.viax.orderprocessing.dev';
       expect(Object.keys(result.channels)).toContain(channelName);
       expect(result.channels[channelName]).toEqual({
         description: 'Order processing channel',
         publish: true,
         subscribe: true,
         address: null
       });
     });

    test('should extract all messages from AsyncAPI 2.5.x format', () => {
      const result = extractSchemaInfo(asyncApi25Schema);

      // Check publish messages
      expect(result.messages).toHaveProperty('OrderSubmissionMessage');
      expect(result.messages).toHaveProperty('OrderUpdateMessage');
      expect(result.messages).toHaveProperty('OrderCancellationEventASNotificationMessage');

      // Check subscribe messages
      expect(result.messages).toHaveProperty('OrderCreationConfirmationEventNotificationMessage');
      expect(result.messages).toHaveProperty('OrderUpdateConfirmationEventNotificationMessage');
      expect(result.messages).toHaveProperty('OrderCreationFailedEventNotificationMessage');
      expect(result.messages).toHaveProperty('OrderPaidEventNotificationMessage');
      expect(result.messages).toHaveProperty('OrderCancellationEventAMPNotificationMessage');
    });

         test('should map publish messages to publish operation correctly', () => {
       const result = extractSchemaInfo(asyncApi25Schema);
       const channelName = 'wly.glb.as.viax.orderprocessing.dev';

       expect(result.messageOperations.OrderSubmissionMessage).toEqual({
         operation: 'publish',
         channel: channelName
       });

       expect(result.messageOperations.OrderUpdateMessage).toEqual({
         operation: 'publish',
         channel: channelName
       });

       expect(result.messageOperations.OrderCancellationEventASNotificationMessage).toEqual({
         operation: 'publish',
         channel: channelName
       });
     });

         test('should map subscribe messages to subscribe operation correctly', () => {
       const result = extractSchemaInfo(asyncApi25Schema);
       const channelName = 'wly.glb.as.viax.orderprocessing.dev';

       expect(result.messageOperations.OrderCreationConfirmationEventNotificationMessage).toEqual({
         operation: 'subscribe',
         channel: channelName
       });

       expect(result.messageOperations.OrderUpdateConfirmationEventNotificationMessage).toEqual({
         operation: 'subscribe',
         channel: channelName
       });

       expect(result.messageOperations.OrderCreationFailedEventNotificationMessage).toEqual({
         operation: 'subscribe',
         channel: channelName
       });

       expect(result.messageOperations.OrderPaidEventNotificationMessage).toEqual({
         operation: 'subscribe',
         channel: channelName
       });

       expect(result.messageOperations.OrderCancellationEventAMPNotificationMessage).toEqual({
         operation: 'subscribe',
         channel: channelName
       });
     });

    test('should handle oneOf message arrays in publish/subscribe correctly', () => {
      const result = extractSchemaInfo(asyncApi25Schema);

      // Verify that all messages from oneOf arrays are properly extracted
      const publishMessages = ['OrderSubmissionMessage', 'OrderUpdateMessage', 'OrderCancellationEventASNotificationMessage'];
      const subscribeMessages = [
        'OrderCreationConfirmationEventNotificationMessage',
        'OrderUpdateConfirmationEventNotificationMessage', 
        'OrderCreationFailedEventNotificationMessage',
        'OrderPaidEventNotificationMessage',
        'OrderCancellationEventAMPNotificationMessage'
      ];

      publishMessages.forEach(messageId => {
        expect(result.messageOperations).toHaveProperty(messageId);
        expect(result.messageOperations[messageId].operation).toBe('publish');
      });

      subscribeMessages.forEach(messageId => {
        expect(result.messageOperations).toHaveProperty(messageId);
        expect(result.messageOperations[messageId].operation).toBe('subscribe');
      });
    });

    test('should validate message structure for AsyncAPI 2.5.x messages', () => {
      const result = extractSchemaInfo(asyncApi25Schema);

      const orderSubmissionMessage = result.messages.OrderSubmissionMessage;
      expect(orderSubmissionMessage).toEqual({
        messageId: 'OrderSubmissionMessage',
        title: 'Message from AS, reflects submitted order. Message eventType = order.submitted',
        description: 'No description',
        contentType: 'application/json'
      });

      // TODO: Re-implement payload structure validation
      // Currently disabled because payload information was removed from extractSchemaInfo
      // expect(orderSubmissionMessage.payload).toHaveProperty('type', 'object');
    });

         test('should handle mixed AsyncAPI 2.5.x and 3.0 schemas', () => {
       // Test that the function can handle both formats correctly
       const result25 = extractSchemaInfo(asyncApi25Schema);
       const result30 = extractSchemaInfo(mockSchema);
       const channelName25 = 'wly.glb.as.viax.orderprocessing.dev';

       // AsyncAPI 2.5.x should have publish/subscribe operations
       expect(result25.channels[channelName25].publish).toBe(true);
       expect(result25.channels[channelName25].subscribe).toBe(true);

       // AsyncAPI 3.0 should not have publish/subscribe but should have address
       expect(result30.channels.updateFunding.publish).toBe(false);
       expect(result30.channels.updateFunding.subscribe).toBe(false);
       expect(result30.channels.updateFunding.address).toBe('wly.glb.viax.funding.updates.dev');
     });
  });
}); 