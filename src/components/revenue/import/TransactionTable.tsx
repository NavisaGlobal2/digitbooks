
import React from "react";
import { ParsedTransaction } from "./parsers/types";
import { RevenueSource } from "@/types/revenue";
import { formatCurrency } from "@/utils/invoice/formatters";
import { format } from "date-fns";

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onSelectTransaction: (id: string, checked: boolean) => void;
  onSetSource: (id: string, source: RevenueSource) => void;
}

const TransactionTable = ({
  transactions,
  onSelectTransaction,
  onSetSource
}: TransactionTableProps) => {
  // Revenue source options
  const sourceOptions: { value: RevenueSource; label: string }[] = [
    { value: "sales", label: "Sales" },
    { value: "consulting", label: "Consulting" },
    { value: "investments", label: "Investments" },
    { value: "rental", label: "Rental" },
    { value: "grants", label: "Grants" },
    { value: "donations", label: "Donations" },
    { value: "royalties", label: "Royalties" },
    { value: "affiliate", label: "Affiliate" },
    { value: "other", label: "Other" }
  ];

  // Format a date safely
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "—";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get confidence label based on confidence score
  const getConfidenceLabel = (confidence: number | undefined): string => {
    if (!confidence) return "Low";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  // Get class based on confidence score
  const getConfidenceClass = (confidence: number | undefined): string => {
    if (!confidence) return "bg-gray-100 text-gray-500";
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div className="overflow-auto flex-grow">
      <table className="w-full">
        <thead className="bg-gray-50 border-y">
          <tr>
            <th className="w-16 px-4 py-2 text-left">
              <span className="sr-only">Select</span>
            </th>
            <th className="w-32 px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
            <th className="w-32 px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
            <th className="w-48 px-4 py-2 text-left text-sm font-medium text-gray-500">Source</th>
          </tr>
        </thead>
        
        <tbody className="divide-y">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={tx.selected}
                    onChange={(e) => onSelectTransaction(tx.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(tx.date)}
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">
                  {tx.description}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <select
                      value={tx.source || (tx.sourceSuggestion?.source || '')}
                      onChange={(e) => onSetSource(tx.id, e.target.value as RevenueSource)}
                      className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select source</option>
                      {sourceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} {tx.sourceSuggestion?.source === option.value ? '(Suggested)' : ''}
                        </option>
                      ))}
                    </select>
                    
                    {tx.sourceSuggestion && !tx.source && (
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceClass(tx.sourceSuggestion.confidence)}`}
                        title={`${(tx.sourceSuggestion.confidence * 100).toFixed(0)}% confidence`}
                      >
                        {getConfidenceLabel(tx.sourceSuggestion.confidence)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
