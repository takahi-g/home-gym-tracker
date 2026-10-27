import React, { useState } from 'react';
import { BodyPart, BODY_PARTS, EquipmentType, Exercise } from '../types';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

interface EditExerciseModalProps {
  exercise?: Exercise | null; // nullなら新規追加、あれば編集
  initialPart: BodyPart;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
}

export const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  exercise,
  initialPart,
  onClose,
  onSave,
  onDelete
}) => {
  const isEditing = !!exercise;

  const [name, setName] = useState(exercise?.name ?? '');
  const [targetPart, setTargetPart] = useState<BodyPart>(exercise?.targetPart ?? initialPart);
  const [equipment, setEquipment] = useState<EquipmentType>(exercise?.equipment ?? 'bodyweight');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate'>(exercise?.difficulty ?? 'beginner');
  const [restDays, setRestDays] = useState<number>(exercise?.recommendedRestDays ?? BODY_PARTS[initialPart].recommendedRestDays);
  const [tips, setTips] = useState(exercise?.tips ?? '');
  const [defaultWeight, setDefaultWeight] = useState<string>(exercise?.defaultWeightKg ? String(exercise.defaultWeightKg) : '5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedExercise: Exercise = {
      id: exercise ? exercise.id : `custom_${Date.now()}`,
      name: name.trim(),
      targetPart,
      equipment,
      difficulty,
      recommendedRestDays: Number(restDays) || 2,
      defaultWeightKg: equipment === 'dumbbell' ? Number(defaultWeight) || undefined : undefined,
      tips: tips.trim() || undefined
    };

    onSave(savedExercise);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isEditing ? <Edit2 className="text-cyan-400" size={18} /> : <Plus className="text-cyan-400" size={18} />}
            <h3 className="text-base font-bold">
              {isEditing ? '種目の編集' : '新しい種目の追加'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* 種目名 */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              種目名 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 膝つき腕立て伏せ、自重スクワット"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          {/* 対象部位 */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">対象部位</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(BODY_PARTS) as BodyPart[]).map((part) => (
                <button
                  type="button"
                  key={part}
                  onClick={() => {
                    setTargetPart(part);
                    if (!isEditing) {
                      setRestDays(BODY_PARTS[part].recommendedRestDays);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    targetPart === part
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {BODY_PARTS[part].name}
                </button>
              ))}
            </div>
          </div>

          {/* 器具タイプ */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">使用する器具</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setEquipment('bodyweight')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  equipment === 'bodyweight'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                自重 (なし)
              </button>
              <button
                type="button"
                onClick={() => setEquipment('dumbbell')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  equipment === 'dumbbell'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ダンベル
              </button>
              <button
                type="button"
                onClick={() => setEquipment('pullup_bar')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  equipment === 'pullup_bar'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                懸垂機
              </button>
            </div>
          </div>

          {/* 難易度（初心者マーク） */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">難易度</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDifficulty('beginner')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  difficulty === 'beginner'
                    ? 'bg-lime-950 border border-lime-500/80 text-lime-400 shadow'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                <span>🔰 初心者おすすめ</span>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('intermediate')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  difficulty === 'intermediate'
                    ? 'bg-slate-700 border border-slate-500 text-white shadow'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                <span>通常 / 慣れた方向け</span>
              </button>
            </div>
          </div>

          {/* 推奨休息日数 */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block font-semibold text-slate-300 mb-1">
                推奨休息日数 (超回復目安)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={restDays}
                  onChange={(e) => setRestDays(Number(e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white focus:outline-none focus:border-cyan-400 text-center font-bold text-sm"
                />
                <span className="text-slate-400">日（中{restDays}日）</span>
              </div>
            </div>

            {equipment === 'dumbbell' && (
              <div className="flex-1">
                <label className="block font-semibold text-slate-300 mb-1">
                  初期重量 (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={defaultWeight}
                    onChange={(e) => setDefaultWeight(e.target.value)}
                    className="w-16 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white focus:outline-none focus:border-cyan-400 text-center font-bold text-sm"
                  />
                  <span className="text-slate-400">kg</span>
                </div>
              </div>
            )}
          </div>

          {/* コツ・フォームのメモ */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              フォームのコツ・メモ
            </label>
            <textarea
              rows={2}
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="例: 腰を反らさず胸を床に近づける。反動を使わない。"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`種目「${name}」を削除してもよろしいですか？`)) {
                    onDelete(exercise.id);
                  }
                }}
                className="py-3 px-4 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-400 font-bold rounded-xl flex items-center gap-1 active:scale-95 transition-all text-xs"
              >
                <Trash2 size={15} /> 削除
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-98 text-sm"
            >
              {isEditing ? '変更を保存する' : '種目を追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
