import React from 'react';
import { Exercise, ExerciseRecord } from '../types';
import { calculateDaysElapsed } from '../utils/storage';
import { Dumbbell, Plus, Edit2 } from 'lucide-react';

interface ExerciseListItemProps {
  exercise: Exercise;
  lastRecord?: ExerciseRecord;
  onRecord: (exercise: Exercise) => void;
  onEdit: (exercise: Exercise) => void;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  lastRecord,
  onRecord,
  onEdit
}) => {
  const daysElapsed = calculateDaysElapsed(lastRecord?.date);

  const getEquipmentBadge = () => {
    switch (exercise.equipment) {
      case 'dumbbell':
        return (
          <span className="bg-amber-950/70 border border-amber-800/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Dumbbell size={11} /> ダンベル
          </span>
        );
      case 'pullup_bar':
        return (
          <span className="bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            懸垂機
          </span>
        );
      default:
        return (
          <span className="bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            自重
          </span>
        );
    }
  };

  // 経過日数のバッジ色
  const getElapsedBadge = () => {
    if (daysElapsed === null) {
      return (
        <span className="text-xs text-slate-500 font-medium">
          未実施
        </span>
      );
    }
    if (daysElapsed === 0) {
      return (
        <span className="text-xs text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
          本日完了
        </span>
      );
    }
    const isReady = daysElapsed >= exercise.recommendedRestDays;
    return (
      <span
        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
          isReady
            ? 'bg-cyan-950/60 border-cyan-700/50 text-cyan-300'
            : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`}
      >
        前回から {daysElapsed}日
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {getEquipmentBadge()}
          {exercise.difficulty === 'beginner' && (
            <span className="bg-lime-950/70 border border-lime-800/40 text-lime-400 text-[9px] font-black px-1.5 py-0.5 rounded">
              初心者向け
            </span>
          )}
          {getElapsedBadge()}
        </div>
        <h4 className="text-sm font-bold text-white truncate">{exercise.name}</h4>

        {/* 前回の記録サマリー */}
        {lastRecord ? (
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1 truncate">
            <span className="text-slate-500">前回:</span>
            {lastRecord.sets.slice(0, 3).map((s, idx) => (
              <span key={idx} className="text-slate-300">
                {s.weightKg ? `${s.weightKg}k×` : ''}{s.reps}回{idx < Math.min(2, lastRecord.sets.length - 1) ? ',' : ''}
              </span>
            ))}
            {lastRecord.sets.length > 3 && <span>...</span>}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 mt-1">まだ記録がありません</p>
        )}
      </div>

      {/* 操作ボタン */}
      <div className="shrink-0 flex items-center gap-1.5">
        <button
          onClick={() => onEdit(exercise)}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 rounded-xl transition-all active:scale-95 border border-slate-700/60"
          title="種目を編集・削除"
        >
          <Edit2 size={13} />
        </button>

        <button
          onClick={() => onRecord(exercise)}
          className="bg-slate-800 hover:bg-cyan-600 text-cyan-400 hover:text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-slate-700 hover:border-transparent shadow-sm"
        >
          <Plus size={14} />
          記録
        </button>
      </div>
    </div>
  );
};
