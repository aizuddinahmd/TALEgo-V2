'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View } from 'react-native';

type ThemeMode = 'classic' | 'neo';
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    toggleTheme: (mode: ThemeMode) => void;
    colorMode: ColorMode;
    toggleColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Structural Mode: 'classic' | 'neo'
    const [themeMode, setThemeMode] = useState<ThemeMode>('classic');
    // Color Mode: 'light' | 'dark'
    const [colorMode, setColorMode] = useState<ColorMode>('dark');

    // Load from local storage on mount - safeguard for React Native
    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('theme_mode') as ThemeMode | null;
            if (savedTheme) setThemeMode(savedTheme);

            const savedColor = localStorage.getItem('color_mode') as ColorMode | null;
            if (savedColor) setColorMode(savedColor);
        }
    }, []);

    const toggleTheme = (mode: ThemeMode) => {
        setThemeMode(mode);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('theme_mode', mode);
        }
    };

    const toggleColorMode = (mode: ColorMode) => {
        setColorMode(mode);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('color_mode', mode);
        }
    };

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme, colorMode, toggleColorMode }}>
            <View className={`${themeMode === 'neo' ? 'theme-neo' : 'theme-classic'} ${colorMode === 'light' ? 'light-mode' : 'dark-mode dark'} flex-1 w-full transition-colors duration-300`}>
                {children}
            </View>
        </ThemeContext.Provider>
    );
};
