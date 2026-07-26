import React from 'react';

export const IncomeList = ({ items = [] }) => {
  // 日付が新しい順（降順）にソート
  const sortedItems = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📋</span> 収益・入力履歴（最新順）
      </h2>

      {sortedItems.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          まだ入力されたデータがありません。
        </p>
      ) : (
        <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {sortedItems.map((item) => (
            <li
              key={item.id || `${item.date}-${item.amount}-${Math.random()}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
            >
              <div className="flex flex-col gap-1">
                {/* 日付 */}
                <span className="text-xs font-semibold text-gray-400">
                  {item.date}
                </span>
                {/* メモ */}
                <span className="text-sm font-medium text-gray-700">
                  {item.memo || 'メモなし'}
                </span>
              </div>

              {/* 金額 */}
              <div className="text-right">
                <span className="text-base font-bold text-emerald-600">
                  +¥{Number(item.amount).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};