export interface BadgeTier {
  id: string;
  level: number;
  name: string;
  title: string;
  minExp: number;
  icon: 'sprout' | 'shield' | 'crown';
  gradient: string;
  border: string;
  text: string;
  bgLight: string;
  description: string;
  philosophy: string;
}

export const GAMIFICATION_TIERS: BadgeTier[] = [
  {
    id: 'tunas-hijau',
    level: 1,
    name: 'Tunas Hijau',
    title: 'Relawan Pemula',
    minExp: 0,
    icon: 'sprout',
    gradient: 'from-emerald-500 to-green-600',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/60',
    description: 'Langkah awal kepedulian warga Sleman dalam pelaporan sampah liar.',
    philosophy: 'Melambangkan benih kesadaran ekologis yang mulai berakar di bumi Sleman.'
  },
  {
    id: 'cakra-lestari',
    level: 2,
    name: 'Cakra Lestari',
    title: 'Penjaga Lingkungan Sleman',
    minExp: 200,
    icon: 'shield',
    gradient: 'from-sky-500 to-blue-600',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    bgLight: 'bg-blue-50 dark:bg-blue-950/60',
    description: 'Konsistensi tinggi dalam aksi nyata pelaporan tervalidasi dan keikutsertaan aksi bersih.',
    philosophy: 'Simbol perisai pertahanan alam Sleman yang lestari dan berkelanjutan.'
  },
  {
    id: 'adipura-sleman',
    level: 3,
    name: 'Adipura Sleman',
    title: 'Pahlawan Kebersihan Sleman',
    minExp: 500,
    icon: 'crown',
    gradient: 'from-amber-400 to-yellow-600',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    bgLight: 'bg-amber-50 dark:bg-amber-950/60',
    description: 'Dedikasi luar biasa mewujudkan Sleman Sembada bersih dan bebas sampah liar.',
    philosophy: 'Puncak kehormatan sipil bagi pahlawan lingkungan penegak adipura sejati.'
  }
];

export const XP_RULES = {
  APPROVED_REPORT: 50,
  CAMPAIGN_ATTENDANCE: 100,
} as const;

export interface UserGamificationProgress {
  currentExp: number;
  currentLevel: number;
  levelTitle: string;
  activeBadge: BadgeTier;
  minExp: number;
  nextLevelExp: number | null;
  expNeeded: number;
  progressPercent: number;
  isMaxLevel: boolean;
  allBadges: Array<BadgeTier & { isUnlocked: boolean; progressToUnlock: number }>;
}

export function calculateLevelProgress(expInput: number | null | undefined): UserGamificationProgress {
  const currentExp = Math.max(0, expInput || 0);

  let currentLevel = 1;
  let activeTier = GAMIFICATION_TIERS[0];

  if (currentExp >= 500) {
    currentLevel = 3;
    activeTier = GAMIFICATION_TIERS[2];
  } else if (currentExp >= 200) {
    currentLevel = 2;
    activeTier = GAMIFICATION_TIERS[1];
  } else {
    currentLevel = 1;
    activeTier = GAMIFICATION_TIERS[0];
  }

  let minExp = 0;
  let nextLevelExp: number | null = null;
  let expNeeded = 0;
  let progressPercent = 100;
  let isMaxLevel = false;

  if (currentLevel === 1) {
    minExp = 0;
    nextLevelExp = 200;
    const range = nextLevelExp - minExp;
    const progress = currentExp - minExp;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    expNeeded = Math.max(0, nextLevelExp - currentExp);
  } else if (currentLevel === 2) {
    minExp = 200;
    nextLevelExp = 500;
    const range = nextLevelExp - minExp;
    const progress = currentExp - minExp;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    expNeeded = Math.max(0, nextLevelExp - currentExp);
  } else {
    minExp = 500;
    nextLevelExp = null;
    progressPercent = 100;
    expNeeded = 0;
    isMaxLevel = true;
  }

  const allBadges = GAMIFICATION_TIERS.map(tier => {
    const isUnlocked = currentExp >= tier.minExp;
    let progressToUnlock = 100;
    if (!isUnlocked && tier.minExp > 0) {
      progressToUnlock = Math.min(99, Math.round((currentExp / tier.minExp) * 100));
    }
    return {
      ...tier,
      isUnlocked,
      progressToUnlock
    };
  });

  return {
    currentExp,
    currentLevel,
    levelTitle: activeTier.title,
    activeBadge: activeTier,
    minExp,
    nextLevelExp,
    expNeeded,
    progressPercent,
    isMaxLevel,
    allBadges
  };
}

export function getRankBadgeMeta(rank: number) {
  if (rank === 1) {
    return {
      title: 'Juara 1',
      medal: '🥇',
      bgGradient: 'from-amber-400 via-yellow-300 to-amber-500',
      border: 'border-yellow-400',
      textColor: 'text-amber-900',
      podiumBg: 'bg-gradient-to-t from-yellow-500 to-yellow-300',
      heightClass: 'h-40',
      rankBadge: 'bg-yellow-500 text-yellow-950 font-extrabold'
    };
  }
  if (rank === 2) {
    return {
      title: 'Juara 2',
      medal: '🥈',
      bgGradient: 'from-slate-200 via-gray-300 to-slate-400',
      border: 'border-slate-300',
      textColor: 'text-slate-800',
      podiumBg: 'bg-gradient-to-t from-slate-400 to-slate-200',
      heightClass: 'h-32',
      rankBadge: 'bg-slate-300 text-slate-800 font-bold'
    };
  }
  if (rank === 3) {
    return {
      title: 'Juara 3',
      medal: '🥉',
      bgGradient: 'from-amber-700 via-amber-600 to-amber-800',
      border: 'border-amber-700',
      textColor: 'text-amber-950',
      podiumBg: 'bg-gradient-to-t from-amber-700 to-amber-500',
      heightClass: 'h-24',
      rankBadge: 'bg-amber-700 text-white font-bold'
    };
  }
  return null;
}
