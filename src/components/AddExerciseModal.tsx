import React, { useState } from 'react';
import { BodyPart, BODY_PARTS, EquipmentType, Exercise } from '../types';
import { X, Plus, Dumbbell, Sparkles } from 'lucide-react';

interface AddExerciseModalProps {
  initialPart: BodyPart;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  initialPart,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [targetPart, setTargetPart] = useState<BodyPart>(initialPart);
  const [equipment, setEquipment] = useState<EquipmentType>('dumbbell');
  const [restDays, setRestDays] = useState<number>(BODY_PARTS[initialPart].recommendedRestDays);
  const [tips, setTips] = useState('');
  const [defaultWeight, setDefaultWeight] = useState<string>('11');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExercise: Exercise = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      targetPart,
      equipment,
      recommendedRestDays: Number(restDays) || 3,
      defaultWeightKg: equipment === 'dumbbell' ? Number(defaultWeight) || undefined : undefined,
      tips: tips.trim() || undefined
    };

    onAdd(newExercise);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="text-cyan-400" size={20} />
            <h3 className="text-lg font-bold">新しいトレーニング種目を登録</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* 種目名 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              種目名 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ダンベル インクラインカール"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 対象部位 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">対象部位</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(BODY_PARTS) as BodyPart[]).map((part) => (
                <button
                  type="button"
                  key={part}
                  onClick={() => {
                    setTargetPart(part);
                    setRestDays(BODY_PARTS[part].recommendedRestDays);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors ${
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">使用する器具</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEquipment('dumbbell')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors ${
                  equipment === 'dumbbell'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ダンベル(〜11kg)
              </button>
              <button
                type="button"
                onClick={() => setEquipment('pullup_bar')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors ${
                  equipment === 'pullup_bar'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                懸垂機
              </button>
              <button
                type="button"
                onClick={() => setEquipment('bodyweight')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors ${
                  equipment === 'bodyweight'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                自重 / その他
              </button>
            </div>
          </div>

          {/* 推奨休息日数 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                推奨休息日数 (超回復目安)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={restDays}
                  onChange={(e) => setRestDays(Number(e.target.value))}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-center font-bold"
                />
                <span className="text-slate-400 text-xs">日（中{restDays}日）</span>
              </div>
            </div>

            {equipment === 'dumbbell' && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  初期重量 (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    max="11"
                    min="1"
                    value={defaultWeight}
                    onChange={(e) => setDefaultWeight(e.target.value)}
                    className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-center font-bold"
                  />
                  <span className="text-slate-400 text-xs">kg / 片手</span>
                </div>
              </div>
            )}
          </div>

          {/* コツ・メモ */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              家トレのメモ・コツ（任意）
            </label>
            <input
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="例: ネガティブ3秒かける、トップで静止"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-98 text-sm"
            >
              種目を追加する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
