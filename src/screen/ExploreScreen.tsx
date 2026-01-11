import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function ExploreScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}
    >
      <Text style={{ color: theme.textPrimary }}>ExploreScreen</Text>
    </View>
  );
}

export default ExploreScreen;
