import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type GrownUpSessionContextValue = {
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
};

const GrownUpSessionContext = createContext<GrownUpSessionContextValue | null>(null);

export function GrownUpSessionProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  const unlock = useCallback(() => {
    setUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    setUnlocked(false);
  }, []);

  const value = useMemo(
    () => ({
      unlocked,
      unlock,
      lock,
    }),
    [unlocked, unlock, lock],
  );

  return (
    <GrownUpSessionContext.Provider value={value}>{children}</GrownUpSessionContext.Provider>
  );
}

export function useGrownUpSession() {
  const context = useContext(GrownUpSessionContext);
  if (!context) {
    throw new Error('useGrownUpSession must be used within GrownUpSessionProvider');
  }
  return context;
}
