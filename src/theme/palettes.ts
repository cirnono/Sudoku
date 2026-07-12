import type { PaletteId } from '../types';

export interface HighlightPalette {
  name: string;
  primary: string;
  selected: string;
  related: string;
  sameNumber: string;
  activeControl: string;
  activeText: string;
}

export const HIGHLIGHT_PALETTES: Record<PaletteId, HighlightPalette> = {
  ocean: {
    name: '海洋蓝', primary: '#1565c0', selected: '#bbdefb', related: '#f0f8ff',
    sameNumber: '#90caf9', activeControl: '#e3f2fd', activeText: '#0d47a1',
  },
  forest: {
    name: '森林绿', primary: '#2e7d32', selected: '#c8e6c9', related: '#f1f8e9',
    sameNumber: '#a5d6a7', activeControl: '#e8f5e9', activeText: '#1b5e20',
  },
  sunset: {
    name: '日落橙', primary: '#e65100', selected: '#ffe0b2', related: '#fff8e1',
    sameNumber: '#ffcc80', activeControl: '#fff3e0', activeText: '#bf360c',
  },
  lavender: {
    name: '薰衣紫', primary: '#6a1b9a', selected: '#e1bee7', related: '#f8f1fa',
    sameNumber: '#ce93d8', activeControl: '#f3e5f5', activeText: '#4a148c',
  },
  rose: {
    name: '樱花粉', primary: '#d81b60', selected: '#f8bbd0', related: '#fff4f7',
    sameNumber: '#f48fb1', activeControl: '#fce4ec', activeText: '#880e4f',
  },
};
