import React from 'react';
import { Image, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { colors, darkColors } from '../shared/style/colors';

import HomeScreen from '../screen/HomeScreen';
import ProfileScreen from '../screen/ProfileScreen';
import UploadScreen from '../screen/UploadScreen';
import ExploreScreen from '../screen/ExploreScreen';
import VideoScreen from '../screen/VideoScreen';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const { isDark } = useTheme();

  const headerBackground = isDark ? darkColors.surface : colors.background;
  const headerTextColor = isDark ? darkColors.textPrimary : colors.textPrimary;
  const tabBarBackground = isDark ? darkColors.background : colors.background;
  const tabBarActiveTintColor = isDark
    ? darkColors.textPrimary
    : colors.textPrimary;
  const tabBarInactiveTintColor = isDark
    ? darkColors.textSecondary
    : colors.textSecondary;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBackground },
        headerTitle: () => null,
        headerLeft: () => (
          <Text
            style={{ marginLeft: 16, fontSize: 18, color: headerTextColor }}
          >
            Instagram
          </Text>
        ),
        headerRight: () => (
          <>
            <MaterialCommunityIcons
              name="heart-outline"
              color={headerTextColor}
              size={24}
              onPress={() => {}}
              style={{ marginRight: 16 }}
            />
            <MaterialCommunityIcons
              name="send-outline"
              color={headerTextColor}
              size={24}
              onPress={() => {}}
              style={{ marginRight: 16 }}
            />
          </>
        ),
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: tabBarBackground },
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '커스텀 타이틀',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: '탐색',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          title: '업로드',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-box-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Video"
        component={VideoScreen}
        options={{
          title: '숏츠',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="play-box-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={{
                uri: 'https://velog.velcdn.com/images/hyphen_/profile/5e542197-d2fb-48b4-a493-0bf156c3e3ce/image.png',
              }}
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 2,
                borderColor: color,
              }}
              resizeMode="cover"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
