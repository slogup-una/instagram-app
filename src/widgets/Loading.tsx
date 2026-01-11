import { Image, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Loading = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.background,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Image
        source={require('../shared/asset/loading.gif')}
        style={{ width: 60, height: 60, marginBottom: 12 }}
      />
    </View>
  );
};

export { Loading };
