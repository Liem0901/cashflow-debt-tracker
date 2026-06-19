import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import {
  createInitialData,
  generateId,
} from '../data/initialData';
import { getCurrentMonthKey } from '../utils/formatters';
import {
  getCashExpenses,
  getTotalExpenses,
  getUpcomingDebtTotal,
  getSafeBalance,
  getDebtsDueThisMonth,
  getRecentTransactions,
  getTotalActiveDebt,
  getCategorySpending,
} from '../utils/calculations';
import { getWarnings } from '../utils/warnings';
import LoadingScreen from '../components/ui/LoadingScreen';

const AppContext = createContext(null);

function checkMonthReset(data) {
  const currentMonth = getCurrentMonthKey();
  if (data.currentMonth === currentMonth) return data;

  const archived = {
    month: data.currentMonth,
    transactions: data.transactions,
    debtsSnapshot: data.debts.map((d) => ({ ...d })),
    cashExpenses: getCashExpenses(data.transactions, data.currentMonth),
    archivedAt: new Date().toISOString(),
  };

  return {
    ...data,
    currentMonth,
    archivedMonths: [...(data.archivedMonths || []), archived],
  };
}

export function AppProvider({ children }) {
  const { data, setData, loading, syncStatus } = useAppData();

  useEffect(() => {
    if (loading) return;
    setData((prev) => checkMonthReset(prev));
  }, [loading, setData]);

  const monthKey = data.currentMonth || getCurrentMonthKey();

  const stats = useMemo(() => {
    const totalExpenses = getTotalExpenses(data.transactions, monthKey, data.debts);
    const cashExpenses = getCashExpenses(data.transactions, monthKey);
    const upcomingDebt = getUpcomingDebtTotal(data.debts, monthKey, data.transactions);
    const safeBalance = getSafeBalance(data.salary, totalExpenses, upcomingDebt);
    const totalActiveDebt = getTotalActiveDebt(data.debts);
    const categorySpending = getCategorySpending(data.transactions, monthKey);
    const debtsDueThisMonth = getDebtsDueThisMonth(data.debts, monthKey);
    const recentTransactions = getRecentTransactions(data.transactions);
    const warnings = getWarnings({
      salary: data.salary,
      safeBalance,
      upcomingDebt,
      debts: data.debts,
    });

    return {
      cashExpenses,
      totalExpenses,
      upcomingDebt,
      safeBalance,
      totalActiveDebt,
      categorySpending,
      debtsDueThisMonth,
      recentTransactions,
      warnings,
    };
  }, [data, monthKey]);

  const updateSalary = useCallback(
    (salary, paydayDate) => {
      setData((prev) => ({
        ...prev,
        salary: Number(salary),
        paydayDate: Number(paydayDate),
      }));
    },
    [setData]
  );

  const updateBudgets = useCallback(
    (budgets) => {
      setData((prev) => ({ ...prev, budgets }));
    },
    [setData]
  );

  const addCashTransaction = useCallback(
    ({ amount, category, description, date, paymentMethod = 'cash' }) => {
      const transaction = {
        id: generateId('tx'),
        type: 'cash',
        amount: Number(amount),
        category,
        description: description || '',
        date,
        paymentMethod,
      };
      setData((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
      }));
      return transaction;
    },
    [setData]
  );

  const addDebtTransaction = useCallback(
    ({ amount, provider, category, dueDate, description }) => {
      const debt = {
        id: generateId('debt'),
        name: provider,
        amount: Number(amount),
        remaining: Number(amount),
        dueDate,
        category,
        status: 'active',
      };
      const transaction = {
        id: generateId('tx'),
        type: 'debt',
        debtId: debt.id,
        amount: Number(amount),
        category,
        description: description || provider,
        date: dueDate,
      };
      setData((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
        debts: [debt, ...prev.debts],
      }));
      return { transaction, debt };
    },
    [setData]
  );

  const addDebtManually = useCallback(
    ({ name, amount, dueDate, category }) => {
      const debt = {
        id: generateId('debt'),
        name,
        amount: Number(amount),
        remaining: Number(amount),
        dueDate,
        category: category || 'Other',
        status: 'active',
      };
      setData((prev) => ({
        ...prev,
        debts: [debt, ...prev.debts],
      }));
      return debt;
    },
    [setData]
  );

  const payDebt = useCallback(
    (debtId, paymentAmount) => {
      setData((prev) => ({
        ...prev,
        debts: prev.debts.map((d) => {
          if (d.id !== debtId) return d;
          const remaining = Math.max(0, Number(d.remaining) - Number(paymentAmount));
          return {
            ...d,
            remaining,
            status: remaining === 0 ? 'paid' : 'active',
          };
        }),
      }));
    },
    [setData]
  );

  const markDebtPaid = useCallback(
    (debtId) => {
      setData((prev) => ({
        ...prev,
        debts: prev.debts.map((d) =>
          d.id === debtId ? { ...d, remaining: 0, status: 'paid' } : d
        ),
      }));
    },
    [setData]
  );

  const markDebtUnpaid = useCallback(
    (debtId) => {
      setData((prev) => ({
        ...prev,
        debts: prev.debts.map((d) =>
          d.id === debtId
            ? { ...d, remaining: Number(d.amount), status: 'active' }
            : d
        ),
      }));
    },
    [setData]
  );

  const updateTransaction = useCallback(
    (transactionId, updates) => {
      setData((prev) => {
        const existing = prev.transactions.find((t) => t.id === transactionId);
        const nextDebts =
          existing?.debtId && updates.date
            ? prev.debts.map((d) =>
                d.id === existing.debtId ? { ...d, dueDate: updates.date } : d
              )
            : prev.debts;

        return {
          ...prev,
          debts: nextDebts,
          transactions: prev.transactions.map((t) => {
            if (t.id !== transactionId) return t;
            return {
              ...t,
              ...updates,
              amount: Number(updates.amount ?? t.amount),
            };
          }),
        };
      });
    },
    [setData]
  );

  const deleteTransaction = useCallback(
    (transactionId) => {
      setData((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== transactionId),
      }));
    },
    [setData]
  );

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback(
    (jsonString) => {
      const parsed = JSON.parse(jsonString);
      if (!parsed.transactions || !parsed.debts) {
        throw new Error('Invalid data format');
      }
      setData(parsed, { immediate: true });
    },
    [setData]
  );

  const clearData = useCallback(() => {
    setData(createInitialData(), { immediate: true });
  }, [setData]);

  const value = useMemo(
    () => ({
      data,
      monthKey,
      stats,
      syncStatus,
      updateSalary,
      updateBudgets,
      addCashTransaction,
      addDebtTransaction,
      addDebtManually,
      payDebt,
      markDebtPaid,
      markDebtUnpaid,
      updateTransaction,
      deleteTransaction,
      exportData,
      importData,
      clearData,
    }),
    [
      data,
      monthKey,
      stats,
      syncStatus,
      updateSalary,
      updateBudgets,
      addCashTransaction,
      addDebtTransaction,
      addDebtManually,
      payDebt,
      markDebtPaid,
      markDebtUnpaid,
      updateTransaction,
      deleteTransaction,
      exportData,
      importData,
      clearData,
    ]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
