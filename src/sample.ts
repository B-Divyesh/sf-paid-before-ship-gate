import type { AppData } from './types';

export const sampleData = (): AppData => ({
  orders: [
    { id: 'sample-1', orderNumber: 'SO-1048', customer: 'Moss & Thread', total: 186, paid: 186, currency: 'USD', hold: true, createdAt: '2026-08-27' },
    { id: 'sample-2', orderNumber: 'SO-1049', customer: 'Brighton Pantry', total: 94.5, paid: 0, currency: 'USD', hold: true, createdAt: '2026-08-27' },
    { id: 'sample-3', orderNumber: 'SO-1050', customer: 'Ada Studio', total: 62, paid: 0, currency: 'USD', hold: false, createdAt: '2026-08-28' },
    { id: 'sample-4', orderNumber: 'SO-1051', customer: 'Moss & Thread', total: 225, paid: 100, currency: 'USD', hold: true, createdAt: '2026-08-28' },
    { id: 'sample-5', orderNumber: 'SO-1052', customer: 'North Pier Cafe', total: 48, paid: 48, currency: 'USD', hold: true, createdAt: '2026-08-28' }
  ],
  rules: [{ customer: 'Moss & Thread', hold: true }],
  history: ['Sample workspace loaded'],
  paymentKeys: []
});
