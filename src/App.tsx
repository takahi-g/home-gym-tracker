import React, { useState, useEffect, useRef } from 'react';
import { BodyPart, BODY_PARTS, Exercise, ExerciseRecord, EquipmentType } from './types';
import {
  loadStoredExercises,
  saveStoredExercises,
  loadStoredRecords,
  saveStoredRecords
} from './utils/storage';
import { INITIAL_EXERCISES } from './types';
import { BodyPartStatusCard } from './components/BodyPartStatusCard';
import { ExerciseListItem } from './components/ExerciseListItem';
import { RecordWorkoutModal } from './components/RecordWorkoutModal';
import { EditExerciseModal } from './components/EditExerciseModal';
import { RestTimer } from './components/RestTimer';
import { RecommendationBanner } from './components/RecommendationBanner';
import { HistoryModal } from './components/HistoryModal';
import {
  Dumbbell,
  Timer,
  PlusCircle,
  History,
  Sparkles,
  Smartphone,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { APP_VERSION } from './version';

export function App() {
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    loadStoredExercises(INITIAL_EXERCISES)
  );
  const [records, setRecords] = useState<ExerciseRecord[]>(() => loadStoredRecords());

  // 選択中の部位（デフォルトは背中）
  const [selectedPart, setSelectedPart] = useState<BodyPart>('back');
  
  // 器具フィルター ('all' | 'dumbbell' | 'pullup_bar')
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | EquipmentType>('all');

  // モーダル管理
  const [recordingExercise, setRecordingExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null); // 編集対象種目
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 強制更新処理（Service Workerのキャッシュをクリアして再読込）
  const handleForceUpdate = async () => {
    setIsRefreshing(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (e) {
      console.error('Update error:', e);
    }
    // キャッシュを無視して最新版をハードリロード
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  // ストレージ同期
  useEffect(() => {
    saveStoredExercises(exercises);
  }, [exercises]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  // 新しいトレーニング記録を保存
  const handleSaveRecord = (newRecordData: Omit<ExerciseRecord, 'id'>) => {
    const newRecord: ExerciseRecord = {
      ...newRecordData,
      id: `rec_${Date.now()}`
    };
    setRecords([newRecord, ...records]);
    setRecordingExercise(null);
  };

  // 種目の保存（新規または更新）
  const handleSaveExercise = (savedExercise: Exercise) => {
    const exists = exercises.some(e => e.id === savedExercise.id);
    if (exists) {
      setExercises(exercises.map(e => e.id === savedExercise.id ? savedExercise : e));
    } else {
      setExercises([...exercises, savedExercise]);
      setSelectedPart(savedExercise.targetPart);
    }
    setEditingExercise(null);
    setIsAddModalOpen(false);
  };

  // 種目削除
  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(e => e.id !== exerciseId));
    setEditingExercise(null);
  };

  // 履歴削除
  const handleDeleteRecord = (id: string) => {
    if (confirm('この記録を削除してもよろしいですか？')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // 履歴全削除
  const handleClearAllRecords = () => {
    setRecords([]);
    saveStoredRecords([]);
  };

  // フィルタリングされた種目
  const displayedExercises = exercises.filter(e => {
    const partMatch = e.targetPart === selectedPart;
    const equipMatch = equipmentFilter === 'all' || e.equipment === equipmentFilter;
    return partMatch && equipMatch;
  });

  // 対象種目の最新の記録を取得
  const getLastRecord = (exerciseId: string) => {
    const found = records
      .filter(r => r.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return found[0];
  };

  const exerciseSectionRef = useRef<HTMLDivElement>(null);

  // 1.5秒（1500ms）かけて滑らかに種目リストへスクロールする関数
  const scrollToExercises = () => {
    if (!exerciseSectionRef.current) return;
    const targetElement = exerciseSectionRef.current;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1500; // 1.5秒
    let startTime: number | null = null;

    // イージング関数 (easeInOutCubic: 最初と最後が滑らかに減速)
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const handleSelectPart = (part: BodyPart) => {
    setSelectedPart(part);
    scrollToExercises();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex justify-center pb-28 select-none">
      {/* スマホ特化ラッパー */}
      <div className="w-full max-w-md px-3.5 pt-4 space-y-4">
        {/* スマホ向けヘッダー */}
        <header className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-slate-800 shadow-lg sticky top-2 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-900/40">
              <Dumbbell size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-white leading-none">
                  HOME GYM <span className="text-cyan-400">LOG</span>
                </h1>
                <span className="text-[9px] font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700/80 px-1.5 py-0.5 rounded">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                自重・ダンベル・懸垂機 初心者向け筋トレ管理
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleForceUpdate}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700/80 text-xs flex items-center gap-1 font-bold active:scale-95 transition-all"
              title="最新バージョンに更新"
            >
              <RefreshCw size={15} className={`text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[11px] font-semibold hidden xs:inline">更新</span>
            </button>
            <button
              onClick={() => setShowInstallGuide(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 font-bold"
              title="スマホへの追加方法"
            >
              <Smartphone size={16} className="text-cyan-400" />
              <span className="hidden sm:inline">保存</span>
            </button>
            <button
              onClick={() => setShowTimer(!showTimer)}
              className={`p-2 rounded-xl border transition-all ${
                showTimer
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-900/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="タイマー切替"
            >
              <Timer size={18} />
            </button>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white"
              title="トレーニング履歴"
            >
              <History size={18} />
            </button>
          </div>
        </header>

        {/* インターバルタイマー */}
        {showTimer && (
          <div className="animate-in fade-in duration-150">
            <RestTimer onClose={() => setShowTimer(false)} />
          </div>
        )}

        {/* 本日のおすすめ部位バナー */}
        <RecommendationBanner
          exercises={exercises}
          records={records}
          onSelectPart={handleSelectPart}
          onRecordExercise={(ex) => setRecordingExercise(ex)}
        />

        {/* 部位選択カード一覧（2列グリッド） */}
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>部位ごとの経過日数</span>
            </h3>
            <span className="text-[10px] text-slate-500">タップで種目へスクロール</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BODY_PARTS) as BodyPart[]).map((part) => (
              <BodyPartStatusCard
                key={part}
                part={part}
                exercises={exercises}
                records={records}
                isSelected={selectedPart === part}
                onSelect={handleSelectPart}
              />
            ))}
          </div>
        </div>

        {/* 選択中部位の種目セクション */}
        <div ref={exerciseSectionRef} className="space-y-2.5 pt-2 scroll-mt-20">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white">
                {BODY_PARTS[selectedPart].name} の種目
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                ({displayedExercises.length})
              </span>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-xl"
            >
              <PlusCircle size={14} />
              種目追加
            </button>
          </div>

          {/* 器具フィルター (スマホ横スクロール対応) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setEquipmentFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                equipmentFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setEquipmentFilter('bodyweight')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                equipmentFilter === 'bodyweight'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              自重 (器具なし)
            </button>
            <button
              onClick={() => setEquipmentFilter('dumbbell')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                equipmentFilter === 'dumbbell'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              <Dumbbell size={13} /> ダンベル
            </button>
            <button
              onClick={() => setEquipmentFilter('pullup_bar')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                equipmentFilter === 'pullup_bar'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              懸垂機
            </button>
          </div>

          {/* 種目リスト */}
          <div className="space-y-2">
            {displayedExercises.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-xs">
                条件に一致する種目がありません。「種目追加」から登録できます。
              </div>
            ) : (
              displayedExercises.map((exercise) => (
                <ExerciseListItem
                  key={exercise.id}
                  exercise={exercise}
                  lastRecord={getLastRecord(exercise.id)}
                  onRecord={(ex) => setRecordingExercise(ex)}
                  onEdit={(ex) => setEditingExercise(ex)}
                />
              ))
            )}
          </div>
        </div>

        {/* 初心者向け筋トレの極意カード */}
        <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-3 text-xs text-slate-400 flex items-start gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <Sparkles size={15} />
          </div>
          <div>
            <span className="font-bold text-slate-200">🔰 初心者トレーニーへのアドバイス:</span>
            <p className="mt-0.5 leading-relaxed text-[11px] text-slate-400">
              最初は**「膝つき腕立て」**や**「自重スクワット」**など無理のない種目でOK！重さよりも**「反動を使わずゆっくり動かすこと」**を意識すると怪我なくしっかり効きます！
            </p>
          </div>
        </div>

        {/* バージョン情報 (日付と時間) & 更新ボタン */}
        <div className="text-center pt-1 pb-4 flex flex-col items-center gap-1.5">
          <p className="text-[10px] font-mono text-slate-500">
            Version Build: {APP_VERSION}
          </p>
          <button
            onClick={handleForceUpdate}
            disabled={isRefreshing}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full active:scale-95 transition-all"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? '更新中...' : 'キャッシュをクリアして最新版に更新'}
          </button>
        </div>
      </div>

      {/* スマホ下部固定クイックアクションバー */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 py-2.5 px-4 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-between gap-3">
          <button
            onClick={() => setShowTimer(!showTimer)}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
              showTimer
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/60'
                : 'bg-slate-900 border-slate-700/80 text-cyan-400'
            }`}
          >
            <Timer size={16} />
            <span>{showTimer ? 'タイマーを隠す' : 'タイマーを開く'}</span>
          </button>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <History size={16} />
            <span>履歴 ({records.length})</span>
          </button>
        </div>
      </div>

      {/* 記録モーダル */}
      {recordingExercise && (
        <RecordWorkoutModal
          exercise={recordingExercise}
          lastRecord={getLastRecord(recordingExercise.id)}
          onClose={() => setRecordingExercise(null)}
          onSave={handleSaveRecord}
          onStartTimer={() => setShowTimer(true)}
        />
      )}

      {/* 種目追加・編集モーダル */}
      {(isAddModalOpen || editingExercise) && (
        <EditExerciseModal
          exercise={editingExercise}
          initialPart={selectedPart}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingExercise(null);
          }}
          onSave={handleSaveExercise}
          onDelete={handleDeleteExercise}
        />
      )}

      {/* 履歴モーダル */}
      {isHistoryModalOpen && (
        <HistoryModal
          records={records}
          exercises={exercises}
          onClose={() => setIsHistoryModalOpen(false)}
          onDeleteRecord={handleDeleteRecord}
          onClearAllRecords={handleClearAllRecords}
        />
      )}

      {/* スマホインストール案内モーダル */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="text-cyan-400" size={20} />
                <h3 className="text-base font-bold">Macを切ってもスマホで使う方法</h3>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="bg-cyan-950/50 border border-cyan-800/40 rounded-xl p-3">
                <p className="font-bold text-cyan-300 mb-1">📱 ホーム画面に追加（PWA対応）</p>
                <p className="text-slate-300 text-[11px]">
                  iPhoneのSafariやAndroidのChromeで開いて**「ホーム画面に追加」**すると、アプリとしてアイコンが作成され、全画面で起動できます。
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3">
                <p className="font-bold text-white mb-1">☁️ 無料クラウド（VercelやGitHub Pages）に公開</p>
                <p className="text-slate-400 text-[11px]">
                  Web上に無料公開すれば、Macの電源を完全に切っていても、ジムでも外出先でもスマホ1台で24時間利用できます。データはスマホの端末内に自動保存されます。
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs text-white"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
