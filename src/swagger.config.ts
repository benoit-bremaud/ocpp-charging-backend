import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Creates the centralized configuration for Swagger (OpenAPI) documentation.
 * Defines API metadata, tags, security schemes, and server information.
 */
export function createSwaggerConfig() {
  return (
    new DocumentBuilder()
      .setTitle('OCPP Charging Backend API')
      .setDescription(
        'REST API for managing OCPP 1.6J compliant charging stations.\n\n' +
          '### Features\n' +
          '- 🔌 **ChargePoints**: Manage the lifecycle of charging stations.\n' +
          '- ⚡ **Transactions**: Track and manage charging sessions.\n' +
          '- 🎮 **Remote Control**: Handle remote operations like Reset, Unlock, etc.\n' +
          '- 📅 **Reservations**: Manage connector reservation system.\n' +
          '- ⚙️ **Configuration**: Handle OCPP configuration keys.\n\n' +
          '### Architecture\n' +
          '- Follows CLEAN Architecture + SOLID Principles.\n' +
          '- Fully compliant with OCPP 1.6J protocol.\n' +
          '- Uses WebSocket for real-time, bi-directional communication.',
      )
      .setVersion('0.1.0')
      .setContact(
        'OCPP Backend Team',
        'https://github.com/benoit-bremaud/ocpp-charging-backend',
        'support@ocpp-backend.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      // Tags for organizing endpoints
      .addTag('ChargePoints', 'Manage charging stations and their status')
      .addTag('Transactions', 'History and management of charging sessions')
      .addTag('RemoteControl', 'Commands sent to stations (Reset, Unlock, etc.)')
      .addTag('Reservations', 'Planning and reservation of charging connectors')
      .addTag('Health', 'System health and monitoring endpoints')
      // Define the security scheme (JWT Bearer)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This key name will be used in the @ApiBearerAuth() decorator
      )
      // Define server environments
      .addServer('http://localhost:3000', 'Development Environment')
      .addServer('https://api.staging.ocpp.com', 'Staging Environment')
      .build()
  );
}
