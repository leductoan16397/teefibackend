export interface ICreate {
  create: (params: any) => any;
}

export interface IRetrieve {
  retrieve: (params: any) => any;
}

export interface IUpdate {
  update: (params: any) => any;
}

export interface IList {
  getList: (params?: any) => any;
}

export interface ICancel {
  cancel: (params?: any) => any;
}
