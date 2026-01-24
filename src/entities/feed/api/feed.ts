/**
 * 피드(게시물) CRUD API
 * 
 * 사용 예시:
 * import { feedAPI } from '../entities/feed/api/feed';
 * 
 * // 피드 목록 조회 (무한 스크롤)
 * const feeds = await feedAPI.getFeeds({ limit: 10, offset: 0 });
 * 
 * // 특정 피드 조회
 * const feed = await feedAPI.getFeed(123);
 * 
 * // 피드 생성
 * const newFeed = await feedAPI.createFeed({
 *   images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
 *   caption: '오늘의 일상'
 * });
 * 
 * // 피드 수정
 * await feedAPI.updateFeed(123, { caption: '수정된 내용' });
 * 
 * // 피드 삭제
 * await feedAPI.deleteFeed(123);
 * 
 * // 내 피드 목록 조회
 * const myFeeds = await feedAPI.getMyFeeds({ limit: 10, offset: 0 });
 */

import { supabase } from '../../../shared/api/supabase';
import { publicFetchAPI } from '../../../shared/api/fetchAPI';
import { feedLikeAPI } from './feedLike';
import { feedBookmarkAPI } from './feedBookmark';
import { requireCurrentUser } from '../../../shared/api/authUtils';

// 기존코드
export const getFeeds = async () => {
  return publicFetchAPI<any>('/feeds', {
    method: 'GET',
  });
};

/**
 * NOTE
 * - Supabase(DB) 응답은 snake_case (Row/DTO)
 * - 앱 내부에서 사용할 모델은 camelCase (Model)
 * - feedAPI가 그 경계(매핑) 역할을 한다.
 */

// ===== DB Row (snake_case) =====
export interface FeedRow {
  id: number;
  user_id: string;
  images: string[];
  caption: string;
  likes_count: number;
  comments_count: number;
  shared_count: number;
  created_at: string;
}

export interface UserProfileRow {
  nickname: string | null;
  profile_image_url: string | null;
}

export interface FeedWithProfileRow extends FeedRow {
  user_profiles: UserProfileRow;
}

// ===== App Model (camelCase) =====
export interface Feed {
  id: number;
  userId: string;
  images: string[];
  caption: string;
  likesCount: number;
  commentsCount: number;
  sharedCount: number;
  createdAt: string;
  /** 현재 로그인한 사용자가 좋아요 했는지 여부 (선택 필드) */
  isLiked?: boolean;
  /** 현재 로그인한 사용자가 북마크 했는지 여부 (선택 필드) */
  isBookmarked?: boolean;
}

export interface UserProfile {
  nickname: string | null;
  profileImageUrl: string | null;
}

export interface FeedWithProfile extends Feed {
  userProfiles: UserProfile;
}

export interface CreateFeedParams {
  images: string[];
  caption?: string;
}

export interface UpdateFeedParams {
  caption?: string;
}

export interface GetFeedsParams {
  limit?: number;
  offset?: number;
}

const mapUserProfile = (row: UserProfileRow | null | undefined): UserProfile => ({
  nickname: row?.nickname ?? null,
  profileImageUrl: row?.profile_image_url ?? null,
});

const mapFeed = (row: FeedRow): Feed => ({
  id: row.id,
  userId: row.user_id,
  images: row.images,
  caption: row.caption,
  likesCount: row.likes_count,
  commentsCount: row.comments_count,
  sharedCount: row.shared_count,
  createdAt: row.created_at,
});

const mapFeedWithProfile = (row: FeedWithProfileRow): FeedWithProfile => ({
  ...mapFeed(row),
  userProfiles: mapUserProfile(row.user_profiles),
});

export const feedAPI = {
  /**
   * 피드 목록 조회 (무한 스크롤용)
   * user_profiles와 JOIN하여 작성자 정보 포함
   * @param params - limit, offset
   * @returns FeedWithProfile 배열
   */
  getFeeds: async (params: GetFeedsParams = {}): Promise<FeedWithProfile[]> => {
    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('feeds')
      .select(
        `
        *,
        user_profiles(
          nickname,
          profile_image_url
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as FeedWithProfileRow[] | null | undefined)?.map(mapFeedWithProfile) ?? [];
  },

  /**
   * 피드 목록 + 현재 사용자 기준 좋아요/북마크 여부까지 함께 조회
   * @param params - limit, offset
   * @returns FeedWithProfile 배열 (isLiked, isBookmarked 포함)
   */
  getFeedsWithStatus: async (
    params: GetFeedsParams = {}
  ): Promise<FeedWithProfile[]> => {
    // 1) 기본 피드 목록 조회
    const baseFeeds = await feedAPI.getFeeds(params);
    if (baseFeeds.length === 0) return baseFeeds;

    // 2) 피드 ID 목록 추출
    const feedIds = baseFeeds.map((feed) => feed.id);

    // 3) 좋아요/북마크 여부를 병렬로 조회
    const [likedMap, bookmarkedMap] = await Promise.all([
      feedLikeAPI.areLiked(feedIds),
      feedBookmarkAPI.areBookmarked(feedIds),
    ]);

    // 4) map 결과를 모델에 합쳐서 반환
    return baseFeeds.map((feed) => ({
      ...feed,
      isLiked: !!likedMap[feed.id],
      isBookmarked: !!bookmarkedMap[feed.id],
    }));
  },

  /**
   * 특정 피드 조회
   * @param feedId - 피드 ID
   * @returns FeedWithProfile 또는 null
   */
  getFeed: async (feedId: number): Promise<FeedWithProfile | null> => {
    const { data, error } = await supabase
      .from('feeds')
      .select(
        `
        *,
        user_profiles(
          nickname,
          profile_image_url
        )
      `
      )
      .eq('id', feedId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    if (!data) return null;
    return mapFeedWithProfile(data as FeedWithProfileRow);
  },

  /**
   * 단일 피드 + 현재 사용자 기준 좋아요/북마크 여부까지 함께 조회
   * @param feedId - 피드 ID
   * @returns FeedWithProfile 또는 null (isLiked, isBookmarked 포함)
   */
  getFeedWithStatus: async (feedId: number): Promise<FeedWithProfile | null> => {
    const baseFeed = await feedAPI.getFeed(feedId);
    if (!baseFeed) return null;

    const [isLiked, isBookmarked] = await Promise.all([
      feedLikeAPI.isLiked(feedId),
      feedBookmarkAPI.isBookmarked(feedId),
    ]);

    return {
      ...baseFeed,
      isLiked,
      isBookmarked,
    };
  },

  /**
   * 피드 생성
   * @param params - images (필수), caption (선택)
   * @returns 생성된 Feed
   */
  createFeed: async (params: CreateFeedParams): Promise<Feed> => {
    const user = await requireCurrentUser();

    const { data, error } = await supabase
      .from('feeds')
      .insert([
        {
          user_id: user.id,
          images: params.images,
          caption: params.caption || '',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // ✅ Trigger가 자동으로 post_count 증가 처리

    return mapFeed(data as FeedRow);
  },

  /**
   * 피드 수정 (본인만 가능)
   * @param feedId - 피드 ID
   * @param params - 수정할 내용
   * @returns 수정된 Feed
   */
  updateFeed: async (
    feedId: number,
    params: UpdateFeedParams
  ): Promise<Feed> => {
    const user = await requireCurrentUser();

    // 본인 피드인지 확인
    const { data: existingFeed, error: fetchError } = await supabase
      .from('feeds')
      .select('user_id')
      .eq('id', feedId)
      .single();

    if (fetchError) throw fetchError;
    if ((existingFeed as { user_id: string }).user_id !== user.id) {
      throw new Error('Not authorized to update this feed');
    }

    const { data, error } = await supabase
      .from('feeds')
      .update(params)
      .eq('id', feedId)
      .select()
      .single();

    if (error) throw error;
    return mapFeed(data as FeedRow);
  },

  /**
   * 피드 삭제 (본인만 가능)
   * @param feedId - 피드 ID
   */
  deleteFeed: async (feedId: number): Promise<void> => {
    const user = await requireCurrentUser();

    // 본인 피드인지 확인
    const { data: existingFeed, error: fetchError } = await supabase
      .from('feeds')
      .select('user_id')
      .eq('id', feedId)
      .single();

    if (fetchError) throw fetchError;
    if ((existingFeed as { user_id: string }).user_id !== user.id) {
      throw new Error('Not authorized to delete this feed');
    }

    const { error } = await supabase.from('feeds').delete().eq('id', feedId);

    if (error) throw error;

    // ✅ Trigger가 자동으로 post_count 감소 처리 (CASCADE된 댓글/좋아요도 자동)

  },

  /**
   * 내 피드 목록 조회
   * @param params - limit, offset
   * @returns Feed 배열
   */
  getMyFeeds: async (params: GetFeedsParams = {}): Promise<Feed[]> => {
    const user = await requireCurrentUser();

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as FeedRow[] | null | undefined)?.map(mapFeed) ?? [];
  },
};
