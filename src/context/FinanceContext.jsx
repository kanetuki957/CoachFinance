import React, { createContext, useContext, useEffect, useState } from 'react';

const GoalContext = createContext(null);
const STORAGE_KEY = 'coach_goal_data_v1';

const getLocalDateKey = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

export const GOAL_CATEGORIES = [
  {
    id: 'exercise',
    icon: '🏋️',
    name: '筋トレ・運動',
    color: 'emerald',
    goals: [
      '1週間だけ筋トレする',
      '毎日10分だけ運動する',
      '1週間で腕立て伏せを合計100回する',
      '毎日5,000歩以上歩く',
      '1週間で腹筋を合計100回する',
    ],
  },
  {
    id: 'study',
    icon: '📚',
    name: '勉強・資格',
    color: 'sky',
    goals: [
      '毎日30分勉強して、1週間で3時間以上勉強する',
      '参考書を10ページ進める',
      'プログラミングを毎日30分、1週間続ける',
      '資格の問題を50問解く',
      '新しい知識を1つ身につける',
    ],
  },
  {
    id: 'life',
    icon: '🌱',
    name: '生活・習慣',
    color: 'amber',
    goals: [
      '毎朝決めた時間に起きる',
      '寝る前に5分だけ部屋を片付ける',
      '1日1回、感謝したことを記録する',
      '水を1日1.5リットル飲む',
      'SNSを見ない時間を1時間つくる',
    ],
  },
];

export const DAILY_TASKS = {
  exercise: [
    ['筋トレする時間を決める', 'トレーニングメニューを決める', '10分間筋トレする'],
    ['10分間筋トレする', '前日の記録を確認する'],
    ['15分間筋トレする', 'タンパク質を意識して食事する'],
    ['休養する', '5分間ストレッチする'],
    ['15分間筋トレする', '前回より1種目多く取り組む'],
    ['20分間筋トレする', 'これまでの成果を記録する'],
    ['20分間筋トレする', '1週間のトレーニングを振り返る', '目標達成 🎉'],
  ],
  study: [
    ['勉強する時間と場所を決める', '10分間だけ取り組む', '今日学ぶことを1つ決める'],
    ['30分間勉強する', '前日の内容を5分復習する'],
    ['30分間勉強する', 'わからなかったことを調べる'],
    ['20分間復習する', '5分休憩して学習環境を整える'],
    ['30分間勉強する', '問題を5問解く'],
    ['30分間勉強する', '学んだことをメモにまとめる'],
    ['30分間勉強する', '1週間の学びを振り返る', '目標達成 🎉'],
  ],
  life: [
    ['今日の習慣を行う時間を決める', '5分だけ始める', 'できたら自分を褒める'],
    ['昨日より少し早く取りかかる', 'できたことを1つ記録する'],
    ['習慣を10分続ける', '環境をひとつ整える'],
    ['無理せず休む', '5分だけ習慣に触れる'],
    ['習慣を10分続ける', '小さな工夫をひとつ加える'],
    ['習慣を15分続ける', 'ここまでの変化を記録する'],
    ['習慣を15分続ける', '1週間を振り返る', '目標達成 🎉'],
  ],
};

export const FinanceProvider = ({ children }) => {
  const [activeGoal, setActiveGoal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.activeGoal ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeGoal }));
  }, [activeGoal]);

  const selectGoal = (category, title) => {
    setActiveGoal({
      id: `${category.id}-${Date.now()}`,
      categoryId: category.id,
      categoryName: category.name,
      icon: category.icon,
      color: category.color,
      title,
      startedOn: getLocalDateKey(),
      taskDay: 1,
      taskIndex: 0,
      completedTasks: [],
    });
  };

  const completeTask = (dayNumber, taskCount, task, note) => {
    setActiveGoal((current) => {
      if (!current) return current;
      const currentIndex = current.taskDay === dayNumber ? current.taskIndex : 0;
      return {
        ...current,
        taskDay: dayNumber,
        taskIndex: Math.min(currentIndex + 1, taskCount),
        completedTasks: [
          ...(current.completedTasks ?? []),
          { id: `${Date.now()}-${currentIndex}`, day: dayNumber, task, note: note.trim() },
        ],
      };
    });
  };

  return (
    <GoalContext.Provider value={{ activeGoal, selectGoal, completeTask }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(GoalContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
