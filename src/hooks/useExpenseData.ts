
import { useState } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';

export const useExpenseData = (expenses: Expense[]) => {
  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    getTotalExpenses,
    getExpensesByCategory
  };
};
