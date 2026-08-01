import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext(null);

const STORAGE_KEY = 'coach_finance_data_v3';

// YYYY-MM フォーマットを取得するヘルパー関数
const getFormattedMonth = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const INITIAL_STATE = {
  // 月ごとの目標利益 { "2026-08": 500000 }
  monthlyTargetProfits: {
    [getFormattedMonth()]: 500000
  },
  // 取引データ（type: 'revenue' | 'cost'）
  transactions: [
    {
      id: '1',
      type: 'revenue',
      amount: 50000,
      date: `${getFormattedMonth()}-01`,
      note: 'コーチング契約1件目'
    },
    {
      id: '2',
      type: 'cost',
      amount: 10000,
      date: `${getFormattedMonth()}-02`,
      note: 'ツール利用料・システム費'
    }
  ]
};

export const FinanceProvider = ({ children }) => {
  // 現在選択されている年月 (例: "2026-08")
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

  // 選択中の月の「目標利益」（未設定の場合はデフォルト50万円）
  const targetProfit = state.monthlyTargetProfits[selectedMonth] ?? 500000;

  // 選択中の月の取引リスト
  const currentMonthTransactions = state.transactions.filter(t => 
    t.date.startsWith(selectedMonth)
  );

  // 1. 売上高（Revenue）の合計
  const totalRevenue = currentMonthTransactions.reduce((sum, item) => {
    return item.type === 'revenue' ? sum + item.amount : sum;
  }, 0);

  // 2. コスト（Cost）の合計
  const totalCost = currentMonthTransactions.reduce((sum, item) => {
    return item.type === 'cost' ? sum + item.amount : sum;
  }, 0);

  // 3. 現在の利益（売上高 - コスト）
  const currentProfit = totalRevenue - totalCost;

  // 4. 目標利益に対する達成率（%）- 整数に四捨五入
  const rawProgress = targetProfit > 0
    ? (currentProfit / targetProfit) * 100
    : 0;
  
  // マイナスは0%にし、小数点以下を四捨五入（例: 8%）
  const achievementRate = Math.max(0, Math.round(rawProgress));

  // 取引（売上またはコスト）を追加する関数
  const addTransaction = (amount, note = '', type = 'revenue', dateStr) => {
    if (isNaN(amount) || amount <= 0) return;

    // 日付が指定されていない場合は現在選択中の月の1日を設定
    const targetDate = dateStr || `${selectedMonth}-01`;

    const newTransaction = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type, // 'revenue' または 'cost'
      amount: Number(amount),
      date: targetDate,
      note
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  // 売上を追加
  const addRevenue = (amount, note = '', dateStr) => addTransaction(amount, note, 'revenue', dateStr);

  // コストを追加
  const addCost = (amount, note = '', dateStr) => addTransaction(amount, note, 'cost', dateStr);

  // 取引の削除
  const deleteTransaction = (id) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  // 選択中の月の「目標利益」を設定・更新
  const updateTargetProfit = (profit) => {
    if (isNaN(profit) || profit < 0) return;
    setState(prev => ({
      ...prev,
      monthlyTargetProfits: {
        ...prev.monthlyTargetProfits,
        [selectedMonth]: Number(profit)
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
      targetProfit,            // 目標利益
      totalRevenue,            // 売上高
      totalCost,               // コスト
      currentProfit,           // 現在の利益（売上高 - コスト）
      achievementRate,         // 👈 ここ！ GoalProgressCircleが読み込めるように追加
      profitProgressPercentage: achievementRate, // 互換性のため残す
      transactions: currentMonthTransactions, // 当月の全取引一覧
      addTransaction,          // 取引追加(type指定可)
      addRevenue,              // 売上追加
      addCost,                 // コスト追加
      deleteTransaction,       // 取引削除
      updateTargetProfit,      // 目標利益の更新
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