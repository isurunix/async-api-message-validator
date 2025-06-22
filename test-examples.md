# Test Examples for AsyncAPI Message Validator

## Valid User Sign Up Message

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "user.signed_up",
  "source": "user-service",
  "timestamp": "2023-12-07T10:30:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1-555-123-4567",
    "dateOfBirth": "1990-01-15",
    "createdAt": "2023-12-07T10:30:00Z",
    "updatedAt": "2023-12-07T10:30:00Z",
    "status": "pending",
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "newsletter": true,
      "language": "en",
      "timezone": "America/New_York"
    },
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "postalCode": "10001"
    }
  },
  "registrationSource": "web",
  "referralCode": "FRIEND2023",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

## Valid User Updated Message

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "eventType": "user.updated",
  "source": "user-service",
  "timestamp": "2023-12-07T11:00:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "updatedFields": ["email", "preferences.emailNotifications"],
  "previousValues": {
    "email": "old.email@example.com",
    "preferences.emailNotifications": true
  },
  "newValues": {
    "email": "new.email@example.com",
    "preferences.emailNotifications": false
  },
  "updatedBy": "user"
}
```

## Valid User Deleted Message

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "eventType": "user.deleted",
  "source": "user-service",
  "timestamp": "2023-12-07T12:00:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "deleted.user@example.com",
  "deletionReason": "user_request",
  "deletedAt": "2023-12-07T12:00:00Z",
  "deletedBy": "123e4567-e89b-12d3-a456-426614174000",
  "dataRetentionDays": 30
}
```

## Valid User Notification Message

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "eventType": "user.notification",
  "source": "user-service",
  "timestamp": "2023-12-07T13:00:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "notificationType": "security_alert",
  "title": "New Device Login",
  "message": "We noticed a login from a new device",
  "priority": "high",
  "channels": ["email", "push"],
  "expiresAt": "2023-12-14T13:00:00Z",
  "actionUrl": "https://app.example.com/security"
}
```

## Valid Welcome Email Message

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "eventType": "user.welcome_email",
  "source": "user-service",
  "timestamp": "2023-12-07T14:00:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "emailType": "welcome",
  "recipient": "john.doe@example.com",
  "subject": "Welcome to Our Platform!",
  "templateId": "welcome_v2",
  "templateVariables": {
    "firstName": "John",
    "activationLink": "https://app.example.com/activate?token=abc123"
  },
  "scheduledFor": "2023-12-07T15:00:00Z"
}
```

## Valid Account Activated Message

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "eventType": "user.activated",
  "source": "user-service",
  "timestamp": "2023-12-07T15:00:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "activatedAt": "2023-12-07T15:00:00Z",
  "activationMethod": "email_verification",
  "activationToken": "act_1234567890abcdef",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "eventType": "user.notification",
  "source": "user-service",
  "timestamp": "2023-12-07T12:00:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "notificationType": "security_alert",
  "title": "New Device Login",
  "message": "We noticed a login from a new device",
  "priority": "high",
  "channels": ["email", "push"]
}
```

## Invalid Examples (for testing validation)

### Missing Required Fields - User Sign Up
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "eventType": "user.signed_up",
  "source": "user-service"
}
```

### Missing Required User Properties
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "eventType": "user.signed_up",
  "source": "user-service",
  "timestamp": "2023-12-07T10:30:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "user": {
    "email": "john.doe@example.com",
    "firstName": "John"
  },
  "registrationSource": "web"
}
```

### Invalid Field Types
```json
{
  "id": "invalid-uuid-format",
  "eventType": "user.signed_up",
  "source": "user-service",
  "timestamp": "invalid-date",
  "specVersion": "1.0",
  "contentType": "application/json",
  "user": {
    "id": "invalid-uuid",
    "email": "not-an-email",
    "firstName": 123,
    "lastName": true,
    "createdAt": "invalid-date",
    "status": "invalid-status"
  },
  "registrationSource": "invalid-source"
}
```

### Invalid Enum Values
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "eventType": "invalid.event.type",
  "source": "user-service",
  "timestamp": "2023-12-07T10:30:00Z",
  "specVersion": "1.0",
  "contentType": "application/xml",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "notificationType": "invalid_type",
  "title": "Test Notification",
  "message": "Test message",
  "priority": "invalid_priority",
  "channels": ["invalid_channel"]
}
```

### Invalid User Status
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440009",
  "eventType": "user.signed_up",
  "source": "user-service",
  "timestamp": "2023-12-07T10:30:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2023-12-07T10:30:00Z",
    "status": "invalid_status"
  },
  "registrationSource": "web"
}
```

### Invalid Registration Source
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "eventType": "user.signed_up",
  "source": "user-service",
  "timestamp": "2023-12-07T10:30:00Z",
  "specVersion": "1.0",
  "contentType": "application/json",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2023-12-07T10:30:00Z",
    "status": "pending"
  },
  "registrationSource": "invalid_platform"
}
```

## How to Test

1. **Start the server**: Run `npm start` to start the AsyncAPI validator server
2. **Open the web interface**: Navigate to `http://localhost:3000` in your browser
3. **Select message type**: Choose from the dropdown menu:
   - UserSignedUp / UserSignedUpSub
   - UserUpdated / UserUpdatedSub  
   - UserDeleted / UserDeletedSub
   - UserNotification
   - WelcomeEmail
   - AccountActivated
4. **Test valid examples**: Copy and paste any of the valid examples above
5. **Test invalid examples**: Try the invalid examples to see validation errors
6. **Experiment**: Modify examples to test different validation scenarios

## Available Message Types

- **UserSignedUp** / **UserSignedUpSub**: New user registration events
- **UserUpdated** / **UserUpdatedSub**: User profile modification events  
- **UserDeleted** / **UserDeletedSub**: User account deletion events
- **UserNotification**: General system notifications to users
- **WelcomeEmail**: Welcome email trigger events
- **AccountActivated**: Account activation confirmation events

## Expected Results

- **✅ Valid examples**: Should show green success message "Message payload is valid!"
- **❌ Invalid examples**: Should show red error messages with specific validation issues:
  - **Missing required fields**: Lists each missing required property
  - **Invalid types**: Indicates expected vs actual data types  
  - **Invalid enums**: Shows allowed values for enum fields
  - **Format violations**: Highlights UUID, email, date-time format issues
  - **Pattern mismatches**: Shows regex pattern violations (e.g., country codes)

## Tips for Testing

1. **Required vs Optional**: Try removing required fields to see validation errors
2. **Data Types**: Test with wrong data types (string instead of number, etc.)
3. **Enum Values**: Use invalid enum values to see allowed options
4. **Format Validation**: Test UUID, email, and date-time formats
5. **Nested Objects**: Test validation of nested objects like `user.preferences` and `user.address`
6. **Array Validation**: Test the `channels` array with invalid values 