import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Plus } from 'lucide-react';

interface RestTimerProps {
  onClose?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialTime, setInitialTime] = useState<number>(90);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // 時間終了時のバイブレーション（対応ブラウザのみ）
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 400]);
            }
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const toggleRun = () => setIsRunning(!isRunning);

  const resetTimer = (newSec?: number) => {
    const target = newSec !== undefined ? newSec : initialTime;
    setIsRunning(false);
    setSecondsLeft(target);
    if (newSec !== undefined) {
      setInitialTime(newSec);
    }
  };

  const addSeconds = (sec: number) => {
    setSecondsLeft((prev) => prev + sec);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = Math.max(0, Math.min(100, ((initialTime - secondsLeft) / initialTime) * 100));

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-xl text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">インターバルタイマー</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Time Display */}
        <div className="flex flex-col">
          <div className="text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
            {formatTime(secondsLeft)}
            {secondsLeft === 0 && (
              <span className="text-xs font-bold text-emerald-400 animate-bounce">READY! 次のセットへ</span>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-36 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                secondsLeft === 0 ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRun}
            className={`p-3 rounded-xl font-bold flex items-center justify-center transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : secondsLeft === 0
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
          </button>
          <button
            onClick={() => resetTimer()}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="リセット"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-800">
        {[60, 90, 120, 180].map((sec) => (
          <button
            key={sec}
            onClick={() => resetTimer(sec)}
            className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${
              initialTime === sec && !isRunning
                ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sec >= 60 ? `${sec / 60}分` : `${sec}秒`}
          </button>
        ))}
      </div>
    </div>
  );
};
