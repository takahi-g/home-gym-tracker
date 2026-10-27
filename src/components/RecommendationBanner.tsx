import React, { useState } from 'react';
import { BodyPart, BODY_PARTS, ExerciseRecord, Exercise } from '../types';
import { calculateDaysElapsed } from '../utils/storage';
import { Flame, Dumbbell, Shield, Sparkles } from 'lucide-react';

interface RecommendationBannerProps {
  exercises: Exercise[];
  records: ExerciseRecord[];
  onSelectPart: (part: BodyPart) => void;
  onRecordExercise: (exercise: Exercise) => void;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
  exercises,
  records,
  onSelectPart,
  onRecordExercise
}) => {
  // 各部位の経過日数を計算し、推奨順にソート（経過日数が長い順、未実施も高優先度）
  const partsWithDays = (Object.keys(BODY_PARTS) as BodyPart[]).map((part) => {
    const partExerciseIds = new Set(exercises.filter(e => e.targetPart === part).map(e => e.id));
    const partRecords = records
      .filter(r => partExerciseIds.has(r.exerciseId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const days = partRecords.length > 0 ? calculateDaysElapsed(partRecords[0].date) : 999;
    const recRest = BODY_PARTS[part].recommendedRestDays;
    const isReady = days !== null && days >= recRest;

    return {
      part,
      days: days ?? 999,
      isReady,
      recommendedRestDays: recRest
    };
  });

  // 鍛え時（超回復済み）の部位を優先抽出
  const readyParts = partsWithDays
    .filter(p => p.isReady)
    .sort((a, b) => b.days - a.days);

  const topPick = readyParts.length > 0 ? readyParts[0] : partsWithDays.sort((a, b) => b.days - a.days)[0];

  if (!topPick) return null;

  const topPartInfo = BODY_PARTS[topPick.part];
  const topExercises = exercises.filter(e => e.targetPart === topPick.part);

  return (
    <div className="bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-[11px] font-black tracking-wider text-cyan-400 uppercase">
              本日の推奨部位
            </span>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {topPartInfo.name}
              <span className="text-xs font-normal text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                {topPick.days === 999 ? '未実施' : `前回から ${topPick.days}日経過`}
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => onSelectPart(topPick.part)}
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
        >
          部位を見る →
        </button>
      </div>

      <p className="text-xs text-slate-300 mt-2 line-clamp-1">
        {topPartInfo.description}
      </p>

      {/* 推奨種目のクイックスタートボタン */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2 overflow-x-auto pb-1">
        {topExercises.slice(0, 3).map((ex) => (
          <button
            key={ex.id}
            onClick={() => onRecordExercise(ex)}
            className="shrink-0 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className="text-cyan-400">⚡️</span>
            <span className="font-semibold">{ex.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
