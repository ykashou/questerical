import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nordDark, nordLight } from '@/constants/colors';

export type ThemeType = 'dark' | 'light';

interface ThemeState {
  theme: ThemeType;
  colors: typeof nordDark;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      colors: nordDark,
      
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
        colors: state.theme === 'dark' ? nordLight : nordDark,
      })),
      
      setTheme: (theme: ThemeType) => set({
        theme,
        colors: theme === 'dark' ? nordDark : nordLight,
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;