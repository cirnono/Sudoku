/**
 * Zustand 游戏状态管理
 */

import { create } from 'zustand';
import type {
  Board,
  CellValue,
  GameState,
  Notes,
  SavedGame,
} from '../types';
import {
  cloneBoard,
  generateNewGame,
  isBoardComplete,
  isInitialCell,
  isValid,
} from '../logic/sudoku';
import {
  clearManualCheckpoint,
  loadManualCheckpoint,
  saveGameProgress,
  saveManualCheckpoint,
  savePreferences,
} from '../utils/storage';

/** 从 SavedGame 中恢复 Notes 格式 */
function restoreNotes(saved: Record<string, number[]>): Notes {
  const notes: Notes = {};
  for (const [key, nums] of Object.entries(saved)) {
    notes[key] = new Set(nums);
  }
  return notes;
}

/** 将 Notes 转为可序列化格式 */
function serializeNotes(notes: Notes): Record<string, number[]> {
  const serialized: Record<string, number[]> = {};
  for (const [key, set] of Object.entries(notes)) {
    serialized[key] = Array.from(set);
  }
  return serialized;
}

/** 深拷贝 Notes（Set 也克隆） */
function cloneNotes(notes: Notes): Notes {
  const result: Notes = {};
  for (const [key, set] of Object.entries(notes)) {
    result[key] = new Set(set);
  }
  return result;
}

export const useGameStore = create<GameState>()((set, get) => ({
  // ---- 初始状态 ----
  board: [],
  solution: [],
  initialBoard: [],
  notes: {},
  status: 'idle',
  timer: 0,
  selectedCell: null,
  noteMode: false,
  candidatesEnabled: false,
  quickMode: false,
  selectedNumber: null,
  difficulty: 'expert',
  paletteId: 'ocean',
  history: [],

  // ---- 操作 ----

  /** 开始新游戏（固定困难难度） */
  newGame: () => {
    clearManualCheckpoint();
    const { difficulty } = get();
    const { puzzle, solution } = generateNewGame(difficulty);
    set({
      board: cloneBoard(puzzle),
      solution,
      initialBoard: cloneBoard(puzzle),
      notes: {},
      status: 'playing',
      timer: 0,
      selectedCell: null,
      noteMode: false,
      candidatesEnabled: false,
      selectedNumber: null,
      history: [],
    });

    // 异步持久化
    const state = get();
    const saved: SavedGame = {
      board: state.board,
      solution: state.solution,
      initialBoard: state.initialBoard,
      notes: serializeNotes(state.notes),
      timer: state.timer,
      status: state.status,
      savedAt: Date.now(),
      difficulty: state.difficulty,
      paletteId: state.paletteId,
    };
    saveGameProgress(saved);
  },

  /** 保留当前题目并从头重玩 */
  restartGame: () => {
    const { initialBoard } = get();
    if (!initialBoard.length) return;
    set({
      board: cloneBoard(initialBoard),
      notes: {},
      status: 'playing',
      timer: 0,
      selectedCell: null,
      selectedNumber: null,
      noteMode: false,
      candidatesEnabled: false,
      history: [],
    });

    const saved = get().getSavedGame();
    if (saved) saveGameProgress(saved);
  },

  /** 选择难度后立即开始新游戏 */
  selectDifficulty: (difficulty) => {
    set({ difficulty });
    const { paletteId, quickMode } = get();
    savePreferences({ difficulty, paletteId, quickMode });
    get().newGame();
  },

  selectPalette: (paletteId) => {
    set({ paletteId });
    const { difficulty, quickMode } = get();
    savePreferences({ difficulty, paletteId, quickMode });
    const saved = get().getSavedGame();
    if (saved) saveGameProgress(saved);
  },

  applyPreferences: (preferences) => {
    set(preferences);
  },

  /** 保存当前状态到独立的手动测试存档槽 */
  saveCheckpoint: async () => {
    const snapshot = get().getSavedGame();
    return snapshot ? saveManualCheckpoint(snapshot) : false;
  },

  /** 从手动测试存档槽完整恢复盘面 */
  loadCheckpoint: async () => {
    const saved = await loadManualCheckpoint();
    if (!saved) return false;
    get().loadGame({ ...saved, status: 'playing' });
    const current = get().getSavedGame();
    if (current) saveGameProgress(current);
    return true;
  },

  /** 选中一个格子 */
  selectCell: (pos) => {
    set({ selectedCell: pos });
  },

  /** 点击格子；快速模式下直接填入预先选择的数字 */
  pressCell: (pos) => {
    const { quickMode, selectedNumber } = get();
    set({ selectedCell: pos });
    if (quickMode && selectedNumber !== null) {
      get().fillNumber(selectedNumber);
    }
  },

  /** 快速模式选择数字，普通模式仍然直接填写当前格 */
  selectNumber: (num) => {
    if (get().quickMode) {
      set(state => ({ selectedNumber: state.selectedNumber === num ? null : num }));
    } else {
      get().fillNumber(num);
    }
  },

  /** 填入数字 */
  fillNumber: (num) => {
    const state = get();
    const {
      selectedCell,
      board,
      initialBoard,
      status,
      history,
      notes,
      noteMode,
      quickMode,
      selectedNumber,
    } = state;

    if (!selectedCell || status !== 'playing') return;
    const { row, col } = selectedCell;

    // 初始格不可编辑
    if (isInitialCell(initialBoard, row, col)) return;

    if (noteMode) {
      // 铅笔模式：切换候选数字
      const key = `${row}-${col}`;
      const newNotes = cloneNotes(notes);
      if (!newNotes[key]) newNotes[key] = new Set();

      if (newNotes[key].has(num)) {
        newNotes[key] = new Set([...newNotes[key]].filter(n => n !== num));
        if (newNotes[key].size === 0) delete newNotes[key];
      } else {
        newNotes[key] = new Set([...newNotes[key], num]);
      }

      set({
        notes: newNotes,
        history: [...history, { board: cloneBoard(board), notes: cloneNotes(notes) }],
      });
    } else {
      // 正常填数
      if (board[row][col] === num) {
        // 点击同一个数字则擦除
        const newBoard = cloneBoard(board);
        newBoard[row][col] = 0;
        set({
          board: newBoard,
          history: [...history, { board: cloneBoard(board), notes: cloneNotes(notes) }],
        });
        return;
      }

      const newBoard = cloneBoard(board);
      newBoard[row][col] = num;

      // 清除该格笔记
      const newNotes = cloneNotes(notes);
      const key = `${row}-${col}`;
      delete newNotes[key];

      // 自动清除同行/列/宫中相同数字的候选
      for (let i = 0; i < 9; i++) {
        const rowKey = `${row}-${i}`;
        const colKey = `${i}-${col}`;
        if (newNotes[rowKey]) {
          newNotes[rowKey] = new Set([...newNotes[rowKey]].filter(n => n !== num));
          if (newNotes[rowKey].size === 0) delete newNotes[rowKey];
        }
        if (newNotes[colKey]) {
          newNotes[colKey] = new Set([...newNotes[colKey]].filter(n => n !== num));
          if (newNotes[colKey].size === 0) delete newNotes[colKey];
        }
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const boxKey = `${r}-${c}`;
          if (newNotes[boxKey]) {
            newNotes[boxKey] = new Set([...newNotes[boxKey]].filter(n => n !== num));
            if (newNotes[boxKey].size === 0) delete newNotes[boxKey];
          }
        }
      }

      const completed = isBoardComplete(newBoard);
      const numberIsComplete = newBoard.reduce(
        (count, boardRow) => count + boardRow.filter(value => value === num).length,
        0,
      ) >= 9;
      const nextSelectedNumber: CellValue | null =
        quickMode && selectedNumber === num && numberIsComplete
          ? (num === 9 ? 1 : (num + 1) as CellValue)
          : selectedNumber;

      set({
        board: newBoard,
        notes: newNotes,
        history: [...history, { board: cloneBoard(board), notes: cloneNotes(notes) }],
        selectedCell: completed ? null : selectedCell,
        selectedNumber: nextSelectedNumber,
        status: completed ? 'completed' : 'playing',
      });

      // 异步持久化
      const newState = get();
      const saved: SavedGame = {
        board: newState.board,
        solution: newState.solution,
        initialBoard: newState.initialBoard,
        notes: serializeNotes(newState.notes),
        timer: newState.timer,
        status: newState.status,
        savedAt: Date.now(),
        difficulty: newState.difficulty,
        paletteId: newState.paletteId,
      };
      saveGameProgress(saved);
    }
  },

  /** 切换笔记数字（手点笔记模式） */
  toggleNote: (num) => {
    const state = get();
    const { selectedCell, notes, history } = state;
    if (!selectedCell || state.status !== 'playing') return;

    const { row, col } = selectedCell;
    const key = `${row}-${col}`;
    const newNotes = cloneNotes(notes);
    if (!newNotes[key]) newNotes[key] = new Set();

    if (newNotes[key].has(num)) {
      newNotes[key] = new Set([...newNotes[key]].filter(n => n !== num));
      if (newNotes[key].size === 0) delete newNotes[key];
    } else {
      newNotes[key] = new Set([...newNotes[key], num]);
    }

    set({
      notes: newNotes,
      history: [...history, { board: cloneBoard(state.board), notes: cloneNotes(notes) }],
    });
  },

  /** 擦除当前格数字/笔记 */
  eraseCell: () => {
    const state = get();
    const { selectedCell, board, initialBoard, history, notes } = state;
    if (!selectedCell || state.status !== 'playing') return;
    const { row, col } = selectedCell;

    if (isInitialCell(initialBoard, row, col)) return;

    const newBoard = cloneBoard(board);
    newBoard[row][col] = 0;

    const key = `${row}-${col}`;
    const newNotes = cloneNotes(notes);
    delete newNotes[key];

    set({
      board: newBoard,
      notes: newNotes,
      history: [...history, { board: cloneBoard(board), notes: cloneNotes(notes) }],
    });
  },

  /** 开关全盘候选数 */
  toggleCandidates: () => {
    const state = get();
    const { board, status, history, notes, candidatesEnabled } = state;
    if (status !== 'playing') return;

    if (candidatesEnabled) {
      set({
        notes: {},
        candidatesEnabled: false,
        history: [...history, { board: cloneBoard(board), notes: cloneNotes(notes) }],
      });
      return;
    }

    const newNotes: Notes = {};

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) continue;

        const candidates: number[] = [];
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            candidates.push(num);
          }
        }
        if (candidates.length > 0) {
          newNotes[`${row}-${col}`] = new Set(candidates);
        }
      }
    }

    set({
      notes: newNotes,
      candidatesEnabled: true,
      history: [...history, { board: cloneBoard(board), notes: cloneNotes(notes) }],
    });
  },

  /** 撤销 */
  undo: () => {
    const state = get();
    if (state.history.length === 0) return;

    const prev = state.history[state.history.length - 1];
    set({
      board: prev.board,
      notes: prev.notes,
      history: state.history.slice(0, -1),
    });
  },

  /** 切换铅笔模式 */
  toggleNoteMode: () => {
    set(state => ({ noteMode: !state.noteMode }));
  },

  /** 切换先选数字、后点格子的快速输入模式 */
  toggleQuickMode: () => {
    const quickMode = !get().quickMode;
    set({
      quickMode,
      selectedNumber: null,
    });
    const { difficulty, paletteId } = get();
    savePreferences({ difficulty, paletteId, quickMode });
  },

  /** 计时器滴答 */
  tick: () => {
    const { status } = get();
    if (status === 'playing') {
      set(state => ({ timer: state.timer + 1 }));
    }
  },

  /** 暂停游戏 */
  pauseGame: () => {
    set({ status: 'paused' });
  },

  /** 继续游戏 */
  resumeGame: () => {
    set({ status: 'playing' });
  },

  /** 从持久化加载游戏 */
  loadGame: (saved) => {
    set({
      board: saved.board,
      solution: saved.solution,
      initialBoard: saved.initialBoard,
      notes: restoreNotes(saved.notes),
      timer: saved.timer,
      status: saved.status,
      selectedCell: null,
      noteMode: false,
      candidatesEnabled: false,
      selectedNumber: null,
      history: [],
    });
  },

  /** 获取当前可保存的游戏快照 */
  getSavedGame: () => {
    const state = get();
    if (!state.board || state.board.length === 0) return null;
    return {
      board: state.board,
      solution: state.solution,
      initialBoard: state.initialBoard,
      notes: serializeNotes(state.notes),
      timer: state.timer,
      status: state.status,
      savedAt: Date.now(),
      difficulty: state.difficulty,
      paletteId: state.paletteId,
    };
  },
}));
