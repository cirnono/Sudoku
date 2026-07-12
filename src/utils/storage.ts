/**
 * AsyncStorage 封装：保存/读取游戏进度
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GamePreferences, SavedGame } from '../types';

const STORAGE_KEY = '@sudoku_game_progress';
const CHECKPOINT_KEY = '@sudoku_manual_checkpoint';
const PREFERENCES_KEY = '@sudoku_preferences';

/** 保存游戏进度 */
export async function saveGameProgress(game: SavedGame): Promise<void> {
  try {
    const json = JSON.stringify(game);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.warn('Failed to save game progress:', e);
  }
}

/** 读取游戏进度 */
export async function loadGameProgress(): Promise<SavedGame | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as SavedGame;
  } catch (e) {
    console.warn('Failed to load game progress:', e);
    return null;
  }
}

/** 清除游戏进度 */
export async function clearGameProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear game progress:', e);
  }
}

/** 保存独立的手动测试存档，不受自动存档影响 */
export async function saveManualCheckpoint(game: SavedGame): Promise<boolean> {
  try {
    await AsyncStorage.setItem(CHECKPOINT_KEY, JSON.stringify(game));
    return true;
  } catch (e) {
    console.warn('Failed to save manual checkpoint:', e);
    return false;
  }
}

/** 读取独立的手动测试存档 */
export async function loadManualCheckpoint(): Promise<SavedGame | null> {
  try {
    const json = await AsyncStorage.getItem(CHECKPOINT_KEY);
    return json ? JSON.parse(json) as SavedGame : null;
  } catch (e) {
    console.warn('Failed to load manual checkpoint:', e);
    return null;
  }
}

/** 当前一局结束或换题时删除手动测试存档 */
export async function clearManualCheckpoint(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHECKPOINT_KEY);
  } catch (e) {
    console.warn('Failed to clear manual checkpoint:', e);
  }
}

export async function savePreferences(preferences: GamePreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

export async function loadPreferences(): Promise<GamePreferences | null> {
  try {
    const json = await AsyncStorage.getItem(PREFERENCES_KEY);
    return json ? JSON.parse(json) as GamePreferences : null;
  } catch (e) {
    console.warn('Failed to load preferences:', e);
    return null;
  }
}
