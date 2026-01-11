import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function VideoScreen() {
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
      <Text style={{ color: theme.textPrimary }}>VideoScreen</Text>
    </View>
  );
}

export default VideoScreen;
