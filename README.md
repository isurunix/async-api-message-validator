# AsyncAPI Validator

An AsyncAPI validation server with web interface that supports both AsyncAPI 2.x and 3.0 specifications.

## PSA

This is almost a vibe coded tool that I quickly got up and runnning within few hours during a weekend. This came out of a sudden idea I had as I was looking at a few async api schemas and logs of messages related to them.  

Also I wanted to give a try at using Github Copilot agent with VS Code and Cursor to see how they perform and used this as an opportunity to do that as well.  

If you wonder why this was added as a working prototype with a single commit, that's mainly because I didn't thought of working on this as a project and this was merley a simple exercise try out different agent-based IDEs and see how quickly I can turn around different ideas I get during the weekend to a working prototype.

You'd find comments that does not make any sense and the UI is entierly made up of unreadable inline css. Please bear with them for now and since I find this interesting I'm looking at working on this and improving this further.

## Features

✅ **Multi-Version Support**: AsyncAPI 2.0+ through 3.0.0  
✅ **Operation Types**: `publish`/`subscribe` (2.x) and `send`/`receive` (3.0)   
✅ **Format Support**: JSON and YAML schemas  
✅ **Real-time Validation**: Message payload validation against schemas  
✅ **Schema Loading**: Local files and remote URLs  
✅ **Web Interface**: Browser-based validation UI  
✅ **API Endpoints**: RESTful API for programmatic access  

## Installation

```bash
npm install
```

## Usage

### Start the Server
```bash
npm start
```

The server will be available at `http://localhost:3000`

### Development Mode
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

## API Endpoints

### Schema Management
- `POST /api/schema/load-from-url` - Load schema from URL
- `POST /api/schema/reset-default` - Reset to default schema
- `GET /api/schema/current` - Get current schema information

### Schema Information
- `GET /api/schema-info` - Get available messages and channels
- `GET /api/message/:messageId/operation` - Get operation info for a message

### Message Validation
- `POST /api/validate` - Validate message payload against schema

### Health Check
- `GET /api/health` - Server health status

## Schema Support

### AsyncAPI 2.x
```yaml
asyncapi: 2.5.0
channels:
  user-events:
    publish:
      message:
        $ref: '#/components/messages/UserCreated'
```

### AsyncAPI 3.0
```yaml
asyncapi: 3.0.0
channels:
  user-events:
    address: user.events
    messages:
      UserCreated:
        $ref: '#/components/messages/UserCreated'
operations:
  sendUserEvent:
    action: send
    channel:
      $ref: '#/channels/user-events'
```

## Testing

The project includes comprehensive tests covering:
- AsyncAPI 2.x format support
- AsyncAPI 3.0 format support  
- Edge cases and error handling
- Real-world schema validation

Run tests with:
```bash
npm test
```

## TODO

### High Priority
- [ ] **Refactor and clean the code**
- [ ] **Implement schema information endpoints** - Add `/api/message/:messageId/schema` endpoint to provide detailed schema information for each message
- [ ] **Implement sample payload generation** - Add `/api/message/:messageId/example` endpoint to generate example payloads based on message schemas
- [ ] **Enhance payload extraction** - Modify `extractSchemaInfo` to include payload information while maintaining performance

### Medium Priority
- [ ] Create container support
- [ ] Add support for AsyncAPI 3.1+ features
- [ ] Implement schema validation caching
- [ ] Add support for custom validation rules
- [ ] Enhance error reporting with detailed validation feedback

### Low Priority
- [ ] Add schema comparison features
- [ ] Implement schema versioning support
- [ ] Add metrics and monitoring endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request


## Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing support
- **asyncapi-validator**: AsyncAPI message validation (v5.1.1+ for AsyncAPI 3.0 support)

## Development Dependencies

- **jest**: Testing framework
- **nodemon**: Development server with auto-reload
- **axios**: HTTP client for testing
- **supertest**: HTTP assertion library 