export const COLLECTION_NAME = {
  APP_PUSH_TOKEN: 'apppushtokens',
  BLOCK_OTP: 'blockotps',
  CERTIFICATE: 'certificates',
  CONSTANT: 'constants',
  ENROLL_HISTORY: 'studentenrollhistories',
  CURRICULUM_LESSON: 'curriculumlessons',
  CURRICULUM_LESSON_TRACKING: 'curriculumlessontrackings',
  CURRICULUM_LEVEL: 'curriculumlevels',
  CURRICULUM_LEVEL_TRACKING: 'curriculumleveltrackings',
  EVENT_LOG: 'eventlogs',
  FEEDBACK: 'feedbacks',
  FILE_UPLOAD_LOG: 'fileuploadlogs',
  INVOICE: 'invoices',
  KID: 'kids',
  MAIL_COLLECTION: 'mailcollections',
  MEMBERSHIP: 'memberships',
  OTP_CODE: 'otpcodes',
  PARENT: 'parents',
  PAYMENT_CARD: 'paymentcards',
  USER: 'users',
};

export const OTP_ACTION = {
  signup: 'signup',
};

export const otpSignupValidation = 'otpSignupValidation';

export const MEMBER_TYPE = {
  monthly: 'monthly',
  yearly: 'yearly',
  freeTrial: 'freeTrial',
};

export const LOG_ACTION = {
  create: 'create',
  update: 'update',
  remove: 'remove',
};

export enum INVOICE_STATUS {
  processing = 'processing',
  success = 'success',
  fail = 'fail',
}

export enum INVOICE_TYPE {
  trial = 'trial',
  paid = 'paid',
}

export enum ENROLL_STATUS {
  trial = 'trial',
  paid = 'paid',
  cancel = 'cancel',
}

export type INTERVAL_TYPE = 'month' | 'year';

export const PREFIX_DELETE_USER = 'TF-deleted-user';

export const PAYMENT = {
  provider: {
    onePay: 'onePay',
    stripe: 'stripe',
  },
  method: {
    creditCard: 'creditCard',
  },
};

export const MAIL_COLLECTION_TYPE = {
  waitingCustomer: 'waitingCustomer', //guest user just input email for getting information, but not yet login
  leadCustomer: 'leadCustomer', //done signup but dont add payment card
  potentialCustomer: 'potentialCustomer', //done signup, added card but cancel payment before 14 day trial
  paidCustomer: 'paidCustomer', //done signup, added card and done payment
  paidAndLeaveCustomer: 'paidAndLeaveCustomer', //paid customer but dont recur
};

export const tempFolder = 'tmp_data';

export const HOOK_EVENT = {
  customerSubscriptionCreated: 'customer.subscription.created',
  invoicePaid: 'invoice.paid',
};

export const ENV = {
  prod: 'production',
  dev: 'development',
  stage: 'staging',
};
