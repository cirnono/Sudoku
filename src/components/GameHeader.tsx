/**
 * 游戏顶部操作栏：计时、暂停、撤销、擦除、铅笔、一键候选
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../logic/sudoku';
import type { Difficulty, PaletteId } from '../types';
import { HIGHLIGHT_PALETTES } from '../theme/palettes';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家',
  master: '大师',
  extreme: '极限',
};

export const GameHeader: React.FC = () => {
  const timer = useGameStore(s => s.timer);
  const status = useGameStore(s => s.status);
  const newGame = useGameStore(s => s.newGame);
  const restartGame = useGameStore(s => s.restartGame);
  const resumeGame = useGameStore(s => s.resumeGame);
  const pauseGame = useGameStore(s => s.pauseGame);
  const difficulty = useGameStore(s => s.difficulty);
  const selectDifficulty = useGameStore(s => s.selectDifficulty);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const paletteId = useGameStore(s => s.paletteId);
  const selectPalette = useGameStore(s => s.selectPalette);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleDifficulty = (nextDifficulty: Difficulty) => {
    setDifficultyOpen(false);
    selectDifficulty(nextDifficulty);
  };

  return (
    <View style={styles.headerContainer}>
      <View pointerEvents="none" style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.difficultyBadge}
          onPress={() => setDifficultyOpen(true)}
        >
          <Text style={styles.difficultyText}>{DIFFICULTY_LABELS[difficulty]} ▾</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerActionBtn, styles.paletteBtn]}
          onPress={() => setPaletteOpen(true)}
        >
          <Text style={styles.headerActionText}>配色</Text>
        </TouchableOpacity>
        {status === 'paused' ? (
          <TouchableOpacity style={styles.resumeBtn} onPress={resumeGame}>
            <Text style={styles.resumeBtnText}>继续</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={pauseGame}
            disabled={status !== 'playing'}
          >
            <Text style={[styles.headerActionText, status !== 'playing' && styles.disabledText]}>
              暂停
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerActionBtn} onPress={newGame}>
          <Text style={styles.headerActionText}>新局</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerActionBtn} onPress={restartGame}>
          <Text style={styles.headerActionText}>重玩</Text>
        </TouchableOpacity>
        </View>
      </View>
      <Modal transparent visible={difficultyOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setDifficultyOpen(false)}>
          <Pressable style={styles.difficultyMenu}>
            <Text style={styles.menuTitle}>选择难度</Text>
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.difficultyOption, option === difficulty && styles.difficultyOptionActive]}
                onPress={() => handleDifficulty(option)}
              >
                <Text style={[styles.optionText, option === difficulty && styles.optionTextActive]}>
                  {DIFFICULTY_LABELS[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal transparent visible={paletteOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setPaletteOpen(false)}>
          <Pressable style={styles.difficultyMenu}>
            <Text style={styles.menuTitle}>高亮色盘</Text>
            {(Object.keys(HIGHLIGHT_PALETTES) as PaletteId[]).map(option => {
              const optionPalette = HIGHLIGHT_PALETTES[option];
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.paletteOption, option === paletteId && {
                    backgroundColor: optionPalette.activeControl,
                  }]}
                  onPress={() => {
                    selectPalette(option);
                    setPaletteOpen(false);
                  }}
                >
                  <View style={styles.swatches}>
                    <View style={[styles.swatch, { backgroundColor: optionPalette.related }]} />
                    <View style={[styles.swatch, { backgroundColor: optionPalette.selected }]} />
                    <View style={[styles.swatch, { backgroundColor: optionPalette.sameNumber }]} />
                  </View>
                  <Text style={[styles.optionText, option === paletteId && {
                    color: optionPalette.activeText,
                    fontWeight: '700',
                  }]}>{optionPalette.name}</Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

/** 棋盘下方的游戏操作区 */
export const GameActions: React.FC = () => {
  const status = useGameStore(s => s.status);
  const noteMode = useGameStore(s => s.noteMode);
  const candidatesEnabled = useGameStore(s => s.candidatesEnabled);
  const quickMode = useGameStore(s => s.quickMode);
  const history = useGameStore(s => s.history);
  const undo = useGameStore(s => s.undo);
  const eraseCell = useGameStore(s => s.eraseCell);
  const newGame = useGameStore(s => s.newGame);
  const toggleNoteMode = useGameStore(s => s.toggleNoteMode);
  const toggleCandidates = useGameStore(s => s.toggleCandidates);
  const toggleQuickMode = useGameStore(s => s.toggleQuickMode);
  const selectedCell = useGameStore(s => s.selectedCell);
  const initialBoard = useGameStore(s => s.initialBoard);
  const saveCheckpoint = useGameStore(s => s.saveCheckpoint);
  const loadCheckpoint = useGameStore(s => s.loadCheckpoint);

  const canUndo = history.length > 0 && status === 'playing';
  const canErase =
    selectedCell &&
    status === 'playing' &&
    !(initialBoard[selectedCell.row]?.[selectedCell.col] !== 0);

  return (
    <View style={styles.actionsContainer}>
      <View style={styles.actionRow}>
        <ActionButton
          label="存档"
          icon="⬇"
          onPress={async () => {
            const saved = await saveCheckpoint();
            Alert.alert(saved ? '已存档' : '存档失败', saved ? '当前盘面已保存到测试存档。' : '当前没有可保存的游戏。');
          }}
          disabled={status !== 'playing'}
        />
        <ActionButton
          label="读档"
          icon="⬆"
          onPress={async () => {
            const loaded = await loadCheckpoint();
            Alert.alert(loaded ? '已读档' : '没有存档', loaded ? '盘面已恢复到测试存档状态。' : '请先保存一个测试存档。');
          }}
        />
        <ActionButton
          label="撤销"
          icon="↩"
          onPress={undo}
          disabled={!canUndo}
        />
        <ActionButton
          label="擦除"
          icon="✕"
          onPress={eraseCell}
          disabled={!canErase}
        />
        <ActionButton
          label={candidatesEnabled ? '候选开' : '候选'}
          icon="✚"
          onPress={toggleCandidates}
          disabled={status !== 'playing'}
          active={candidatesEnabled}
        />
        <ActionButton
          label={noteMode ? '笔记' : '铅笔'}
          icon="✏"
          onPress={toggleNoteMode}
          disabled={status !== 'playing'}
          active={noteMode}
        />
        <ActionButton
          label={quickMode ? '快速开' : '快速'}
          icon="⚡"
          onPress={toggleQuickMode}
          disabled={status !== 'playing'}
          active={quickMode}
        />
      </View>
    </View>
  );
};

interface ActionButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onPress,
  disabled = false,
  active = false,
}) => {
  const paletteId = useGameStore(s => s.paletteId);
  const palette = HIGHLIGHT_PALETTES[paletteId];
  return (
    <TouchableOpacity
    style={[styles.actionBtn, active && [styles.actionBtnActive, { backgroundColor: palette.activeControl }]]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.6}
  >
    <Text style={[styles.actionIcon, disabled && styles.disabledText]}>
      {icon}
    </Text>
    <Text
      style={[
        styles.actionLabel,
        disabled && styles.disabledText,
        active && [styles.actionLabelActive, { color: palette.activeText }],
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    width: '100%',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerActionBtn: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 8,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#444',
    fontWeight: '600',
  },
  paletteBtn: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 8,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  difficultyBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '600',
  },
  timer: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  resumeBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resumeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  newGameBtn: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  newGameBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    minWidth: 44,
  },
  actionBtnActive: {
    backgroundColor: '#fff3e0',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  actionLabelActive: {
    color: '#e65100',
    fontWeight: '700',
  },
  disabledText: {
    opacity: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyMenu: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },
  difficultyOption: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  difficultyOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#444',
  },
  optionTextActive: {
    color: '#1565c0',
    fontWeight: '700',
  },
  paletteOption: {
    minHeight: 48,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatches: {
    flexDirection: 'row',
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: -4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
});
