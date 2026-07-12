/**
 * 数字键盘组件
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';
import type { CellValue } from '../types';
import { HIGHLIGHT_PALETTES } from '../theme/palettes';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BUTTON_SIZE = (SCREEN_WIDTH - 64) / 9;

export const NumberPad: React.FC = () => {
  const board = useGameStore(s => s.board);
  const selectNumber = useGameStore(s => s.selectNumber);
  const quickMode = useGameStore(s => s.quickMode);
  const selectedNumber = useGameStore(s => s.selectedNumber);
  const paletteId = useGameStore(s => s.paletteId);
  const palette = HIGHLIGHT_PALETTES[paletteId];

  // 统计棋盘上每个数字已使用的数量
  const usedCounts: Record<number, number> = {};
  if (board.length > 0) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = board[r][c];
        if (v !== 0) usedCounts[v] = (usedCounts[v] || 0) + 1;
      }
    }
  }

  const handlePress = (num: CellValue) => {
    selectNumber(num);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map(num => {
          const count = usedCounts[num] || 0;
          const isFull = count >= 9;

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.button,
                isFull && styles.buttonFull,
                quickMode && selectedNumber === num && [styles.buttonSelected, {
                  backgroundColor: palette.primary,
                  borderColor: palette.primary,
                }],
              ]}
              onPress={() => handlePress(num)}
              activeOpacity={0.5}
            >
              <Text style={[
                styles.buttonText,
                isFull && styles.buttonTextFull,
                quickMode && selectedNumber === num && styles.buttonTextSelected,
              ]}>
                {num}
              </Text>
              <Text style={styles.countText}>
                {isFull ? '' : `${9 - count}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: SCREEN_WIDTH - 32,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonFull: {
    backgroundColor: '#eee',
    borderColor: '#e0e0e0',
  },
  buttonSelected: {
    backgroundColor: '#1565c0',
    borderColor: '#1565c0',
  },
  buttonText: {
    fontSize: 34,
    lineHeight: 40,
    position: 'absolute',
    top: 3,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  buttonTextFull: {
    color: '#bbb',
  },
  buttonTextSelected: {
    color: '#fff',
  },
  countText: {
    fontSize: 12,
    color: '#999',
    position: 'absolute',
    bottom: 5,
    lineHeight: 14,
  },
});
