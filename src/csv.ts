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
const cell = (row: string[], headers: string[], names: string[]) => {
  const index = headers.findIndex((header) => names.includes(normalize(header)));
  return index >= 0 ? row[index]?.trim() ?? '' : '';
};

export function importOrders(text: string, data: AppData): { data: AppData; count: number } {
  const [headers, ...rows] = parseCsv(text);
  if (!headers) throw new Error('The file has no header row. Add order_number, customer, and total.');
  const required = ['ordernumber', 'order', 'orderno'];
  if (!headers.some((header) => required.includes(normalize(header)))) throw new Error('No order number column was found. Rename it order_number.');
  const known = new Map(data.orders.map((order) => [order.orderNumber, order]));
  let count = 0;
  for (const row of rows) {
    const orderNumber = cell(row, headers, required);
    if (!orderNumber) continue;
    const customer = cell(row, headers, ['customer', 'customername', 'name']) || 'Redacted customer';
    const total = Number(cell(row, headers, ['total', 'amount', 'ordertotal']).replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(total) || total < 0) throw new Error(`Order ${orderNumber} has an invalid total. Fix that row and try again.`);
    const previous = known.get(orderNumber);
    const holdValue = cell(row, headers, ['hold', 'holduntilpaid', 'paymentrequired']).toLowerCase();
    const currency = (cell(row, headers, ['currency', 'currencycode']) || previous?.currency || 'USD').toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error(`Order ${orderNumber} has an invalid currency. Use a three-letter code such as USD.`);
    const ruleHold = data.rules.some((rule) => normalize(rule.customer) === normalize(customer) && rule.hold);
    const next: Order = {
      id: previous?.id ?? crypto.randomUUID(), orderNumber, customer, total,
      paid: previous?.paid ?? 0,
      currency,
      hold: ['yes', 'true', '1', 'hold'].includes(holdValue) || ruleHold,
      createdAt: cell(row, headers, ['date', 'orderdate']) || previous?.createdAt || new Date().toISOString().slice(0, 10),
      override: previous?.override
    };
    known.set(orderNumber, next); count += 1;
  }
  return { data: { ...data, orders: [...known.values()], history: [`Imported ${count} orders`, ...data.history].slice(0, 30) }, count };
}

export function importPayments(text: string, data: AppData): { data: AppData; count: number } {
  const [headers, ...rows] = parseCsv(text);
  if (!headers) throw new Error('The file has no header row. Add order_number and amount.');
  let count = 0;
  const payments = new Map<string, number>();
  const knownOrders = new Set(data.orders.map((order) => order.orderNumber));
  const seen = new Set(data.paymentKeys ?? []);
  for (const row of rows) {
    const orderNumber = cell(row, headers, ['ordernumber', 'order', 'orderno']);
    const amount = Number(cell(row, headers, ['amount', 'paid', 'paymentamount']).replace(/[^0-9.-]/g, ''));
    if (!orderNumber || !Number.isFinite(amount) || amount <= 0 || !knownOrders.has(orderNumber)) continue;
    const source = row.map((value) => value.trim().toLowerCase()).join('|');
    let hash = 5381;
    for (let index = 0; index < source.length; index += 1) hash = ((hash << 5) + hash) ^ source.charCodeAt(index);
    const key = (hash >>> 0).toString(16);
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
  return ['order_number,customer,total,currency,clearance', ...ready.map((order) => [order.orderNumber, order.customer, order.total.toFixed(2), order.currency || 'USD', order.override ? `Override by ${order.override.name}: ${order.override.reason}` : order.hold ? 'Paid' : 'No payment hold'].map(quote).join(','))].join('\n');
}

export const isReady = (order: Order) => !order.hold || order.paid >= order.total || Boolean(order.override);
