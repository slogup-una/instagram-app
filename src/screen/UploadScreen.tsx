import React from 'react';
import { Text, View, Alert, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

function UploadScreen() {
  const { theme } = useTheme();

  const pickVideo = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      quality: 1,
    });

    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    try {
      const stored = await AsyncStorage.getItem('uploadedVideos');
      let videoList = [];

      if (stored) {
        videoList = JSON.parse(stored);
      }

      videoList.push(asset);

      console.log('Updated video list:', videoList);

      await AsyncStorage.setItem('uploadedVideos', JSON.stringify(videoList));

      Alert.alert('성공', '동영상이 저장되었습니다.');
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}
    >
      <Text
        style={{ marginBottom: 20, fontSize: 18, color: theme.textPrimary }}
      >
        동영상 업로드
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.purple?.[400] || '#4A90E2',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
        onPress={pickVideo}
      >
        <Text style={{ color: '#fff' }}>갤러리에서 동영상 선택</Text>
      </TouchableOpacity>
    </View>
  );
}

export default UploadScreen;
