/**
 * 游戏主页面
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, Modal, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useGameStore } from '../store/gameStore';
import { Board } from '../components/Board';
import { NumberPad } from '../components/NumberPad';
import { GameActions, GameHeader } from '../components/GameHeader';
import { BottomBannerAd } from '../components/BottomBannerAd';
import { HIGHLIGHT_PALETTES } from '../theme/palettes';
import { formatTime } from '../logic/sudoku';
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
  const board = useGameStore(s => s.board);
  const selectedCell = useGameStore(s => s.selectedCell);
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const paletteId = useGameStore(s => s.paletteId);
  const timer = useGameStore(s => s.timer);
  const difficulty = useGameStore(s => s.difficulty);
  const previousStatus = useRef(status);
  const previousBoard = useRef(board);
  const previousSelection = useRef<string | null | undefined>(undefined);
  const tapPlayer = useAudioPlayer(require('../../assets/sounds/tap.wav'));
  const placePlayer = useAudioPlayer(require('../../assets/sounds/place.wav'));
  const completePlayer = useAudioPlayer(require('../../assets/sounds/complete.wav'));

  const replay = (player: typeof tapPlayer) => {
    if (!soundEnabled) return;
    player.seekTo(0);
    player.play();
  };

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
      replay(completePlayer);
    }
    previousStatus.current = status;
  }, [status]);

  useEffect(() => {
    const selectionKey = selectedCell ? `${selectedCell.row}-${selectedCell.col}` : null;
    if (
      previousSelection.current !== undefined &&
      previousSelection.current !== selectionKey &&
      status === 'playing'
    ) {
      replay(tapPlayer);
    }
    previousSelection.current = selectionKey;
  }, [selectedCell, status]);

  useEffect(() => {
    if (previousBoard.current !== board && status === 'playing' && previousBoard.current.length > 0) {
      replay(placePlayer);
    }
    previousBoard.current = board;
  }, [board, status]);

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
      <CompletionModal
        visible={status === 'completed'}
        language={language}
        time={timer}
        difficulty={difficulty}
        accent={HIGHLIGHT_PALETTES[paletteId].primary}
        onNewGame={newGame}
      />
    </View>
  );
};

interface CompletionModalProps {
  visible: boolean;
  language: 'zh' | 'en';
  time: number;
  difficulty: string;
  accent: string;
  onNewGame: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  visible,
  language,
  time,
  difficulty,
  accent,
  onNewGame,
}) => {
  const zh = language === 'zh';
  const difficultyNames: Record<string, string> = zh
    ? { easy: '简单', medium: '中等', hard: '困难', expert: '专家', master: '大师', extreme: '极限' }
    : { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', master: 'Master', extreme: 'Extreme' };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.completionBackdrop}>
        <View style={styles.completionCard}>
          <View style={styles.sparkles} pointerEvents="none">
            <Text style={[styles.sparkle, styles.sparkleOne]}>✦</Text>
            <Text style={[styles.sparkle, styles.sparkleTwo, { color: accent }]}>●</Text>
            <Text style={[styles.sparkle, styles.sparkleThree]}>✦</Text>
            <Text style={[styles.sparkle, styles.sparkleFour, { color: accent }]}>●</Text>
          </View>
          <View style={[styles.trophyCircle, { backgroundColor: `${accent}18` }]}>
            <Text style={styles.trophy}>🏆</Text>
          </View>
          <Text style={styles.completionTitle}>{zh ? '太棒了！' : 'Brilliant!'}</Text>
          <Text style={styles.completionSubtitle}>
            {zh ? '你成功完成了这局数独' : 'You completed the Sudoku puzzle'}
          </Text>
          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{zh ? '难度' : 'Difficulty'}</Text>
              <Text style={styles.resultValue}>{difficultyNames[difficulty]}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{zh ? '用时' : 'Time'}</Text>
              <Text style={styles.resultValue}>{formatTime(time)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.completionButton, { backgroundColor: accent }]}
            onPress={onNewGame}
            activeOpacity={0.8}
          >
            <Text style={styles.completionButtonText}>{zh ? '开始新游戏' : 'New Game'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  completionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  completionCard: {
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 26,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  sparkles: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle: { position: 'absolute', color: '#f4b942', fontSize: 18 },
  sparkleOne: { top: 32, left: 38 },
  sparkleTwo: { top: 68, left: 24, fontSize: 9 },
  sparkleThree: { top: 42, right: 38, fontSize: 24 },
  sparkleFour: { top: 88, right: 28, fontSize: 11 },
  trophyCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  trophy: { fontSize: 52 },
  completionTitle: { fontSize: 30, fontWeight: '800', color: '#18212f', marginBottom: 7 },
  completionSubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 24 },
  resultRow: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#f7f8fa',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 22,
  },
  resultItem: { flex: 1, alignItems: 'center' },
  resultDivider: { width: 1, backgroundColor: '#e2e6ea' },
  resultLabel: { fontSize: 12, color: '#9299a5', marginBottom: 4 },
  resultValue: { fontSize: 17, fontWeight: '700', color: '#303846' },
  completionButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
