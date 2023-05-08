export abstract class GatewayAbstract {
  convertAmountByCurrency(amount: number, currency: string) {
    switch (currency) {
      case '$':
        amount *= 23000;
        break;
    }
    return amount;
  }

  abstract subscriptions(params: any): any;
  abstract generateInvoice(params: any): any;
}
