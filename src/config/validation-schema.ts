import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development')
    .required(),
  API_KEY: Joi.string().required(),

  RMQ_HOST: Joi.string().required(),
  RMQ_PORT: Joi.number().required(),
  RMQ_USER: Joi.string().required(),
  RMQ_PASS: Joi.string().required(),

  // ES_API_KEY: Joi.string().required(),
  ES_USER_NAME: Joi.string().required(),
  ES_USER_PASSWORD: Joi.string().required(),
  ES_NODE_ENDPOINTS: Joi.string().required(),
  ES_REJECT_UNAUTHORIZED: Joi.boolean().required().default(false),
  ES_SECURE: Joi.boolean().required().default(true),
});

export default validationSchema;
