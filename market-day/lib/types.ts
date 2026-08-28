export type PaymentMethod = 'cash' | 'venmo_zelle';

export type Item = {
  id: number;
  name: string;
  emoji: string;
  photoUri: string | null;
  costCents: number;
  priceCents: number;
  retired: boolean;
};

export type MarketDay = {
  id: number;
  name: string;
  startedAt: string;
  closedAt: string | null;
  exportedAt: string | null;
};

export type CartLine = {
  itemId: number;
  name: string;
  emoji: string;
  priceCents: number;
  costCents: number;
  quantity: number;
};

export type Sale = {
  id: number;
  saleNumber: number;
  marketDayId: number | null;
  totalCents: number;
  paymentMethod: PaymentMethod;
  cashReceivedCents: number | null;
  createdAt: string;
};
