import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext(null);

const STORAGE_KEY = 'coach_finance_data_v2';

// 今月の YYYY-MM フォーマットを取得するヘルパー関数
const getFormattedMonth = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const INITIAL_STATE = {
  // 月ごとの目標 { "2026-07": 500000 }
  monthlyGoals: {
    [getFormattedMonth()]: 500000
  },
  transactions: [
    {
      id: '1',
      amount: 50000,
      date: `${getFormattedMonth()}-01`,
      note: 'コーチング契約1件目'
    }
  ]
};

export const FinanceProvider = ({ children }) => {
  // 現在選択されている年月 (例: "2026-07")
  const [selectedMonth, setSelectedMonth] = useState(getFormattedMonth());

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

  // 状態の変更をLocalStorageへ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 選択中の月の目標金額を取得（未設定の場合はデフォルト50万円）
  const currentGoal = state.monthlyGoals[selectedMonth] ?? 500000;

  // 選択中の月の合計実績金額を計算
  const currentMonthTotal = state.transactions.reduce((sum, item) => {
    if (item.date.startsWith(selectedMonth)) {
      return sum + item.amount;
    }
    return sum;
  }, 0);

  // 選択中の月の達成率（%）
  const progressPercentage = currentGoal > 0 
    ? Math.max(0, (currentMonthTotal / currentGoal) * 100) 
    : 0;

  // 選択中の月の指定日（デフォルトは本日）にトランザクションを追加
  const addTransaction = (amount, note = '', dateStr) => {
    if (isNaN(amount) || amount === 0) return;

    // 日付未指定時は選択中の月の今日（もしくはその月の1日）を設定
    const targetDate = dateStr || `${selectedMonth}-${String(new Date().getDate()).padStart(2, '0')}`;

    const newTransaction = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      date: targetDate,
      note
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  // 選択中の月の目標金額を設定・更新
  const updateMonthlyGoal = (goal) => {
    if (isNaN(goal) || goal < 0) return;
    setState(prev => ({
      ...prev,
      monthlyGoals: {
        ...prev.monthlyGoals,
        [selectedMonth]: Number(goal)
      }
    }));
  };

  // 月を切り替える (例: offset = -1 で前月, +1 で翌月)
  const changeMonth = (offset) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(getFormattedMonth(date));
  };

  return (
    <FinanceContext.Provider value={{
      selectedMonth,
      monthlyGoal: currentGoal,
      transactions: state.transactions.filter(t => t.date.startsWith(selectedMonth)),
      currentMonthTotal,
      progressPercentage,
      addTransaction,
      updateMonthlyGoal,
      changeMonth,
      setSelectedMonth
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