import type { AppData, Order } from './types';

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field.trim()); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; field = '';
    } else field += char;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const normalize = (value: string) => value.toLowerCase().replace(/[ _-]/g, '');
const headerIndex = (headers: string[], names: string[]) => headers.findIndex((header) => names.includes(normalize(header)));
const cell = (row: string[], headers: string[], names: string[]) => {
  const index = headerIndex(headers, names);
  return index >= 0 ? row[index]?.trim() ?? '' : '';
};
const fingerprint = (value: string) => {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  return (hash >>> 0).toString(16);
};

export type OrderImportChange = { orderNumber: string; details: string[] };

export function importOrders(text: string, data: AppData): { data: AppData; count: number; changes: OrderImportChange[] } {
  const [headers, ...rows] = parseCsv(text);
  if (!headers) throw new Error('The file has no header row. Add order_number, customer, and total.');
  const orderHeaders = ['ordernumber', 'order', 'orderno'];
  const totalHeaders = ['total', 'amount', 'ordertotal'];
  const customerHeaders = ['customer', 'customername', 'name'];
  const holdHeaders = ['hold', 'holduntilpaid', 'paymentrequired'];
  const currencyHeaders = ['currency', 'currencycode'];
  const dateHeaders = ['date', 'orderdate'];
  if (!headers.some((header) => orderHeaders.includes(normalize(header)))) throw new Error('No order number column was found. Rename it order_number.');
  if (!headers.some((header) => totalHeaders.includes(normalize(header)))) throw new Error('No total column was found. Rename it total.');
  const known = new Map(data.orders.map((order) => [order.orderNumber, order]));
  const changes: OrderImportChange[] = [];
  let count = 0;
  for (const row of rows) {
    const orderNumber = cell(row, headers, orderHeaders);
    if (!orderNumber) continue;
    const previous = known.get(orderNumber);
    const customer = cell(row, headers, customerHeaders) || previous?.customer || 'Redacted customer';
    const totalCell = cell(row, headers, totalHeaders);
    if (!totalCell) throw new Error(`Order ${orderNumber} has no total. Add a total and try again.`);
    const total = Number(totalCell.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(total) || total < 0) throw new Error(`Order ${orderNumber} has an invalid total. Fix that row and try again.`);
    const holdValue = cell(row, headers, holdHeaders).toLowerCase();
    const currency = (cell(row, headers, currencyHeaders) || previous?.currency || 'USD').toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error(`Order ${orderNumber} has an invalid currency. Use a three-letter code such as USD.`);
    if (previous && previous.currency !== currency && previous.paid > 0) {
      throw new Error(`Order ${orderNumber} already has ${previous.currency} payments. Its currency cannot change to ${currency}. Add a new order number instead.`);
    }
    let hold = previous?.hold ?? false;
    if (headerIndex(headers, holdHeaders) >= 0 && holdValue) {
      if (['yes', 'true', '1', 'hold'].includes(holdValue)) hold = true;
      else if (['no', 'false', '0', 'ready'].includes(holdValue)) hold = false;
      else throw new Error(`Order ${orderNumber} has an unclear payment hold value. Use yes or no.`);
    }
    const ruleHold = data.rules.some((rule) => normalize(rule.customer) === normalize(customer) && rule.hold);
    if (ruleHold) hold = true;
    const details: string[] = [];
    if (previous) {
      if (previous.total !== total) details.push(`total ${previous.total.toFixed(2)} → ${total.toFixed(2)}`);
      if (previous.currency !== currency) details.push(`currency ${previous.currency} → ${currency}`);
      if (previous.hold !== hold) details.push(hold ? 'payment hold added' : 'payment hold removed');
      if (previous.customer !== customer) details.push(`customer ${previous.customer} → ${customer}`);
    }
    const changesClearDecision = details.some((detail) => detail.startsWith('total ') || detail.startsWith('currency ') || detail.includes('payment hold'));
    if (previous?.override && changesClearDecision) details.push('existing approval removed');
    if (previous?.packedAt && changesClearDecision) details.push('returned to the active board');
    const next: Order = {
      id: previous?.id ?? crypto.randomUUID(), orderNumber, customer, total,
      paid: previous?.paid ?? 0,
      currency,
      hold,
      createdAt: cell(row, headers, dateHeaders) || previous?.createdAt || new Date().toISOString().slice(0, 10),
      ...(previous?.packedAt && !changesClearDecision ? { packedAt: previous.packedAt } : {}),
      ...(previous?.override && !changesClearDecision ? { override: previous.override } : {})
    };
    if (details.length) changes.push({ orderNumber, details });
    known.set(orderNumber, next); count += 1;
  }
  return { data: { ...data, orders: [...known.values()], history: [`Imported ${count} orders`, ...data.history].slice(0, 30) }, count, changes };
}

export function importPayments(text: string, data: AppData): { data: AppData; count: number } {
  const [headers, ...rows] = parseCsv(text);
  if (!headers) throw new Error('The file has no header row. Add order_number and amount.');
  const statusHeaders = ['paymentstatus', 'transactionstatus', 'settlementstatus', 'status'];
  const hasStatus = headerIndex(headers, statusHeaders) >= 0;
  const acceptedStatuses = new Set(['paid', 'successful', 'succeeded', 'complete', 'completed', 'confirmed', 'settled', 'captured']);
  let count = 0;
  const payments = new Map<string, number>();
  const knownOrders = new Map(data.orders.map((order) => [order.orderNumber, order]));
  const seen = new Set(data.paymentKeys ?? []);
  for (const row of rows) {
    const orderNumber = cell(row, headers, ['ordernumber', 'order', 'orderno']);
    const amount = Number(cell(row, headers, ['amount', 'paid', 'paymentamount']).replace(/[^0-9.-]/g, ''));
    const order = knownOrders.get(orderNumber);
    if (!orderNumber || !Number.isFinite(amount) || amount <= 0 || !order) continue;
    if (hasStatus) {
      const paymentStatus = cell(row, headers, statusHeaders);
      if (!acceptedStatuses.has(normalize(paymentStatus))) {
        throw new Error(`Payment for ${orderNumber} has status "${paymentStatus || 'blank'}". Only confirmed or settled payments can be matched.`);
      }
    }
    const paymentCurrency = (cell(row, headers, ['currency', 'currencycode']) || 'USD').toUpperCase();
    if (!/^[A-Z]{3}$/.test(paymentCurrency)) throw new Error(`Payment for ${orderNumber} has an invalid currency. Use a three-letter code such as USD.`);
    if (paymentCurrency !== order.currency) throw new Error(`Payment for ${orderNumber} is ${paymentCurrency}, but the order is ${order.currency}. It was not matched.`);
    const reference = cell(row, headers, ['reference', 'paymentreference', 'transactionid', 'paymentid']);
    const source = reference
      ? `${orderNumber.toLowerCase()}|${paymentCurrency}|reference:${reference.toLowerCase()}`
      : row.map((value) => value.trim().toLowerCase()).join('|');
    const key = fingerprint(source);
    if (seen.has(key)) continue;
    seen.add(key);
    payments.set(orderNumber, (payments.get(orderNumber) ?? 0) + amount); count += 1;
  }
  if (count === 0) throw new Error('No new payments matched. Check order numbers or add a unique reference column.');
  const orders = data.orders.map((order) => payments.has(order.orderNumber) ? { ...order, paid: order.paid + payments.get(order.orderNumber)! } : order);
  return { data: { ...data, orders, paymentKeys: [...seen], history: [`Matched ${count} payments`, ...data.history].slice(0, 30) }, count };
}

export function packListCsv(orders: Order[]): string {
  const ready = orders.filter(isReady);
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return ['order_number,customer,total,currency,clearance', ...ready.map((order) => [order.orderNumber, order.customer, order.total.toFixed(2), order.currency || 'USD', order.override ? `Approval by ${order.override.name}: ${order.override.reason}` : order.hold ? 'Paid' : 'No payment hold'].map(quote).join(','))].join('\n');
}

export const isReady = (order: Order) => !order.packedAt && (!order.hold || order.paid >= order.total || Boolean(order.override));
