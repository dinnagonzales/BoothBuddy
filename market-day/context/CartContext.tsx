import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CartLine, PaymentMethod } from '@/lib/types';
import { defaultCompleteDate } from '@/lib/market-day';

type CartContextValue = {
  lines: CartLine[];
  editingSaleId: number | null;
  editingPaymentMethod: PaymentMethod | null;
  editingCashReceivedCents: number | null;
  editingChangeKept: boolean;
  invoiceNumber: number | null;
  saleName: string;
  saleNotes: string;
  saleCompleteDate: string;
  isQuickSale: boolean;
  isPreorder: boolean;
  setLines: (lines: CartLine[]) => void;
  setEditingSaleId: (saleId: number | null) => void;
  setEditingPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
  setEditingCashReceivedCents: (cashReceivedCents: number | null) => void;
  setEditingChangeKept: (changeKept: boolean) => void;
  setInvoiceNumber: (saleNumber: number | null) => void;
  setSaleName: (name: string) => void;
  setSaleNotes: (notes: string) => void;
  setSaleCompleteDate: (completeDate: string) => void;
  setIsQuickSale: (value: boolean) => void;
  setIsPreorder: (value: boolean) => void;
  addItem: (line: Omit<CartLine, 'quantity'>) => void;
  changeQuantity: (itemId: number, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [editingCashReceivedCents, setEditingCashReceivedCents] = useState<number | null>(null);
  const [editingChangeKept, setEditingChangeKept] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<number | null>(null);
  const [saleName, setSaleName] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [saleCompleteDate, setSaleCompleteDate] = useState(defaultCompleteDate);
  const [isQuickSale, setIsQuickSale] = useState(false);
  const [isPreorder, setIsPreorder] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (line: Omit<CartLine, 'quantity'>) => {
      setLines((current) => {
        const existing = current.find((entry) => entry.itemId === line.itemId);
        if (existing) {
          return current.map((entry) =>
            entry.itemId === line.itemId
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          );
        }
        return [...current, { ...line, quantity: 1 }];
      });
    };

    const changeQuantity = (itemId: number, delta: number) => {
      setLines((current) =>
        current
          .map((entry) =>
            entry.itemId === itemId
              ? { ...entry, quantity: entry.quantity + delta }
              : entry,
          )
          .filter((entry) => entry.quantity > 0),
      );
    };

    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalCents = lines.reduce(
      (sum, line) => sum + line.priceCents * line.quantity,
      0,
    );

    return {
      lines,
      editingSaleId,
      editingPaymentMethod,
      editingCashReceivedCents,
      editingChangeKept,
      invoiceNumber,
      saleName,
      saleNotes,
      saleCompleteDate,
      isQuickSale,
      isPreorder,
      setLines,
      setEditingSaleId,
      setEditingPaymentMethod,
      setEditingCashReceivedCents,
      setEditingChangeKept,
      setInvoiceNumber,
      setSaleName,
      setSaleNotes,
      setSaleCompleteDate,
      setIsQuickSale,
      setIsPreorder,
      addItem,
      changeQuantity,
      clearCart: () => {
        setLines([]);
        setEditingSaleId(null);
        setEditingPaymentMethod(null);
        setEditingCashReceivedCents(null);
        setEditingChangeKept(false);
        setInvoiceNumber(null);
        setSaleName('');
        setSaleNotes('');
        setSaleCompleteDate(defaultCompleteDate());
        setIsQuickSale(false);
        setIsPreorder(false);
      },
      itemCount,
      totalCents,
    };
  }, [lines, editingSaleId, editingPaymentMethod, editingCashReceivedCents, editingChangeKept, invoiceNumber, saleName, saleNotes, saleCompleteDate, isQuickSale, isPreorder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
