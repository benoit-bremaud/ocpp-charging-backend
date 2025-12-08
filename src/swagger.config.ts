import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Creates the centralized configuration for Swagger (OpenAPI) documentation.
 * Uses environment variables to dynamically set server URLs based on deployment environment.
 */
export function createSwaggerConfig() {
  // Get environment variables
  const nodeEnv = process.env.NODE_ENV || 'development';
  const apiPort = process.env.API_PORT || 3001;
  const apiHost = process.env.API_HOST || 'localhost';
  const stagingUrl = process.env.STAGING_URL || 'https://api.staging.ocpp.com';
  const productionUrl = process.env.PRODUCTION_URL || 'https://api.ocpp.com';

  // Build dynamic servers array
  const servers = [
    {
      url: `http://${apiHost}:${apiPort}`,
      description: 'Development Environment',
    },
  ];

  // Add staging and production servers if not in development
  if (nodeEnv !== 'development') {
    servers.push({
      url: stagingUrl,
      description: 'Staging Environment',
    });
    servers.push({
      url: productionUrl,
      description: 'Production Environment',
    });
  }

  const config = new DocumentBuilder()
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
      'JWT-auth',
    );

  // Add dynamic servers
  servers.forEach((server) => {
    config.addServer(server.url, server.description);
  });

  return config.build();
}
