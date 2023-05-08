export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserRole {
  KID = 'kid',
  PARENT = 'parent',
  CLASS = 'class',
  EDUCATIONAL_ORG = 'educator',
}

export enum Status {
  COMPLETED = 'completed',
  INPROGRESS = 'inProgress',
  UPCOMING = 'upComing',
}

export enum MailCollectionType {
  waitingCustomer = 'waitingCustomer', //guest user just input email for getting information, but not yet login
  leadCustomer = 'leadCustomer', //done signup but dont add payment card
  potentialCustomer = 'potentialCustomer', //done signup, added card but cancel payment before 14 day trial
  paidCustomer = 'paidCustomer', //done signup, added card and done payment
  paidAndLeaveCustomer = 'paidAndLeaveCustomer', //paid
}
