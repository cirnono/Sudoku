/** 数独格子值：0 表示空格，1-9 为填入数字 */
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 9x9 棋盘，每行 9 个格子 */
export type Board = CellValue[][];

/** 单个格子的坐标 */
export interface CellPosition {
  row: number;
  col: number;
}

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'extreme';
export type PaletteId = 'ocean' | 'forest' | 'sunset' | 'lavender' | 'rose';
export type Language = 'zh' | 'en';

export interface GamePreferences {
  difficulty: Difficulty;
  paletteId: PaletteId;
  quickMode: boolean;
  language: Language;
  soundEnabled: boolean;
}

/** 笔记模式下的候选数字记录：row-col -> Set<数字> */
export type Notes = Record<string, Set<number>>;

/** 持久化的游戏进度 */
export interface SavedGame {
  board: Board;
  solution: Board;
  initialBoard: Board;
  notes: Record<string, number[]>;
  timer: number;
  status: GameStatus;
  savedAt: number;
  difficulty?: Difficulty;
  paletteId?: PaletteId;
}

/** 游戏 Store 状态 */
export interface GameState {
  // 棋盘数据
  board: Board;
  solution: Board;
  initialBoard: Board;
  notes: Notes;

  // 游戏元信息
  status: GameStatus;
  timer: number;
  selectedCell: CellPosition | null;

  // 铅笔模式开关
  noteMode: boolean;
  candidatesEnabled: boolean;
  quickMode: boolean;
  selectedNumber: CellValue | null;
  difficulty: Difficulty;
  paletteId: PaletteId;
  language: Language;
  soundEnabled: boolean;

  // 历史记录（用于撤销）
  history: { board: Board; notes: Notes }[];

  // 操作
  newGame: () => void;
  restartGame: () => void;
  selectDifficulty: (difficulty: Difficulty) => void;
  selectPalette: (paletteId: PaletteId) => void;
  saveCheckpoint: () => Promise<boolean>;
  loadCheckpoint: () => Promise<boolean>;
  applyPreferences: (preferences: GamePreferences) => void;
  toggleLanguage: () => void;
  toggleSound: () => void;
  selectCell: (pos: CellPosition | null) => void;
  pressCell: (pos: CellPosition) => void;
  selectNumber: (num: CellValue) => void;
  fillNumber: (num: CellValue) => void;
  toggleNote: (num: number) => void;
  eraseCell: () => void;
  undo: () => void;
  tick: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  toggleNoteMode: () => void;
  toggleCandidates: () => void;
  toggleQuickMode: () => void;
  loadGame: (saved: SavedGame) => void;
  getSavedGame: () => SavedGame | null;
}
