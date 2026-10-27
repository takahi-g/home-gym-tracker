import React, { useState } from 'react';
import { Exercise, ExerciseRecord, BODY_PARTS, calculate1RM, calculateVolume } from '../types';
import { Trash2, Calendar, Dumbbell, History, TrendingUp, Trophy } from 'lucide-react';

interface HistoryModalProps {
  records: ExerciseRecord[];
  exercises: Exercise[];
  onClose: () => void;
  onDeleteRecord: (id: string) => void;
  onClearAllRecords: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  records,
  exercises,
  onClose,
  onDeleteRecord,
  onClearAllRecords
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats'>('timeline');

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getExercise = (id: string) => exercises.find(e => e.id === id);

  // 通算統計（「俺の筋トレ記録」風アーカイブ）
  const totalWorkouts = records.length;
  const totalVolume = records.reduce((sum, r) => sum + calculateVolume(r.sets), 0);
  const totalSets = records.reduce((sum, r) => sum + r.sets.length, 0);

  // 種目別自己ベスト（1RM MAX）
  const max1RMByExercise: Record<string, { max: number; date: string; name: string }> = {};
  records.forEach((r) => {
    const ex = getExercise(r.exerciseId);
    if (!ex) return;
    r.sets.forEach((s) => {
      if ((s.weightKg ?? 0) > 0 && s.reps > 0) {
        const rm = calculate1RM(s.weightKg!, s.reps);
        if (!max1RMByExercise[ex.id] || rm > max1RMByExercise[ex.id].max) {
          max1RMByExercise[ex.id] = {
            max: rm,
            date: r.date,
            name: ex.name
          };
        }
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-white max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <History className="text-cyan-400" size={20} />
            <h3 className="text-base font-bold">トレーニング履歴 & 分析</h3>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('⚠️ すべてのトレーニング履歴を削除しますか？\n（この操作は元に戻せません）')) {
                    onClearAllRecords();
                  }
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-bold bg-rose-950/60 border border-rose-800/50 px-2 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                title="履歴をすべて削除"
              >
                <Trash2 size={12} />
                全削除
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              ✕
            </button>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 bg-slate-950 p-1 rounded-xl shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'timeline'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            タイムライン ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'stats'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={14} /> 通算・自己ベスト
          </button>
        </div>

        {/* コンテンツ */}
        <div className="mt-3 overflow-y-auto space-y-3 flex-1 pr-0.5">
          {activeTab === 'timeline' ? (
            sortedRecords.length === 0 ? (
              <p className="text-center text-slate-500 py-10 text-xs">履歴はまだありません</p>
            ) : (
              sortedRecords.map((rec) => {
                const ex = getExercise(rec.exerciseId);
                const partName = ex ? BODY_PARTS[ex.targetPart]?.name : '部位';
                const formattedDate = new Date(rec.date).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric'
                });
                const vol = calculateVolume(rec.sets);

                return (
                  <div
                    key={rec.id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Calendar size={12} /> {formattedDate}
                      </span>
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="この記録を削除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {partName}
                        </span>
                        <h5 className="font-bold text-white text-sm">
                          {ex ? ex.name : '不明な種目'}
                        </h5>
                      </div>
                      {vol > 0 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {vol}kg volume
                        </span>
                      )}
                    </div>

                    {/* セット一覧 */}
                    <div className="flex flex-wrap gap-1.5">
                      {rec.sets.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-900 border border-slate-700/80 px-2 py-1 rounded-md text-[11px] font-mono text-slate-300"
                        >
                          {idx + 1}set: {s.weightKg ? `${s.weightKg}k×` : ''}{s.reps}回
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* 統計 & 自己ベストタブ */
            <div className="space-y-4">
              {/* サマリー数値 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block">総記録数</span>
                  <span className="text-base font-black font-mono text-white">{totalWorkouts}</span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block">総セット数</span>
                  <span className="text-base font-black font-mono text-cyan-400">{totalSets}</span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block">総挙上重量</span>
                  <span className="text-base font-black font-mono text-amber-400">{Math.round(totalVolume)}kg</span>
                </div>
              </div>

              {/* 種目別MAX 1RM */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Trophy size={14} className="text-amber-400" />
                  各種目の推定MAX (1RM)
                </h4>

                <div className="space-y-1.5">
                  {Object.entries(max1RMByExercise).length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">重量付きの記録がまだありません</p>
                  ) : (
                    Object.entries(max1RMByExercise).map(([id, item]) => (
                      <div
                        key={id}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-200 truncate pr-2">{item.name}</span>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black font-mono text-cyan-400">
                            {item.max} kg
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {new Date(item.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
