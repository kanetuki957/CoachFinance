import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext(null);

const STORAGE_KEY = 'coach_finance_data_v1';

const INITIAL_STATE = {
  monthlyGoal: 500000, // 初期設定: 今月の目標 50万円
  transactions: [
    // 初期サンプルデータ
    { id: '1', amount: 50000, date: new Date().toISOString().split('T')[0], note: 'コーチング契約1件目' }
  ]
};

export const FinanceProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load state from LocalStorage', e);
      }
    }
    return INITIAL_STATE;
  });

  // 状態の変更をLocalStorageへ同期
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 今月の合計金額を計算
  const currentMonthTotal = state.transactions.reduce((sum, item) => {
    const itemDate = new Date(item.date);
    const now = new Date();
    // 今月・今年のデータのみを集計
    if (itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()) {
      return sum + item.amount;
    }
    return sum;
  }, 0);

  // 達成率（%）の計算（上限なし・下限0%）
  const progressPercentage = state.monthlyGoal > 0 
    ? Math.max(0, (currentMonthTotal / state.monthlyGoal) * 100) 
    : 0;

  // 収益（利益）の追加
  const addTransaction = (amount, note = '') => {
    if (isNaN(amount) || amount === 0) return;

    const newTransaction = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      note
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  // 目標金額の更新
  const updateMonthlyGoal = (goal) => {
    if (isNaN(goal) || goal < 0) return;
    setState(prev => ({ ...prev, monthlyGoal: Number(goal) }));
  };

  return (
    <FinanceContext.Provider value={{
      monthlyGoal: state.monthlyGoal,
      transactions: state.transactions,
      currentMonthTotal,
      progressPercentage,
      addTransaction,
      updateMonthlyGoal
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};