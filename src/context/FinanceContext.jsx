import React, { createContext, useContext, useEffect, useState } from 'react';

const GoalContext = createContext(null);
const STORAGE_KEY = 'coach_goal_data_v1';

const getLocalDateKey = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};
// 目標のタスクプランを作成する関数

//筋トレ/////////////////////////////////////////////////////////////////////////////////////////

//毎日10分だけ運動する
const EXERCISE_TEN_MINUTES_PLAN = [
  {
    title: '準備',
    tasks: ['運動する時間を決める', '運動する場所を決める', '10分間ウォーキングする'],
  },
  {
    title: 'スタート',
    tasks: ['10分間ウォーキングする', '運動したことを記録する'],
  },
  {
    title: '少し負荷を上げる',
    tasks: ['5分間ウォーキングする', '5分間スクワット・腕立てなどをする'],
  },
  {
    title: '継続',
    tasks: ['10分間好きな運動をする', '運動中はスマホを触らない'],
  },
  {
    title: '挑戦',
    tasks: ['10分間運動する', '昨日より少しだけ負荷を上げる'],
  },
  {
    title: '自分で選ぶ',
    tasks: ['自分で運動メニューを決める', '10分間運動する'],
  },
  {
    title: '達成',
    tasks: ['10分間運動する', '1週間の運動日数を確認する', '7日間の運動習慣達成！'],
  },
];

const createPlan = (tasksByDay) => tasksByDay.map((tasks, index) => ({
  title: `Day ${index + 1}`,
  tasks,
}));

//1週間だけ筋トレする
const EXERCISE_DEFAULT_PLAN = createPlan([
  ['筋トレする時間を決める', '運動できる服に着替える'],
  ['1分間ストレッチする', 'スクワットを5回する'],
  ['スクワットを10回する', '腕立て伏せを5回する'],
  ['3分間筋トレする', '昨日と同じ種目を1セット行う'],
  ['5分間筋トレする', '昨日より1回多く挑戦する'],
  ['好きな筋トレを2種目選ぶ', 'それぞれ10回ずつやってみる'],
  ['5分間筋トレする', '1週間の筋トレを振り返る', '「1週間続けた！」を記録する', '7日間の運動習慣達成！'],
]);

//1週間で腕立て伏せを合計100回する
const PUSH_UP_100_DEFAULT_PLAN = createPlan([
  ['腕立て伏せをする時間を決める', '無理のない回数を確認する'],
  ['腕立て伏せを10回する', 'フォームを意識する'],
  ['腕立て伏せを15回する', '昨日より5回多く挑戦する'],
  ['腕立て伏せを15回する', '無理せず自分のペースで行う'],
  ['腕立て伏せを20回する', '10回ずつに分けて挑戦する'],
  ['残りの回数を確認する', '自分で回数やセット数を決めて挑戦する'],
  ['残りの腕立て伏せに挑戦する', '合計100回を達成する', '1週間の頑張りを振り返る', '腕立て伏せ100回達成！'],
]);


//毎日5,000歩以上歩く
const DAILY_5000_STEPS_DEFAULT_PLAN = createPlan([
  ['歩く時間を決める', '歩数を確認できるようにする'],
  ['1,000歩以上歩く', '歩いた歩数を確認する'],
  ['2,000歩以上歩く', 'いつもより少し多く歩く'],
  ['3,000歩以上歩く', 'エレベーターの代わりに階段を使う'],
  ['4,000歩以上歩く', '10分間いつもより多く歩く'],
  ['5,000歩を目指して歩く', '歩く場所や時間を自分で決める'],
  ['5,000歩以上歩く', '1週間の歩数を振り返る', '毎日歩いたことを記録する', '7日間の5,000歩達成！'],
]);

//1週間で腹筋を合計100回する
const ABS_100_DEFAULT_PLAN = createPlan([
  ['腹筋をする時間を決める', '無理のない回数を確認する'],
  ['腹筋を10回する', 'フォームを意識する'],
  ['腹筋を15回する', '昨日より5回多く挑戦する'],
  ['腹筋を15回する', '無理せず自分のペースで行う'],
  ['腹筋を20回する', '10回ずつに分けて挑戦する'],
  ['残りの回数を確認する', '自分で回数やセット数を決めて挑戦する'],
  ['残りの腹筋に挑戦する', '合計100回を達成する', '1週間の頑張りを振り返る', '腹筋100回達成！'],
]);

//勉強//////////////////////////////////////////////////////////////////////////////////////
// 毎日30分勉強して、1週間で3時間以上勉強する
const STUDY_30_MINUTES_WEEKLY_PLAN = createPlan([
  ['勉強する時間を決める', '勉強する場所を決める'],
  ['10分間勉強する', '勉強した時間を記録する'],
  ['20分間勉強する', 'スマホを遠ざけて集中する'],
  ['30分間勉強する', '昨日と同じ時間に勉強する'],
  ['30分間勉強する', '分からない部分を1つ調べる'],
  ['30分以上勉強する', '自分で勉強する内容を決める'],
  ['30分以上勉強する', '1週間の勉強時間を振り返る', '合計3時間以上達成！'],
]);


// 参考書を10ページ進める
const STUDY_BOOK_10_PAGES_PLAN = createPlan([
  ['参考書を読む時間を決める', '進める10ページを確認する'],
  ['1ページ読む', '分からない部分に印をつける'],
  ['2ページ読む', '重要な部分を1つ確認する'],
  ['2ページ読む', '昨日読んだ内容を振り返る'],
  ['2ページ読む', '分からない部分を1つ調べる'],
  ['残りのページ数を確認する', '自分のペースで読み進める'],
  ['残りのページを読み終える', '10ページ達成！', '読んだ内容を振り返る'],
]);


// プログラミングを毎日30分、1週間続ける
const PROGRAMMING_30_MINUTES_WEEKLY_PLAN = createPlan([
  ['プログラミングをする時間を決める', '開発環境を準備する'],
  ['10分間プログラミングする', 'コードを1つ書いて動かす'],
  ['20分間プログラミングする', '分からないコードを1つ調べる'],
  ['30分間プログラミングする', '昨日のコードを見直す'],
  ['30分間プログラミングする', '新しいコードを1つ試す'],
  ['30分以上プログラミングする', '自分で作るものを1つ決める'],
  ['30分間プログラミングする', '1週間の学習を振り返る', '7日間継続達成！'],
]);


// 資格の問題を50問解く
const CERTIFICATION_50_QUESTIONS_PLAN = createPlan([
  ['問題を解く時間を決める', '50問の進め方を決める'],
  ['5問解く', '間違えた問題を確認する'],
  ['7問解く', '分からなかった問題を1つ復習する'],
  ['8問解く', '昨日の間違いをもう一度解く'],
  ['10問解く', '間違えた理由を確認する'],
  ['残りの問題数を確認する', '自分で解く問題数を決める'],
  ['残りの問題を解く', '50問達成！', '間違えた問題を振り返る'],
]);


// 新しい知識を1つ身につける
const NEW_KNOWLEDGE_1_PLAN = createPlan([
  ['学びたいことを1つ決める', '調べる時間を決める'],
  ['気になることを10分調べる', '新しく知ったことを1つ記録する'],
  ['興味のある内容を1つ深掘りする', '分からない言葉を1つ調べる'],
  ['学んだことを自分の言葉で説明する', '昨日の内容を振り返る'],
  ['新しい情報を1つ探す', '学んだことを1つ記録する'],
  ['自分が知りたいことを選ぶ', '新しい知識を1つ調べる'],
  ['1週間で学んだことを振り返る', '新しい知識を1つ身につけた！'],
]);

//生活・習慣//////////////////////////////////////////////////////////////////////////////////////
// 毎朝決めた時間に起きる
const WAKE_UP_FIXED_TIME_PLAN = createPlan([
  ['起きる時間を決める', '目覚ましをセットする'],
  ['決めた時間に起きる', '起きたらカーテンを開ける'],
  ['決めた時間に起きる', '起きたら水を1杯飲む'],
  ['決めた時間に起きる', '起きた時間を記録する'],
  ['決めた時間に起きる', '目覚ましを止めてすぐ起きる'],
  ['自分に合った起床方法を選ぶ', '決めた時間に起きる'],
  ['決めた時間に起きる', '1週間の起床時間を振り返る', '7日間の起床習慣達成！'],
]);


// 寝る前に5分だけ部屋を片付ける
const BEDTIME_CLEANING_5_MINUTES_PLAN = createPlan([
  ['片付ける時間を決める', '片付ける場所を1つ決める'],
  ['1分間だけ片付ける', '床や机の上を1つ片付ける'],
  ['3分間片付ける', '不要なものを1つ元の場所に戻す'],
  ['5分間片付ける', '昨日と違う場所を1つ片付ける'],
  ['5分間片付ける', '目につく場所を優先して片付ける'],
  ['片付ける場所を自分で選ぶ', '5分間集中して片付ける'],
  ['5分間片付ける', '1週間の部屋の変化を振り返る', '7日間の片付け習慣達成！'],
]);


// 1日1回、感謝したことを記録する
const DAILY_GRATITUDE_RECORD_PLAN = createPlan([
  ['感謝したことを記録する時間を決める', '記録する場所を決める'],
  ['感謝したことを1つ書く', '誰に・何に感謝したか記録する'],
  ['感謝したことを1つ書く', 'その理由も一言書く'],
  ['感謝したことを1つ書く', '昨日とは違うことを探す'],
  ['感謝したことを1つ書く', '小さな出来事にも目を向ける'],
  ['感謝したことを自分で1つ選んで記録する', '過去の記録を1つ読み返す'],
  ['感謝したことを1つ書く', '1週間の記録を振り返る', '7日間の感謝習慣達成！'],
]);


// 水を1日1.5リットル飲む
const DAILY_WATER_1_5L_PLAN = createPlan([
  ['水を飲む時間を決める', '飲んだ量を記録できるようにする'],
  ['500ml以上の水を飲む', '飲んだ量を記録する'],
  ['800ml以上の水を飲む', 'こまめに水分をとる'],
  ['1リットル以上の水を飲む', '食事の前後に水を飲む'],
  ['1.2リットル以上の水を飲む', '水を持ち歩く'],
  ['1.5リットルを目指して飲む', '自分に合った飲むタイミングを決める'],
  ['1.5リットルの水を飲む', '1週間の水分摂取を振り返る', '7日間の水分習慣達成！'],
]);


// SNSを見ない時間を1時間つくる
const SNS_FREE_1_HOUR_PLAN = createPlan([
  ['SNSを見ない時間を決める', 'スマホの通知をオフにする'],
  ['15分間SNSを見ない', 'スマホを手の届かない場所に置く'],
  ['30分間SNSを見ない', 'SNSを開きたくなったら別の行動をする'],
  ['30分間SNSを見ない', 'SNSを見ない時間に別のことをする'],
  ['45分間SNSを見ない', 'スマホを確認する回数を減らす'],
  ['1時間SNSを見ない', '自分でSNSを見ない時間帯を決める'],
  ['1時間SNSを見ない', '1週間のSNS利用を振り返る', '1時間のSNSオフ達成！'],
]);

// ここで目標のタイトル名を変えれる
export const GOAL_CATEGORIES = [
  {
    id: 'exercise',
    icon: '🏋️',
    name: '筋トレ・運動',
    color: 'emerald',
    goals: [
      { id: 'exercise-10-minutes', title: '毎日10分だけ運動する', taskPlan: EXERCISE_TEN_MINUTES_PLAN },
      { id: 'exercise-stretch', title: '1週間だけ筋トレする', taskPlan: EXERCISE_DEFAULT_PLAN },
      { id: 'exercise-run', title: '1週間で腕立て伏せを合計100回する', taskPlan: PUSH_UP_100_DEFAULT_PLAN},
      { id: 'exercise-steps', title: '毎日5,000歩以上歩く', taskPlan: DAILY_5000_STEPS_DEFAULT_PLAN },
      { id: 'exercise-training', title: '1週間で腹筋を合計100回する', taskPlan: ABS_100_DEFAULT_PLAN },
    ],
  },
  {
    id: 'study',
    icon: '📚',
    name: '勉強・資格',
    color: 'sky',
    goals: [
      { id: 'study-30-minutes', title: '毎日30分勉強して、1週間で3時間以上勉強する', taskPlan: STUDY_30_MINUTES_WEEKLY_PLAN },
      { id: 'study-pages', title: '参考書を10ページ進める', taskPlan: STUDY_BOOK_10_PAGES_PLAN },
      { id: 'study-programming', title: 'プログラミングを毎日30分、1週間続ける', taskPlan: PROGRAMMING_30_MINUTES_WEEKLY_PLAN },
      { id: 'study-vocabulary', title: '資格の問題を50問解く', taskPlan: CERTIFICATION_50_QUESTIONS_PLAN },
      { id: 'study-new', title: '新しい知識を1つ身につける', taskPlan: NEW_KNOWLEDGE_1_PLAN },
    ],
  },
  {
    id: 'life',
    icon: '🌱',
    name: '生活・習慣',
    color: 'amber',
    goals: [
      { id: 'life-morning', title: '毎朝決めた時間に起きる', taskPlan: WAKE_UP_FIXED_TIME_PLAN },
      { id: 'life-cleaning', title: '寝る前に5分だけ部屋を片付ける', taskPlan: BEDTIME_CLEANING_5_MINUTES_PLAN },
      { id: 'life-gratitude', title: '1日1回、感謝したことを記録する', taskPlan: DAILY_GRATITUDE_RECORD_PLAN },
      { id: 'life-water', title: '水を1日1.5リットル飲む', taskPlan: DAILY_WATER_1_5L_PLAN },
      { id: 'life-sns', title: 'SNSを見ない時間を1時間つくる', taskPlan: SNS_FREE_1_HOUR_PLAN },
    ],
  },
];

// Older saved goals do not have taskPlan, so keep a small compatibility fallback.
const LEGACY_TASK_PLANS = {
  exercise: EXERCISE_DEFAULT_PLAN,
  life: WAKE_UP_FIXED_TIME_PLAN,
};

export const getGoalTaskPlan = (goal) =>
  goal?.taskPlan ??
  LEGACY_TASK_PLANS[goal?.categoryId] ??
  null;

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

  const selectGoal = (category, goal) => {
    setActiveGoal({
      id: `${goal.id}-${Date.now()}`,
      goalId: goal.id,
      categoryId: category.id,
      categoryName: category.name,
      icon: category.icon,
      color: category.color,
      title: goal.title,
      taskPlan: goal.taskPlan,
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
