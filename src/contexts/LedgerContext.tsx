
import { createContext, useContext, ReactNode } from "react";
import { useLedgerData } from "@/hooks/useLedgerData";
import { Transaction, LedgerContextValue } from "@/types/ledger";

const LedgerContext = createContext<LedgerContextValue | undefined>(undefined);

export const LedgerProvider = ({ children }: { children: ReactNode }) => {
  const ledgerData = useLedgerData();

  return (
    <LedgerContext.Provider value={ledgerData}>
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error("useLedger must be used within a LedgerProvider");
  }
  return context;
};

// Re-export the Transaction type for convenience
export type { Transaction };
