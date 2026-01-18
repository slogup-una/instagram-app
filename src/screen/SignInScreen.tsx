import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { authAPI } from '../entities/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../shared/style/colors';
import MetaLogo from '../shared/asset/meta.svg';

export const SignInScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const data = await authAPI.signIn({ email, password });

      // 로그인 성공 - 메인 화면으로 이동
      Alert.alert('성공', '로그인되었습니다.');
      // navigation.navigate('Home'); // 메인 화면으로 이동
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.background,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../shared/asset/logo-outline.png')}
          style={{ width: 60, height: 60 }}
        />
      </View>

      <View style={{ flex: 1.5 }}>
        <TextInput
          style={{
            ...styles.input,
            color: theme.textPrimary,
            borderColor: theme.placeholder,
          }}
          placeholder="이메일 주소"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={theme.placeholder}
        />
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{
              ...styles.input,
              color: theme.textPrimary,
              paddingRight: 45,
              borderColor: theme.placeholder,
            }}
            placeholderTextColor={theme.placeholder}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 16,
              top: 14,
              zIndex: 1,
            }}
          >
            <Text style={{ fontSize: 18 }}>
              {showPassword ? (
                <MaterialCommunityIcons
                  name="eye-off-outline"
                  color={styles.input.borderColor}
                  size={24}
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <MaterialCommunityIcons
                  name="eye-outline"
                  color={styles.input.borderColor}
                  size={24}
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ marginBottom: 16 }}
                />
              )}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
        // TODO: 비밀 번호 찾기 화면 구현
        // onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={{ ...styles.linkText, color: theme.textPrimary }}>
            비밀번호를 잊으셨나요?
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          style={{ ...styles.outlineButton, borderColor: theme.primary100 }}
          onPress={handleGoToSignUp}
        >
          <Text style={{ color: theme.primary100 }}>새 계정 만들기</Text>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <MetaLogo width={20} height={20} />
          <Text
            style={{
              marginLeft: 4,
              color: theme.gray,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Meta
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 26,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 15,
    alignItems: 'center',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
