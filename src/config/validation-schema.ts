import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development')
    .required(),

  RMQ_HOST: Joi.string().required(),
  RMQ_PORT: Joi.number().required(),
  RMQ_USER: Joi.string().required(),
  RMQ_PASS: Joi.string().required(),

  ES_API_KEY: Joi.string().required(),
  ES_NODE_ENDPOINTS: Joi.string().required(),
  ES_REJECT_UNAUTHORIZED: Joi.boolean().required().default(false),
});

export default validationSchema;
