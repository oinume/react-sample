export const Theme = {
  light: {
    canvas: '#F5F0E6',
    paper: '#FFFCF7',
    ink: '#29263A',
    accent: '#6750C8',
    muted: '#756F82',
    line: '#DDD4C7',
    danger: '#B34054',
  },
  dark: {
    canvas: '#181620',
    paper: '#24212E',
    ink: '#F3EEF8',
    accent: '#A995FF',
    muted: '#AAA2B6',
    line: '#3C3747',
    danger: '#FF8CA0',
  },
} as const;

export type AppTheme = (typeof Theme)[keyof typeof Theme];
