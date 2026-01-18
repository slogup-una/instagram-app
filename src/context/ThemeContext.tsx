// context/ThemeContext.tsx
import { createContext, useContext, useMemo, useState } from 'react';
import { colors, darkColors } from '../shared/style/colors';

type ThemeContextType = {
  isDark: boolean;
  theme: typeof colors | typeof darkColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: colors,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);

  const theme = useMemo(() => (isDark ? darkColors : colors), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
