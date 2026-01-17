import React, { useEffect, useState } from 'react';
import { Button, Text, View, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeToggle from '../widgets/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../shared/api/supabase';
import { authAPI, UserProfile } from '../entities/auth';

function ProfileScreen() {
  const { theme } = useTheme();
  const [videoCount, setVideoCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 프로필 정보 가져오기
        const userProfile = await authAPI.getCurrentUserProfile();
        setProfile(userProfile);

        // 동영상 개수 가져오기
        const saved = await AsyncStorage.getItem('uploadedVideos');
        if (!saved) {
          setVideoCount(0);
          return;
        }
        const videos = JSON.parse(saved);
        setVideoCount(Array.isArray(videos) ? videos.length : 0);
      } catch (e) {
        console.log('Data load error:', e);
        setVideoCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
        padding: 20,
      }}
    >
      {profile && (
        <>
          {profile.profile_image_url ? (
            <Image
              source={{ uri: profile.profile_image_url }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 16,
              }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: theme.textSecondary,
                marginBottom: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.background, fontSize: 24 }}>
                {profile.nickname?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 8,
              color: theme.textPrimary,
            }}
          >
            {profile.nickname || '익명 사용자'}
          </Text>
          {profile.description && (
            <Text
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {profile.description}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              marginBottom: 16,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                }}
              >
                {profile.post_count}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                게시물
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                }}
              >
                {profile.follower_count}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                팔로워
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                }}
              >
                {profile.following_count}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                팔로잉
              </Text>
            </View>
          </View>
        </>
      )}

      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: theme.textPrimary,
        }}
      >
        현재 저장된 동영상 개수: {videoCount}
      </Text>
      <Text
        style={{
          marginVertical: 16,
          fontSize: 14,
          color: theme.textSecondary,
        }}
      >
        다양한 동영상을 추가하여 사람들과 공유하세요!
      </Text>
      <ThemeToggle />
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

export default ProfileScreen;
