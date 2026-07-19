import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSettings } from '@/providers/SettingsProvider';

export function useAppTheme() {
  const systemScheme = useColorScheme() ?? 'light';
  const { appearance } = useSettings();
  const scheme = appearance === 'system' ? systemScheme : appearance;

  return { scheme, colors: Theme[scheme] };
}
