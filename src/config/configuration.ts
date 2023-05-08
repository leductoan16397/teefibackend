export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_LIVE_MODE: process.env.IS_LIVE_MODE || 1,
  PORT: process.env.PORT || 4000,
  BODY_LIMIT: parseInt(process.env.BODY_LIMIT) || 52428800 /* 50mb */,

  AWS_CLOUD_FRONT_URL: process.env.AWS_CLOUD_FRONT_URL || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || '',
  AWS_REGION: process.env.AWS_REGION || '',
  AWS_BUCKET: process.env.AWS_BUCKET || '',

  MONGODB_NAME: process.env.MONGODB_NAME || 'teefi-dev-elearning',
  MONGODB_USERNAME: process.env.MONGODB_USERNAME || 'teefi-dev-elearning',
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD || 'teefi2023',
  MONGODB_URI: process.env.MONGODB_URI || '',

  SECRET_KEY: process.env.SECRET_KEY || 'T@@fi2023',
  BCRYPT_SALT: process.env.BCRYPT_SALT || '',
  TOKEN_EXPIRE_TIME: process.env.TOKEN_EXPIRE_TIME || '',

  CLIENT_APP_URL: process.env.CLIENT_APP_URL || 'https://develop.teefi.io',
  APP_URL: process.env.APP_URL || 'https://devapi.teefi.io',

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  SENDGRID_MAIL_FROM: process.env.SENDGRID_MAIL_FROM || '',

  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
});
