import { Exercise, ExerciseRecord, BODY_PARTS, BodyPart } from '../types';

const STORAGE_KEY_EXERCISES = 'home_gym_exercises_v2';
const STORAGE_KEY_RECORDS = 'home_gym_records_v1';

export function loadStoredExercises(defaultExercises: Exercise[]): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXERCISES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(defaultExercises));
      return defaultExercises;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load exercises from storage', e);
    return defaultExercises;
  }
}

export function saveStoredExercises(exercises: Exercise[]) {
  try {
    localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
  } catch (e) {
    console.error('Failed to save exercises to storage', e);
  }
}

export function loadStoredRecords(): ExerciseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load records from storage', e);
    return [];
  }
}

export function saveStoredRecords(records: ExerciseRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to storage', e);
  }
}

// 経過日数（0日、1日、2日...）を計算
export function calculateDaysElapsed(lastDateIso: string | undefined): number | null {
  if (!lastDateIso) return null;
  const last = new Date(lastDateIso);
  const now = new Date();
  
  // 日付単位で比較 (0時0分で揃える)
  const dLast = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const diffTime = dNow - dLast;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// 各部位の最新実施日と経過日数を取得
export function getBodyPartStatus(
  part: BodyPart,
  exercises: Exercise[],
  records: ExerciseRecord[]
): {
  daysElapsed: number | null;
  lastDateIso?: string;
  statusType: 'today' | 'recovering' | 'ready' | 'idle' | 'never';
  label: string;
} {
  const partExerciseIds = new Set(exercises.filter(e => e.targetPart === part).map(e => e.id));
  const partRecords = records
    .filter(r => partExerciseIds.has(r.exerciseId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (partRecords.length === 0) {
    return {
      daysElapsed: null,
      statusType: 'never',
      label: '未実施'
    };
  }

  const latest = partRecords[0];
  const days = calculateDaysElapsed(latest.date);
  const recRest = BODY_PARTS[part].recommendedRestDays;

  if (days === 0) {
    return {
      daysElapsed: 0,
      lastDateIso: latest.date,
      statusType: 'today',
      label: '本日完了！'
    };
  } else if (days !== null && days < recRest) {
    return {
      daysElapsed: days,
      lastDateIso: latest.date,
      statusType: 'recovering',
      label: `回復中 (中${days}日)`
    };
  } else if (days !== null && days >= recRest && days <= recRest + 4) {
    return {
      daysElapsed: days,
      lastDateIso: latest.date,
      statusType: 'ready',
      label: `鍛え時！ (中${days}日)`
    };
  } else {
    return {
      daysElapsed: days,
      lastDateIso: latest.date,
      statusType: 'idle',
      label: `空きすぎ注意 (中${days}日)`
    };
  }
}
