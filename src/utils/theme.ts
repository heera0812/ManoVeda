import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  bgGradient: string;
  cardBg: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  pillActive: string;
  heroGradient: string;
  chartBarGradient: { from: string; to: string };
  urgentCardGradient: string;
  previewColor: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Clinical Default',
    label: 'Standard',
    bgGradient: 'bg-[#FAF8F5]',
    cardBg: 'clinical-card',
    accentBg: 'clinical-button',
    accentText: 'text-[#325343]',
    accentBorder: 'border-[#325343]/30',
    pillActive: 'bg-[#325343] text-white',
    heroGradient: 'bg-white text-[#282828] border border-[#EAEAEA]',
    chartBarGradient: { from: '#325343', to: '#47755F' },
    urgentCardGradient: 'bg-white text-[#282828] border border-[#325343]',
    previewColor: '#FAF8F5',
  },
  rose: {
    id: 'rose',
    name: 'Clinical Default',
    label: 'Standard',
    bgGradient: 'bg-[#FAF8F5]',
    cardBg: 'clinical-card',
    accentBg: 'clinical-button',
    accentText: 'text-[#325343]',
    accentBorder: 'border-[#325343]/30',
    pillActive: 'bg-[#325343] text-white',
    heroGradient: 'bg-white text-[#282828] border border-[#EAEAEA]',
    chartBarGradient: { from: '#325343', to: '#47755F' },
    urgentCardGradient: 'bg-white text-[#282828] border border-[#325343]',
    previewColor: '#FAF8F5',
  },
  amber: {
    id: 'amber',
    name: 'Clinical Default',
    label: 'Standard',
    bgGradient: 'bg-[#FAF8F5]',
    cardBg: 'clinical-card',
    accentBg: 'clinical-button',
    accentText: 'text-[#325343]',
    accentBorder: 'border-[#325343]/30',
    pillActive: 'bg-[#325343] text-white',
    heroGradient: 'bg-white text-[#282828] border border-[#EAEAEA]',
    chartBarGradient: { from: '#325343', to: '#47755F' },
    urgentCardGradient: 'bg-white text-[#282828] border border-[#325343]',
    previewColor: '#FAF8F5',
  },
};
