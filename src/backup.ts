import type { AppData, CustomerRule, Order } from './types';

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new BackupValidationError(`${field} must be a non-empty text value.`);
  return value.trim();
}

function amount(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new BackupValidationError(`${field} must be a non-negative number.`);
  return value;
}

function order(value: unknown, index: number): Order {
  if (!isRecord(value)) throw new BackupValidationError(`Order ${index + 1} must be an object.`);
  const orderNumber = text(value.orderNumber, `Order ${index + 1} number`);
  const currency = text(value.currency, `Order ${orderNumber} currency`).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new BackupValidationError(`Order ${orderNumber} has an invalid currency code. Use a three-letter code such as USD.`);
  if (typeof value.hold !== 'boolean') throw new BackupValidationError(`Order ${orderNumber} hold must be true or false.`);

  let override: Order['override'];
  if (value.override !== undefined) {
    if (!isRecord(value.override)) throw new BackupValidationError(`Order ${orderNumber} override must include a name, reason, and date.`);
    override = {
      name: text(value.override.name, `Order ${orderNumber} override name`),
      reason: text(value.override.reason, `Order ${orderNumber} override reason`),
      at: text(value.override.at, `Order ${orderNumber} override date`)
    };
  }

  return {
    id: text(value.id, `Order ${orderNumber} id`),
    orderNumber,
    customer: text(value.customer, `Order ${orderNumber} customer`),
    total: amount(value.total, `Order ${orderNumber} total`),
    paid: amount(value.paid, `Order ${orderNumber} paid amount`),
    currency,
    hold: value.hold,
    createdAt: text(value.createdAt, `Order ${orderNumber} date`),
    ...(value.packedAt === undefined ? {} : { packedAt: text(value.packedAt, `Order ${orderNumber} packed date`) }),
    ...(override ? { override } : {})
  };
}

function rule(value: unknown, index: number): CustomerRule {
  if (!isRecord(value)) throw new BackupValidationError(`Customer rule ${index + 1} must be an object.`);
  if (typeof value.hold !== 'boolean') throw new BackupValidationError(`Customer rule ${index + 1} hold must be true or false.`);
  return { customer: text(value.customer, `Customer rule ${index + 1} customer`), hold: value.hold };
}

/** Converts untrusted backup JSON into the exact shape the board can render. */
export function validateBackup(value: unknown): AppData {
  if (!isRecord(value) || !Array.isArray(value.orders) || !Array.isArray(value.rules) || !Array.isArray(value.history)) {
    throw new BackupValidationError('This backup must include orders, rules, and history lists from Paid Before Ship Gate.');
  }

  const orders = value.orders.map(order);
  const ids = new Set<string>();
  const numbers = new Set<string>();
  for (const item of orders) {
    if (ids.has(item.id)) throw new BackupValidationError(`Order ${item.orderNumber} repeats an order id.`);
    if (numbers.has(item.orderNumber.toLowerCase())) throw new BackupValidationError(`Order ${item.orderNumber} repeats an order number.`);
    ids.add(item.id); numbers.add(item.orderNumber.toLowerCase());
  }

  const rules = value.rules.map(rule);
  const history = value.history.map((item, index) => text(item, `History entry ${index + 1}`));
  let paymentKeys: string[] | undefined;
  if (value.paymentKeys !== undefined) {
    if (!Array.isArray(value.paymentKeys)) throw new BackupValidationError('Payment keys must be a list when present.');
    paymentKeys = value.paymentKeys.map((item, index) => text(item, `Payment key ${index + 1}`));
  }
  return { orders, rules, history, ...(paymentKeys ? { paymentKeys } : {}) };
}
