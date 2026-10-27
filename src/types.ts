export type BodyPart = 'back' | 'chest' | 'shoulder' | 'arm' | 'leg' | 'abs';

export type EquipmentType = 'bodyweight' | 'dumbbell' | 'pullup_bar';

export interface WorkoutSet {
  weightKg?: number; // ダンベル重量 or 加重 (+kg)。自重時は未指定
  reps: number;
  isWarmup?: boolean;
  dropSet?: boolean;
  note?: string;
}

export interface ExerciseRecord {
  id: string;
  date: string; // ISO string '2026-10-18T10:00:00Z'
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface Exercise {
  id: string;
  name: string;
  targetPart: BodyPart;
  equipment: EquipmentType;
  difficulty?: 'beginner' | 'intermediate'; // 初心者向け目印
  recommendedRestDays: number; // 推奨休息日数（胸/背中/脚 2〜3日, 腕/肩 2日, 腹筋 1日）
  defaultWeightKg?: number;
  tips?: string; // 初心者向けのフォームやコツ
}

export interface BodyPartInfo {
  id: BodyPart;
  name: string;
  recommendedRestDays: number;
  description: string;
}

// 1RM推定計算（オコナー式 / エプリー式）
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  const oneRM = weightKg * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
}

// 総ボリューム計算
export function calculateVolume(sets: WorkoutSet[]): number {
  return sets.reduce((sum, s) => {
    const w = s.weightKg ?? 0;
    return sum + (w * s.reps);
  }, 0);
}

export const BODY_PARTS: Record<BodyPart, BodyPartInfo> = {
  chest: {
    id: 'chest',
    name: '胸',
    recommendedRestDays: 3,
    description: '大胸筋。膝つき腕立て伏せから始めて、慣れたらダンベルプレスへ！'
  },
  back: {
    id: 'back',
    name: '背中',
    recommendedRestDays: 3,
    description: '広背筋・背筋。斜め懸垂や足つき懸垂、軽めのダンベルロウが安心。'
  },
  shoulder: {
    id: 'shoulder',
    name: '肩',
    recommendedRestDays: 2,
    description: '三角筋。軽いダンベル（2〜4kg）やパイクプッシュアップで丸い肩へ。'
  },
  arm: {
    id: 'arm',
    name: '腕',
    recommendedRestDays: 2,
    description: '力こぶ（二頭筋）と二の腕（三頭筋）。ダンベルカールやベンチディップス。'
  },
  leg: {
    id: 'leg',
    name: '脚・お尻',
    recommendedRestDays: 3,
    description: '下半身全体。自重スクワットやランジなど、体の中で一番カロリーを消費する部位！'
  },
  abs: {
    id: 'abs',
    name: 'お腹（腹筋）',
    recommendedRestDays: 1,
    description: 'お腹周り・体幹。プランクや膝上げクランチなど自重で十分効きます！'
  }
};

export const INITIAL_EXERCISES: Exercise[] = [
  // --- 胸 (大胸筋) ---
  {
    id: 'pushup_knees',
    name: '膝つき腕立て伏せ (ニープッシュアップ)',
    targetPart: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: '【初心者おすすめ】床に膝をついて行う腕立て伏せ。腰を反らさず胸を床に近づけましょう！'
  },
  {
    id: 'pushup_standard',
    name: 'ノーマル 腕立て伏せ (プッシュアップ)',
    targetPart: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 3,
    tips: '手幅は肩幅の1.5倍。頭からかかとまで一直線をキープしてゆっくり下ろします。'
  },
  {
    id: 'dumbbell_floor_press',
    name: 'ダンベル フロアプレス (床プレス)',
    targetPart: 'chest',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 3,
    defaultWeightKg: 5,
    tips: 'ベンチ不要！床に仰向けでダンベルを持ち上げます。肘が床につく直前で切り返すと安全です。'
  },
  {
    id: 'dips_chair',
    name: 'チェア ディップス (椅子で二の腕・胸下部)',
    targetPart: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: '椅子の端に手をつき、お尻を真下に下ろします。足を曲げると負荷を軽く調整できます。'
  },

  // --- 背中 ---
  {
    id: 'pullup_assisted',
    name: '足つき懸垂 / ネガティブ懸垂',
    targetPart: 'back',
    equipment: 'pullup_bar',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: '【初心者おすすめ】台や床に足をついた状態で懸垂。またはジャンプして上に行き「下りる時だけ3秒かける」とすぐ背筋がつきます！'
  },
  {
    id: 'dumbbell_row_single',
    name: 'ワンハンド ダンベルロウ',
    targetPart: 'back',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 3,
    defaultWeightKg: 5,
    tips: '椅子に片手・片膝をつき、肘を腰のほうへ引き上げます。背中を丸めないのがポイント！'
  },
  {
    id: 'pullup_chinup',
    name: 'チンニング (逆手懸垂)',
    targetPart: 'back',
    equipment: 'pullup_bar',
    recommendedRestDays: 3,
    tips: '手のひらを自分に向けて握る懸垂。腕の力も使えるのでノーマル懸垂より上がりやすいです。'
  },
  {
    id: 'pullup_standard',
    name: '懸垂 (順手ノーマルグリップ)',
    targetPart: 'back',
    equipment: 'pullup_bar',
    recommendedRestDays: 3,
    tips: '背中の王道種目。胸をバーに近づける意識でバーを引きつけます。'
  },

  // --- 脚・下半身 ---
  {
    id: 'bodyweight_squat',
    name: '自重スクワット (ノーマル)',
    targetPart: 'leg',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: '【超基本】足を肩幅に開き、椅子に腰掛けるようにお尻を後ろに引いてしゃがみます。膝がつま先より前に出すぎないように！'
  },
  {
    id: 'bodyweight_lunge',
    name: 'ウォーキング / バックランジ',
    targetPart: 'leg',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: '片足を後ろに大きく引いて腰を沈める。お尻（臀筋）や太もも裏の引き締めに効果大！'
  },
  {
    id: 'goblet_squat',
    name: 'ゴブレットスクワット (ダンベル)',
    targetPart: 'leg',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 3,
    defaultWeightKg: 5,
    tips: 'ダンベル1個を両手で胸の前に抱えてスクワット。姿勢が安定して太ももに効きやすいです。'
  },
  {
    id: 'bulgarian_split_squat',
    name: 'ブルガリアン スプリットスクワット',
    targetPart: 'leg',
    equipment: 'bodyweight',
    recommendedRestDays: 3,
    tips: '片足を後ろの椅子に乗せて行うスクワット。自重だけでも十分強烈に効きます！'
  },

  // --- 肩 ---
  {
    id: 'dumbbell_side_raise',
    name: 'ダンベル サイドレイズ',
    targetPart: 'shoulder',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    defaultWeightKg: 3,
    tips: '【初心者おすすめ】軽めの重さ（2〜3kg）でOK！腕を真横にふわりと持ち上げ、肩の横（三角筋）を狙います。'
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'ダンベル ショルダープレス',
    targetPart: 'shoulder',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    defaultWeightKg: 5,
    tips: 'ダンベルを耳の横から頭上へ押し上げます。腰を反らないようお腹に軽く力を入れましょう。'
  },
  {
    id: 'pike_pushup',
    name: 'パイクプッシュアップ (自重肩トレ)',
    targetPart: 'shoulder',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: 'お尻を高く突き上げて「山」の形を作り、頭を斜め前方に下ろす腕立て伏せ。器具なしで肩を鍛えられます。'
  },

  // --- 腕 ---
  {
    id: 'dumbbell_bicep_curl',
    name: 'ダンベル アームカール (力こぶ)',
    targetPart: 'arm',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    defaultWeightKg: 4,
    tips: '肘の位置を脇腹に固定し、ダンベルを巻き上げます。下ろす時に勢いで落とさずゆっくり耐えましょう！'
  },
  {
    id: 'diamond_pushup',
    name: 'ナロープッシュアップ (二の腕)',
    targetPart: 'arm',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    tips: '手幅を狭くして行う腕立て伏せ（膝つきでもOK）。二の腕（上腕三頭筋）に刺激が入ります。'
  },
  {
    id: 'dumbbell_kickback',
    name: 'ダンベル キックバック (二の腕引き締め)',
    targetPart: 'arm',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    recommendedRestDays: 2,
    defaultWeightKg: 3,
    tips: '前傾姿勢で肘を高く上げ、後方に腕を伸ばします。二の腕がキュッと縮む感覚を意識！'
  },

  // --- お腹（腹筋・体幹） ---
  {
    id: 'floor_plank',
    name: 'フロントプランク (体幹キープ)',
    targetPart: 'abs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 1,
    tips: '【初心者おすすめ】肘をついて体を一直線に保ちます。回数ではなく「30秒キープ」を2〜3セット目指しましょう！'
  },
  {
    id: 'lying_knee_raise',
    name: '寝転がりレッグレイズ / ニーレイズ',
    targetPart: 'abs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    recommendedRestDays: 1,
    tips: '床に仰向けになり、膝を胸に引き寄せます。腰が浮かないようおへそを床に押し付けるのがコツ！'
  },
  {
    id: 'hanging_knee_raise',
    name: 'ハンギング ニーレイズ (ぶら下がり膝上げ)',
    targetPart: 'abs',
    equipment: 'pullup_bar',
    difficulty: 'beginner',
    recommendedRestDays: 1,
    tips: '懸垂機にぶら下がって膝をお腹に引き上げます。下腹部のポッコリお腹解消に効果抜群！'
  }
];
