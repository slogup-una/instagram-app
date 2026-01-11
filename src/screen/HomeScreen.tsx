import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFeedsQuery } from '../entities/feed/hook/useFeedsQuery';
import type { FeedDto } from '../entities/feed/model/feed-dto';
import { Loading } from '../widgets/Loading';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function FeedItem({ item }: { item: FeedDto }) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const IMAGE_WIDTH = screenWidth - 32;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageHeights, setImageHeights] = useState<number[]>([]);

  useEffect(() => {
    Promise.all(
      item.images.map(
        img =>
          new Promise<number>(resolve => {
            Image.getSize(
              img,
              (width, height) => {
                const ratio = Math.min(IMAGE_WIDTH / width, 1);
                const displayHeight = height * ratio;
                resolve(displayHeight);
              },
              () => resolve(240),
            );
          }),
      ),
    ).then(setImageHeights);
  }, [item.images, IMAGE_WIDTH]);

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / IMAGE_WIDTH);
    setCurrentIndex(index);
  };

  function formatNumber(num: number): string {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '억';
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만';
    }
    return num.toLocaleString();
  }

  return (
    <View style={[styles.feedItem, { backgroundColor: theme.background }]}>
      <View style={styles.userRow}>
        <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
        <Text style={[styles.username, { color: theme.textPrimary }]}>
          {item.user.username}
        </Text>
      </View>

      {item.images.length > 0 && (
        <View>
          <FlatList
            data={item.images}
            keyExtractor={(img, idx) => `${img}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            renderItem={({ item: img, index }) => (
              <Image
                source={{ uri: img }}
                style={[
                  styles.feedImage,
                  {
                    width: IMAGE_WIDTH,
                    height: imageHeights[index] || 240,
                    marginRight: 0,
                  },
                ]}
                resizeMode="contain"
              />
            )}
            style={{
              width: IMAGE_WIDTH,
              height: imageHeights[currentIndex] || 240,
            }}
            extraData={imageHeights[currentIndex]}
          />

          {item.images.length > 1 && (
            <>
              <View style={styles.imageIndicatorContainer}>
                <Text style={styles.imageIndicatorText}>
                  {currentIndex + 1} / {item.images.length}
                </Text>
              </View>

              <View style={styles.dotsContainer}>
                {item.images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          idx === currentIndex
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        {/* 왼쪽 아이콘 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <MaterialCommunityIcons
              name="heart-outline"
              size={24}
              color={theme.textPrimary}
            />
            <Text style={{ marginLeft: 6, color: theme.textPrimary }}>
              {formatNumber(item.likesCount)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <MaterialCommunityIcons
              name="comment-outline"
              size={24}
              color={theme.textPrimary}
            />
            <Text style={{ marginLeft: 6, color: theme.textPrimary }}>
              {formatNumber(item.comments.length)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="navigation-variant-outline"
              size={24}
              color={theme.textPrimary}
            />
            <Text style={{ marginLeft: 6, color: theme.textPrimary }}>
              {formatNumber(item.sharedCount)}
            </Text>
          </View>
        </View>
        {/* 오른쪽 아이콘 */}
        <MaterialCommunityIcons
          name="bookmark-outline"
          size={24}
          color={theme.textPrimary}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 6,
        }}
      >
        <Text style={[styles.username, { color: theme.textPrimary }]}>
          {item.user.username}
        </Text>
        <Text style={[styles.caption, { color: theme.textPrimary }]}>
          {item.caption}
        </Text>
      </View>

      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );
}

function HomeScreen() {
  const { theme } = useTheme();
  const { data, isLoading, error } = useFeedsQuery();

  if (isLoading) return <Loading />;
  if (error) return <Text>에러 발생!</Text>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={data.data ?? []}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <FeedItem item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedItem: {
    padding: 16,
    borderColor: '#eee',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  feedImage: {
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  imageIndicatorContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    borderRadius: 5,
    marginHorizontal: 3,
    width: 8,
    height: 8,
  },
});

export default HomeScreen;
