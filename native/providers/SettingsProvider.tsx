import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

export type Appearance = 'system' | 'light' | 'dark';

type SettingsContextValue = {
  openLinksInApp: boolean;
  setOpenLinksInApp: (value: boolean) => void;
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [openLinksInApp, setOpenLinksInApp] = useState(true);
  const [appearance, setAppearance] = useState<Appearance>('system');

  const value = useMemo(
    () => ({
      openLinksInApp,
      setOpenLinksInApp,
      appearance,
      setAppearance,
    }),
    [openLinksInApp, appearance],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);

  if (context === null) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}
