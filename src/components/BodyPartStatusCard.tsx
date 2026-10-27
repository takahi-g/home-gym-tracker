import React from 'react';
import { BodyPart, BODY_PARTS, Exercise, ExerciseRecord } from '../types';
import { getBodyPartStatus } from '../utils/storage';
import { Flame, Shield, Zap, BicepsFlexed, Footprints, Target, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface BodyPartStatusCardProps {
  part: BodyPart;
  exercises: Exercise[];
  records: ExerciseRecord[];
  isSelected: boolean;
  onSelect: (part: BodyPart) => void;
}

export const BodyPartStatusCard: React.FC<BodyPartStatusCardProps> = ({
  part,
  exercises,
  records,
  isSelected,
  onSelect
}) => {
  const info = BODY_PARTS[part];
  const status = getBodyPartStatus(part, exercises, records);

  // ステータス別のバッジスタイル
  const getStatusBadge = () => {
    switch (status.statusType) {
      case 'today':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          indicator: 'bg-emerald-400',
          icon: <CheckCircle2 size={13} className="text-emerald-400" />
        };
      case 'ready':
        return {
          bg: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
          indicator: 'bg-cyan-400 animate-pulse',
          icon: <Flame size={13} className="text-cyan-400" />
        };
      case 'recovering':
        return {
          bg: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
          indicator: 'bg-rose-500',
          icon: <Clock size={13} className="text-rose-400" />
        };
      case 'idle':
        return {
          bg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          indicator: 'bg-amber-400',
          icon: <AlertCircle size={13} className="text-amber-400" />
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-400',
          indicator: 'bg-slate-500',
          icon: <Clock size={13} />
        };
    }
  };

  const badge = getStatusBadge();

  // 部位ごとの登録種目数
  const partExercises = exercises.filter((e) => e.targetPart === part);

  return (
    <div
      onClick={() => onSelect(part)}
      className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-left ${
        isSelected
          ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.02]'
          : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
      }`}
    >
      {/* 鍛え時ハイライトバッジ */}
      {status.statusType === 'ready' && (
        <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow uppercase tracking-wider">
          今日のおすすめ！
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wide">{info.name}</span>
            <span className="text-xs text-slate-400 font-normal">({partExercises.length}種目)</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{info.description}</p>
        </div>

        {/* 経過日数・状態表示 */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.bg}`}>
          {badge.icon}
          <span>{status.label}</span>
        </div>
      </div>

      {/* 経過日数の視覚的バー */}
      <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>推奨休息: 約{info.recommendedRestDays}日</span>
        <span className="font-mono">
          {status.daysElapsed !== null ? (
            <span className={status.daysElapsed >= info.recommendedRestDays ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
              前回から {status.daysElapsed} 日経過
            </span>
          ) : (
            <span className="text-slate-500">履歴なし</span>
          )}
        </span>
      </div>
    </div>
  );
};
