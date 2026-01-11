import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const textColor = isDark ? '#fff' : '#222';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: textColor, marginRight: 8 }}>
        {isDark ? '다크 모드' : '화이트 모드'}
      </Text>
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
};

export default ThemeToggle;
