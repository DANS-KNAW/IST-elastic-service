import { registerAs } from '@nestjs/config';

export const CONFIG_ES = 'es';

export default registerAs(CONFIG_ES, () => ({
  apiKey: process.env.ES_API_KEY,
  poolEndpoints: process.env.ES_NODE_ENDPOINTS.split(','),
  rejectUnauthorized: process.env.ES_REJECT_UNAUTHORIZED === 'true',
  clusterSecure: process.env.ES_SECURE === 'true',
}));
