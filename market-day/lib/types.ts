export type PaymentMethod = 'cash' | 'venmo_zelle' | 'pay_on_pickup';

export type Item = {
  id: number;
  name: string;
  emoji: string;
  photoUri: string | null;
  costCents: number;
  priceCents: number;
  archived: boolean;
};

export type MarketDay = {
  id: number;
  name: string;
  startedAt: string;
  closedAt: string | null;
  exportedAt: string | null;
  needsReexport: boolean;
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
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  isPreorder: boolean;
  createdAt: string;
};

export type SaleSummary = {
  saleNumber: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  createdAt: string;
};

export type AllTimeSaleSummary = SaleSummary & {
  marketDayName: string | null;
};

export type ClosedMarketDaySummary = {
  id: number;
  name: string;
  startedAt: string;
  closedAt: string;
  saleCount: number;
};
