/**
 * 游戏主页面
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Board } from '../components/Board';
import { NumberPad } from '../components/NumberPad';
import { GameActions, GameHeader } from '../components/GameHeader';
import { BottomBannerAd } from '../components/BottomBannerAd';
import {
  loadGameProgress,
  saveGameProgress,
  clearGameProgress,
  clearManualCheckpoint,
  loadPreferences,
} from '../utils/storage';

export const GameScreen: React.FC = () => {
  const status = useGameStore(s => s.status);
  const newGame = useGameStore(s => s.newGame);
  const loadGame = useGameStore(s => s.loadGame);
  const tick = useGameStore(s => s.tick);
  const getSavedGame = useGameStore(s => s.getSavedGame);
  const applyPreferences = useGameStore(s => s.applyPreferences);
  const language = useGameStore(s => s.language);
  const previousStatus = useRef(status);

  // 计时器
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // 自动保存（每 5 秒）
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      const saved = getSavedGame();
      if (saved) saveGameProgress(saved);
    }, 5000);
    return () => clearInterval(interval);
  }, [status, getSavedGame]);

  // 组件卸载时保存
  useEffect(() => {
    return () => {
      const saved = getSavedGame();
      if (saved) saveGameProgress(saved);
    };
  }, [getSavedGame]);

  // 初始化：读取存档或开始新游戏
  useEffect(() => {
    const init = async () => {
      const [saved, preferences] = await Promise.all([
        loadGameProgress(),
        loadPreferences(),
      ]);
      if (preferences) applyPreferences(preferences);
      if (saved && saved.status !== 'completed') {
        loadGame(saved);
      } else {
        newGame();
      }
    };
    init();
  }, []);

  // 游戏完成时清除存档
  useEffect(() => {
    if (status === 'completed' && previousStatus.current !== 'completed') {
      clearGameProgress();
      clearManualCheckpoint();
      Alert.alert(
        language === 'zh' ? '恭喜！' : 'Congratulations!',
        language === 'zh' ? '你已成功完成本局数独。' : 'You completed the Sudoku puzzle!',
        [{ text: language === 'zh' ? '确定' : 'OK' }],
      );
    }
    previousStatus.current = status;
  }, [status, language]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.gameArea}>
        <GameHeader />
        {status === 'paused' ? (
          <View style={styles.pausedOverlay}>
            <Text style={styles.pausedTitle}>{language === 'zh' ? '游戏暂停' : 'Game paused'}</Text>
            <Text style={styles.pausedSub}>
              {language === 'zh' ? '点击“继续”回到游戏' : 'Tap “Resume” to return to the game'}
            </Text>
          </View>
        ) : (
          <>
            <Board />
            <GameActions />
            <NumberPad />
          </>
        )}
      </View>
      <BottomBannerAd />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  gameArea: {
    width: '100%',
    height: '70%',
    justifyContent: 'space-between',
  },
  pausedOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  pausedSub: {
    fontSize: 16,
    color: '#888',
  },
});
