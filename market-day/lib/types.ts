export type PaymentMethod = 'cash' | 'venmo_zelle' | 'pay_on_pickup';

export type CancelReason = 'return' | 'error';

export type Item = {
  id: number;
  name: string;
  icon: string;
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
  icon: string;
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
  changeKept: boolean;
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  isPreorder: boolean;
  cancelled: boolean;
  cancelReason: CancelReason | null;
  cancelNote: string | null;
  createdAt: string;
};

export type SaleSummary = {
  saleNumber: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  cancelled: boolean;
  cancelReason: CancelReason | null;
  cancelNote: string | null;
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
