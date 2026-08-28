export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  paid: number;
  hold: boolean;
  createdAt: string;
  override?: { name: string; reason: string; at: string };
};

export type CustomerRule = { customer: string; hold: boolean };

export type AppData = {
  orders: Order[];
  rules: CustomerRule[];
  history: string[];
  paymentKeys?: string[];
};

export type Filter = 'all' | 'ready' | 'hold';
