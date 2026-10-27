import React, { useState } from 'react';
import { Exercise, ExerciseRecord, WorkoutSet, calculate1RM, calculateVolume } from '../types';
import { X, Plus, Trash2, Check, Copy, Flame, AlertTriangle, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecordWorkoutModalProps {
  exercise: Exercise;
  lastRecord?: ExerciseRecord;
  onClose: () => void;
  onSave: (record: Omit<ExerciseRecord, 'id'>) => void;
  onStartTimer: () => void;
}

export const RecordWorkoutModal: React.FC<RecordWorkoutModalProps> = ({
  exercise,
  lastRecord,
  onClose,
  onSave,
  onStartTimer
}) => {
  // 前回の記録があればそれをデフォルトに、なければ初期値
  const initialSets: WorkoutSet[] = lastRecord && lastRecord.sets.length > 0
    ? lastRecord.sets.map(s => ({ ...s }))
    : [
        { weightKg: exercise.defaultWeightKg ?? (exercise.equipment === 'dumbbell' ? 11 : undefined), reps: 10 },
        { weightKg: exercise.defaultWeightKg ?? (exercise.equipment === 'dumbbell' ? 11 : undefined), reps: 10 },
        { weightKg: exercise.defaultWeightKg ?? (exercise.equipment === 'dumbbell' ? 11 : undefined), reps: 10 }
      ];

  const [sets, setSets] = useState<WorkoutSet[]>(initialSets);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 前回のデータをワンタップで全コピー
  const copyPreviousSets = () => {
    if (lastRecord && lastRecord.sets.length > 0) {
      setSets(lastRecord.sets.map(s => ({ ...s })));
    }
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        weightKg: lastSet ? lastSet.weightKg : (exercise.defaultWeightKg ?? (exercise.equipment === 'dumbbell' ? 11 : undefined)),
        reps: lastSet ? lastSet.reps : 10
      }
    ]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, i) => i !== index));
  };

  const updateSet = (index: number, field: keyof WorkoutSet, val: any) => {
    setSets(
      sets.map((s, i) => {
        if (i === index) {
          return { ...s, [field]: val };
        }
        return s;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sets.length === 0) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (_) {}

    onStartTimer();

    onSave({
      date: new Date(date).toISOString(),
      exerciseId: exercise.id,
      sets: sets.map(s => ({
        ...s,
        reps: Number(s.reps) || 0,
        weightKg: s.weightKg !== undefined ? Number(s.weightKg) : undefined
      }))
    });
  };

  const isDumbbell = exercise.equipment === 'dumbbell';

  // 1RMと総ボリュームの計算（「俺の筋トレ記録」風機能）
  const estimated1RMs = sets
    .filter(s => (s.weightKg ?? 0) > 0 && s.reps > 0)
    .map(s => calculate1RM(s.weightKg!, s.reps));
  const max1RM = estimated1RMs.length > 0 ? Math.max(...estimated1RMs) : null;
  const totalVolume = calculateVolume(sets);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/50">
                {exercise.equipment === 'dumbbell' ? 'ダンベル' : exercise.equipment === 'pullup_bar' ? '懸垂機' : '自重トレーニング'}
              </span>
              {exercise.difficulty === 'beginner' && (
                <span className="bg-lime-950/80 border border-lime-800/50 text-lime-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                  初心者おすすめ
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-white mt-1.5 leading-snug">{exercise.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* コピーボタン & 前回の記録サマリー */}
        {lastRecord && (
          <div className="mt-3 bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="truncate">
              <span className="text-slate-400 font-semibold">前回: </span>
              {lastRecord.sets.map((s, idx) => (
                <span key={idx} className="font-mono text-cyan-300 ml-1">
                  {s.weightKg ? `${s.weightKg}k×` : ''}{s.reps}{idx < lastRecord.sets.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={copyPreviousSets}
              className="shrink-0 bg-slate-700/80 hover:bg-slate-700 text-cyan-300 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-all"
              title="前回のセット内容をコピー"
            >
              <Copy size={12} /> 前回復製
            </button>
          </div>
        )}

        {/* 自動計算バー (1RM推定 & 総ボリューム挙上重量) */}
        {(max1RM !== null || totalVolume > 0) && (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {max1RM !== null && (
              <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-2 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold flex items-center justify-center gap-1">
                  <TrendingUp size={11} className="text-cyan-400" /> 推定1RM (最大重量)
                </span>
                <span className="text-base font-black font-mono text-cyan-300">
                  {max1RM} <span className="text-[10px] font-normal text-slate-400">kg</span>
                </span>
              </div>
            )}
            {totalVolume > 0 && (
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">総挙上重量 (Volume)</span>
                <span className="text-base font-black font-mono text-amber-300">
                  {totalVolume} <span className="text-[10px] font-normal text-slate-400">kg</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* コツ・家トレガイド */}
        {exercise.tips && (
          <div className="mt-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 flex items-start gap-1.5">
            <span className="text-amber-400 font-bold shrink-0">💡</span>
            <span className="text-[11px] leading-relaxed">{exercise.tips}</span>
          </div>
        )}

        {/* 記録フォーム */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>セット</span>
            <div className="flex gap-10 mr-7">
              <span>{isDumbbell ? '重量(kg)' : '加重(+kg)'}</span>
              <span>回数(reps)</span>
            </div>
          </div>

          <div className="space-y-2">
            {sets.map((set, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/70"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-700/90 font-bold text-xs flex items-center justify-center text-slate-300 shrink-0 font-mono">
                  {idx + 1}
                </div>

                {/* 重量入力 */}
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    max={isDumbbell ? 11 : 50}
                    min="0"
                    placeholder={isDumbbell ? 'kg' : '0'}
                    value={set.weightKg ?? ''}
                    onChange={(e) => updateSet(idx, 'weightKg', e.target.value === '' ? undefined : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-center text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">kg</span>
                </div>

                {/* 回数入力 */}
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    required
                    value={set.reps}
                    onChange={(e) => updateSet(idx, 'reps', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-center text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">回</span>
                </div>

                {/* 削除ボタン */}
                <button
                  type="button"
                  onClick={() => removeSet(idx)}
                  disabled={sets.length <= 1}
                  className={`p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors ${
                    sets.length <= 1 ? 'opacity-20 cursor-not-allowed' : ''
                  }`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* セット追加ボタン */}
          <button
            type="button"
            onClick={addSet}
            className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors active:scale-98"
          >
            <Plus size={14} /> セットを追加
          </button>

          {/* 実施日 */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>トレーニング日:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-98 text-sm flex items-center justify-center gap-2 mt-3"
          >
            <Check size={18} />
            完了＆タイマー起動！
          </button>
        </form>
      </div>
    </div>
  );
};
