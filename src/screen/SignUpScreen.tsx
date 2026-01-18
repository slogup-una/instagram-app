import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authAPI } from '../entities/auth';
import { useTheme } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const SignUpScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await authAPI.signUp({ email, password });
      // 회원가입 성공 시 자동으로 로그인되므로 인증 상태 변경에 따라 자동으로 메인 화면으로 이동
      Alert.alert('성공', '회원가입이 완료되었습니다.');
    } catch (error: any) {
      Alert.alert('회원가입 실패', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ ...styles.container, backgroundColor: theme.background }}>
      <View>
        <Text style={{ ...styles.title, color: theme.textPrimary }}>
          이메일 주소 입력
        </Text>
        <Text style={{ ...styles.description, color: theme.textSecondary }}>
          회원님에게 연락할 수 있는 이메일 주소를 입력하세요. 이 이메일 주소는
          프로필에서 다른 사람에게 공개되지 않습니다.
        </Text>
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
            style={{
              ...styles.input,
              color: theme.textPrimary,
              borderColor: theme.placeholder,
            }}
            placeholder="비밀번호 (최소 6자)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
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
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>회원가입</Text>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.linkText}>이미 계정이 있습니다</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
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
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 26,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 20,
  },
});
