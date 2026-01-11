import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const supabase = createClient(
  Config.SUPABASE_URL as string,
  Config.SUPABASE_PUBLISHABLE_DEFAULT_KEY as string,
);

const REDIRECT_URL = Config.KAKAO_REDIRECT_URI as string;

function KakaoLoginScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangeNavigate, setIsNavigateChange] = useState(false);

  const requestToken = async (code: string) => {
    const res = await axios('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      params: {
        grant_type: 'authorization_code',
        client_id: Config.KAKAO_REST_API_KEY,
        redirect_uri: REDIRECT_URL,
        code,
        client_secret: Config.KAKAO_CLIENT_SECRET,
      },
    });

    const { id_token } = res.data;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'kakao',
      token: id_token,
    });

    if (data.user) {
      //   setAuthUser(data.user);
      Toast.show({
        type: 'success',
        text1: '카카오 로그인 성공',
        text2: '환영합니다!',
        position: 'bottom',
      });
    }

    if (!data.user?.id) return;

    const { data: user } = await supabase
      .from('user')
      .select('*')
      .eq('id', data?.user?.id)
      .single();

    if (user) {
      // setIsRegistered(true);
    } else {
      // 화면 이동
    }

    if (error) {
      console.log('Kakao login failed:', error);
      Toast.show({
        type: 'error',
        text1: '카카오 로그인 실패',
        text2: '나중에 다시 시도해주세요.',
        position: 'bottom',
      });
    }
  };

  const handleNavigationStateChange = async (event: any) => {
    const isMatched = event.url.includes(`${REDIRECT_URL}?code=`);
    setIsLoading(isMatched);
    setIsNavigateChange(event.loading);
    if (event.url.includes(`${REDIRECT_URL}?code=`)) {
      const code = event.url.replace(`${REDIRECT_URL}?code=`, '');
      requestToken(code);
    }
  };

  return <SafeAreaView style={styles.container}></SafeAreaView>;
}
