import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeToggle from '../widgets/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function ProfileScreen() {
  const { theme } = useTheme();
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    const loadVideoCount = async () => {
      try {
        const saved = await AsyncStorage.getItem('uploadedVideos');
        if (!saved) {
          setVideoCount(0);
          return;
        }
        const videos = JSON.parse(saved);
        setVideoCount(Array.isArray(videos) ? videos.length : 0);
      } catch (e) {
        console.log('Video load error:', e);
        setVideoCount(0);
      }
    };
    loadVideoCount();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}
    >
      <Text style={{ marginTop: 16, fontSize: 16, color: theme.textPrimary }}>
        현재 저장된 동영상 개수: {videoCount}
      </Text>
      <Text
        style={{ marginVertical: 16, fontSize: 14, color: theme.textSecondary }}
      >
        다양한 동영상을 추가하여 사람들과 공유하세요!
      </Text>
      <ThemeToggle />
    </View>
  );
}

export default ProfileScreen;
