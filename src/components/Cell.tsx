/**
 * 单元格组件
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { isInitialCell, hasConflict } from '../logic/sudoku';
import type { CellValue } from '../types';
import { HIGHLIGHT_PALETTES } from '../theme/palettes';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_SIZE = SCREEN_WIDTH - 32;
const CELL_SIZE = BOARD_SIZE / 9;

interface CellProps {
  row: number;
  col: number;
  value: CellValue;
}

export const Cell: React.FC<CellProps> = React.memo(({ row, col, value }) => {
  const selectedCell = useGameStore(s => s.selectedCell);
  const board = useGameStore(s => s.board);
  const initialBoard = useGameStore(s => s.initialBoard);
  const notes = useGameStore(s => s.notes);
  const pressCell = useGameStore(s => s.pressCell);
  const quickMode = useGameStore(s => s.quickMode);
  const selectedNumber = useGameStore(s => s.selectedNumber);
  const paletteId = useGameStore(s => s.paletteId);
  const palette = HIGHLIGHT_PALETTES[paletteId];

  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  const isInitial = isInitialCell(initialBoard, row, col);
  const conflict = hasConflict(board, row, col);

  // 高亮相同数字
  const activeNumber = quickMode && selectedNumber !== null
    ? selectedNumber
    : selectedCell
      ? board[selectedCell.row][selectedCell.col]
      : 0;
  const isSameNumber = value !== 0 && activeNumber !== 0 && activeNumber === value;

  // 高亮同行/列/宫
  const isSameRow = selectedCell?.row === row;
  const isSameCol = selectedCell?.col === col;
  const isSameBox =
    selectedCell &&
    Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
    Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
  const selectedCellHasValue = selectedCell
    ? board[selectedCell.row][selectedCell.col] !== 0
    : false;

  // 格子边框：粗边框表示宫边界
  const borderRightWidth = (col + 1) % 3 === 0 && col !== 8 ? 2 : 0.5;
  const borderBottomWidth = (row + 1) % 3 === 0 && row !== 8 ? 2 : 0.5;

  const cellNotes = notes[`${row}-${col}`];

  const highlightedNumber = activeNumber;

  const handlePress = () => {
    pressCell({ row, col });
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          borderRightWidth,
          borderBottomWidth,
        },
        isSelected && { backgroundColor: palette.selected },
        selectedCellHasValue && !isSelected && isSameRow && { backgroundColor: palette.related },
        selectedCellHasValue && !isSelected && isSameCol && { backgroundColor: palette.related },
        selectedCellHasValue && !isSelected && isSameBox && { backgroundColor: palette.related },
        isSameNumber && { backgroundColor: palette.sameNumber },
        conflict && styles.conflict,
      ]}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      {value !== 0 ? (
        <Text
          style={[
            styles.cellText,
            isInitial && styles.initialText,
            !isInitial && styles.userText,
            conflict && styles.conflictText,
          ]}
        >
          {value}
        </Text>
      ) : cellNotes && cellNotes.size > 0 ? (
        <View style={styles.notesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <Text
              key={n}
              style={[
                styles.noteText,
                cellNotes.has(n) && highlightedNumber === n && [styles.highlightedNoteText, {
                  color: palette.primary,
                  backgroundColor: palette.selected,
                }],
              ]}
            >
              {cellNotes.has(n) ? n : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

Cell.displayName = 'Cell';

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#888',
    backgroundColor: '#fff',
  },
  selected: {
    backgroundColor: '#bbdefb',
  },
  highlightRow: {
    backgroundColor: '#f0f8ff',
  },
  highlightCol: {
    backgroundColor: '#f0f8ff',
  },
  highlightBox: {
    backgroundColor: '#f0f8ff',
  },
  sameNumber: {
    backgroundColor: '#c8e6ff',
  },
  conflict: {
    backgroundColor: '#ffcdd2',
  },
  cellText: {
    fontSize: CELL_SIZE * 0.66,
    fontWeight: '500',
    textAlign: 'center',
  },
  initialText: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  userText: {
    color: '#1565c0',
    fontWeight: '600',
  },
  conflictText: {
    color: '#c62828',
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 1,
  },
  noteText: {
    width: '33.33%',
    height: '33.33%',
    fontSize: CELL_SIZE * 0.23,
    color: '#888',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  highlightedNoteText: {
    color: '#1565c0',
    fontWeight: '800',
    backgroundColor: '#bbdefb',
  },
});
