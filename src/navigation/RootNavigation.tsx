import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../shared/api/supabase';
import TabNavigation from './TabNavigation';
import { SignInScreen } from '../screen/SignInScreen';
import { SignUpScreen } from '../screen/SignUpScreen';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const navigation = useNavigation();
  const { isDark, theme } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={TabNavigation} />
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              headerShown: true,
              title: '',
              headerTintColor: theme.textPrimary,
              headerBackButtonDisplayMode: 'minimal',
              headerStyle: {
                backgroundColor: theme.background,
              },
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  {isDark ? (
                    <Image
                      source={require('../shared/asset/ic-arrow-left-white.png')}
                      style={{ width: 24, height: 24 }}
                    />
                  ) : (
                    <Image
                      source={require('../shared/asset/ic-arrow-left.png')}
                      style={{ width: 24, height: 24 }}
                    />
                  )}
                </TouchableOpacity>
              ),
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;
