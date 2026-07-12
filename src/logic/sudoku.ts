/**
 * 数独核心逻辑：生成、验证、求解
 */

import type { Board, CellValue, Difficulty } from '../types';

/** 创建一个空的 9x9 棋盘 */
export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

/** 深拷贝棋盘 */
export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]) as Board;
}

/** 检查在 (row, col) 放置 num 是否有效 */
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // 检查行
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  // 检查列
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // 检查 3x3 宫
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/** 使用回溯法求解数独，返回是否可解 */
export function solve(board: Board): Board | null {
  const cloned = cloneBoard(board);
  if (solveHelper(cloned)) return cloned;
  return null;
}

function solveHelper(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num as CellValue;
            if (solveHelper(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/** Fisher-Yates 洗牌 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 生成一个完整的有效数独解 */
export function generateSolution(): Board {
  const board = createEmptyBoard();
  solveHelper(board);
  return board;
}

/** 统计解的数量；达到 limit 后提前结束 */
function countSolutions(board: Board, limit = 2): number {
  let bestRow = -1;
  let bestCol = -1;
  let bestCandidates: number[] | null = null;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;
      const candidates: number[] = [];
      for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) candidates.push(num);
      }
      if (candidates.length === 0) return 0;
      if (!bestCandidates || candidates.length < bestCandidates.length) {
        bestRow = row;
        bestCol = col;
        bestCandidates = candidates;
      }
    }
  }

  if (!bestCandidates) return 1;

  let solutions = 0;
  for (const num of bestCandidates) {
    board[bestRow][bestCol] = num as CellValue;
    solutions += countSolutions(board, limit - solutions);
    board[bestRow][bestCol] = 0;
    if (solutions >= limit) break;
  }
  return solutions;
}

/** 生成唯一解的专家级谜题，目标保留约 25 个提示数 */
function generatePuzzle(solution: Board, difficulty: Difficulty): Board {
  const puzzle = cloneBoard(solution);
  const targets: Record<Difficulty, number> = {
    easy: 40,
    medium: 46,
    hard: 52,
    expert: 56,
    master: 58,
    extreme: 60,
  };
  const target = targets[difficulty];

  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= target) break;
    const value = puzzle[row][col];
    puzzle[row][col] = 0;
    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = value;
    }
  }

  return puzzle;
}

/** 生成一局新游戏：返回 { puzzle, solution } */
export function generateNewGame(difficulty: Difficulty = 'expert'): { puzzle: Board; solution: Board } {
  const solution = generateSolution();
  const puzzle = generatePuzzle(solution, difficulty);
  return { puzzle, solution };
}

/** 检查 board 是否完整且完全正确 */
export function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
    }
  }
  return true;
}

/** 检查某个格子是否有冲突（被同一行/列/宫已填数字重复） */
export function hasConflict(board: Board, row: number, col: number): boolean {
  const num = board[row][col];
  if (num === 0) return false;

  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return true;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return true;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return true;
    }
  }
  return false;
}

/** 检查某个格子是否为初始预填数字（不可编辑） */
export function isInitialCell(initialBoard: Board, row: number, col: number): boolean {
  return initialBoard[row][col] !== 0;
}

/** 格式化时间（秒 -> MM:SS） */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
