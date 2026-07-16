/**
 * 游戏顶部操作栏：计时、暂停、撤销、擦除、铅笔、一键候选
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Alert, Linking } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../logic/sudoku';
import type { Difficulty, PaletteId } from '../types';
import { HIGHLIGHT_PALETTES } from '../theme/palettes';

const DIFFICULTY_LABELS: Record<'zh' | 'en', Record<Difficulty, string>> = {
  zh: { easy: '简单', medium: '中等', hard: '困难', expert: '专家', master: '大师', extreme: '极限' },
  en: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', master: 'Master', extreme: 'Extreme' },
};

const PALETTE_NAMES: Record<'zh' | 'en', Record<PaletteId, string>> = {
  zh: { ocean: '海洋蓝', forest: '森林绿', sunset: '日落橙', lavender: '薰衣紫', rose: '樱花粉' },
  en: { ocean: 'Ocean Blue', forest: 'Forest Green', sunset: 'Sunset Orange', lavender: 'Lavender', rose: 'Sakura Pink' },
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const language = useGameStore(s => s.language);
  const toggleLanguage = useGameStore(s => s.toggleLanguage);
  const difficultyLabels = DIFFICULTY_LABELS[language];

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
          <Text style={styles.difficultyText}>{difficultyLabels[difficulty]} ▾</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => setSettingsOpen(true)}
        >
          <Text style={styles.headerActionText}>{language === 'zh' ? '设置' : 'Settings'}</Text>
        </TouchableOpacity>
        {status === 'paused' ? (
          <TouchableOpacity style={styles.resumeBtn} onPress={resumeGame}>
            <Text style={styles.resumeBtnText}>{language === 'zh' ? '继续' : 'Resume'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={pauseGame}
            disabled={status !== 'playing'}
          >
            <Text style={[styles.headerActionText, status !== 'playing' && styles.disabledText]}>
              {language === 'zh' ? '暂停' : 'Pause'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerActionBtn} onPress={newGame}>
          <Text style={styles.headerActionText}>{language === 'zh' ? '新局' : 'New'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerActionBtn} onPress={restartGame}>
          <Text style={styles.headerActionText}>{language === 'zh' ? '重玩' : 'Replay'}</Text>
        </TouchableOpacity>
        </View>
      </View>
      <Modal transparent visible={difficultyOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setDifficultyOpen(false)}>
          <Pressable style={styles.difficultyMenu}>
            <Text style={styles.menuTitle}>{language === 'zh' ? '选择难度' : 'Select difficulty'}</Text>
            {(Object.keys(difficultyLabels) as Difficulty[]).map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.difficultyOption, option === difficulty && styles.difficultyOptionActive]}
                onPress={() => handleDifficulty(option)}
              >
                <Text style={[styles.optionText, option === difficulty && styles.optionTextActive]}>
                  {difficultyLabels[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal transparent visible={settingsOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.difficultyMenu}>
            <Text style={styles.menuTitle}>{language === 'zh' ? '设置' : 'Settings'}</Text>
            <Text style={styles.settingLabel}>{language === 'zh' ? '语言' : 'Language'}</Text>
            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={[styles.languageChoice, language === 'en' && styles.languageChoiceActive]}
                onPress={() => language !== 'en' && toggleLanguage()}
              >
                <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageChoice, language === 'zh' && styles.languageChoiceActive]}
                onPress={() => language !== 'zh' && toggleLanguage()}
              >
                <Text style={[styles.optionText, language === 'zh' && styles.optionTextActive]}>中文</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.settingLabel}>{language === 'zh' ? '高亮配色' : 'Highlight palette'}</Text>
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
                  }]}>{PALETTE_NAMES[language][option]}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={() => Linking.openURL('https://cirnono.github.io/Sudoku/privacy.html')}
            >
              <Text style={styles.privacyLinkText}>
                {language === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </Text>
            </TouchableOpacity>
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
  const language = useGameStore(s => s.language);
  const zh = language === 'zh';

  const canUndo = history.length > 0 && status === 'playing';
  const canErase =
    selectedCell &&
    status === 'playing' &&
    !(initialBoard[selectedCell.row]?.[selectedCell.col] !== 0);

  return (
    <View style={styles.actionsContainer}>
      <View style={styles.actionRow}>
        <ActionButton
          label={zh ? '存档' : 'Save'}
          icon="⬇"
          onPress={async () => {
            const saved = await saveCheckpoint();
            Alert.alert(
              saved ? (zh ? '已存档' : 'Saved') : (zh ? '存档失败' : 'Save failed'),
              saved
                ? (zh ? '当前盘面已保存到测试存档。' : 'The current board was saved to the test checkpoint.')
                : (zh ? '当前没有可保存的游戏。' : 'There is no game to save.'),
            );
          }}
          disabled={status !== 'playing'}
        />
        <ActionButton
          label={zh ? '读档' : 'Load'}
          icon="⬆"
          onPress={async () => {
            const loaded = await loadCheckpoint();
            Alert.alert(
              loaded ? (zh ? '已读档' : 'Loaded') : (zh ? '没有存档' : 'No checkpoint'),
              loaded
                ? (zh ? '盘面已恢复到测试存档状态。' : 'The board was restored from the test checkpoint.')
                : (zh ? '请先保存一个测试存档。' : 'Save a test checkpoint first.'),
            );
          }}
        />
        <ActionButton
          label={zh ? '撤销' : 'Undo'}
          icon="↩"
          onPress={undo}
          disabled={!canUndo}
        />
        <ActionButton
          label={zh ? '擦除' : 'Erase'}
          icon="✕"
          onPress={eraseCell}
          disabled={!canErase}
        />
        <ActionButton
          label={zh ? (candidatesEnabled ? '候选开' : '候选') : (candidatesEnabled ? 'Cand. On' : 'Candidates')}
          icon="✚"
          onPress={toggleCandidates}
          disabled={status !== 'playing'}
          active={candidatesEnabled}
        />
        <ActionButton
          label={zh ? (noteMode ? '笔记' : '铅笔') : (noteMode ? 'Notes on' : 'Notes')}
          icon="✏"
          onPress={toggleNoteMode}
          disabled={status !== 'playing'}
          active={noteMode}
        />
        <ActionButton
          label={zh ? (quickMode ? '快速开' : '快速') : (quickMode ? 'Quick on' : 'Quick')}
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
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 8,
  },
  privacyLink: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  privacyLinkText: {
    color: '#1565c0',
    fontSize: 14,
    fontWeight: '600',
  },
  settingLabel: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
  },
  languageChoice: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageChoiceActive: {
    backgroundColor: '#e3f2fd',
  },
});
