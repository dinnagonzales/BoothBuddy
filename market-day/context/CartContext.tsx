import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CartLine } from '@/lib/types';

type CartContextValue = {
  lines: CartLine[];
  editingSaleId: number | null;
  editingSaleNumber: number | null;
  setLines: (lines: CartLine[]) => void;
  setEditingSaleId: (saleId: number | null) => void;
  setEditingSaleNumber: (saleNumber: number | null) => void;
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
  const [editingSaleNumber, setEditingSaleNumber] = useState<number | null>(null);

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
      editingSaleNumber,
      setLines,
      setEditingSaleId,
      setEditingSaleNumber,
      addItem,
      changeQuantity,
      clearCart: () => {
        setLines([]);
        setEditingSaleId(null);
        setEditingSaleNumber(null);
      },
      itemCount,
      totalCents,
    };
  }, [lines, editingSaleId, editingSaleNumber]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
