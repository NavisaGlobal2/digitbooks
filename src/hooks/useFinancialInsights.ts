
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface FinancialDataSummary {
  invoices: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    recentPayments: any[];
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    recent: any[];
  };
  revenues: {
    total: number;
    bySources: Record<string, number>;
    recent: any[];
  };
  cashflow: {
    netCashflow: number;
    trend: 'positive' | 'negative' | 'stable';
  };
}

export const useFinancialInsights = () => {
  const [financialData, setFinancialData] = useState<FinancialDataSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Fetch invoices data
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id);

        if (invoicesError) throw invoicesError;

        // Fetch recent payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('invoice_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })
          .limit(5);

        if (paymentsError) throw paymentsError;

        // Fetch expenses data
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id);

        if (expensesError) throw expensesError;

        // Fetch revenues data
        const { data: revenuesData, error: revenuesError } = await supabase
          .from('revenues')
          .select('*')
          .eq('user_id', user.id);

        if (revenuesError) throw revenuesError;

        // Process invoices data
        const paidInvoices = invoicesData?.filter(inv => inv.status === 'paid') || [];
        const unpaidInvoices = invoicesData?.filter(inv => inv.status === 'pending') || [];
        const overdueInvoices = invoicesData?.filter(inv => 
          inv.status === 'pending' && new Date(inv.due_date) < new Date()
        ) || [];

        // Process expenses by category
        const expensesByCategory = expensesData?.reduce((acc: Record<string, number>, expense) => {
          const category = expense.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + Number(expense.amount);
          return acc;
        }, {}) || {};

        // Process revenues by source
        const revenuesBySources = revenuesData?.reduce((acc: Record<string, number>, revenue) => {
          const source = revenue.source || 'Uncategorized';
          acc[source] = (acc[source] || 0) + Number(revenue.amount);
          return acc;
        }, {}) || {};

        // Calculate total paid and total expenses
        const totalRevenue = revenuesData?.reduce((sum, revenue) => 
          sum + Number(revenue.amount), 0) || 0;
        const totalExpenses = expensesData?.reduce((sum, expense) => 
          sum + Number(expense.amount), 0) || 0;

        // Format the data summary
        const summary: FinancialDataSummary = {
          invoices: {
            total: invoicesData?.length || 0,
            paid: paidInvoices.length,
            unpaid: unpaidInvoices.length,
            overdue: overdueInvoices.length,
            recentPayments: paymentsData || []
          },
          expenses: {
            total: totalExpenses,
            byCategory: expensesByCategory,
            recent: (expensesData || []).sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 5)
          },
          revenues: {
            total: totalRevenue,
            bySources: revenuesBySources,
            recent: (revenuesData || []).sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 5)
          },
          cashflow: {
            netCashflow: totalRevenue - totalExpenses,
            trend: totalRevenue > totalExpenses ? 'positive' : 
                  totalRevenue < totalExpenses ? 'negative' : 'stable'
          }
        };

        setFinancialData(summary);
      } catch (err: any) {
        console.error("Error fetching financial data:", err);
        setError(err.message || 'Failed to fetch financial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [user]);

  return { financialData, isLoading, error };
};
