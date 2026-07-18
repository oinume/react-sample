import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { type PropsWithChildren, useEffect } from 'react';

import { useAppTheme } from '@/hooks/useAppTheme';
import { BookmarkProvider } from '@/providers/BookmarkProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

function NavigationTheme({ children }: PropsWithChildren) {
  const { scheme, colors } = useAppTheme();
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: colors.canvas,
          card: colors.paper,
          text: colors.ink,
          primary: colors.accent,
          border: colors.line,
        },
      }}
    >
      {children}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <BookmarkProvider>
        <NavigationTheme>
          <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="tags/[tag]"
              options={{ title: 'Tag bookmarks' }}
            />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="browser" options={{ headerShown: false }} />
            <Stack.Screen
              name="add-url"
              options={{
                presentation: 'formSheet',
                headerShown: false,
                sheetAllowedDetents: [0.48, 0.9],
                sheetInitialDetentIndex: 0,
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="add-bookmark"
              options={{
                presentation: 'formSheet',
                headerShown: false,
                sheetAllowedDetents: [0.72, 1],
                sheetInitialDetentIndex: 0,
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="+not-found"
              options={{ title: 'Not found' }}
            />
          </Stack>
        </NavigationTheme>
      </BookmarkProvider>
    </SettingsProvider>
  );
}
