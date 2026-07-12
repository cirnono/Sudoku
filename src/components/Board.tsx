/**
 * 数独棋盘组件
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Cell } from './Cell';

export const Board: React.FC = () => {
  const board = useGameStore(s => s.board);

  if (!board || board.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* 外边框 */}
      <View style={styles.boardBorder}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                value={cell}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  boardBorder: {
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
