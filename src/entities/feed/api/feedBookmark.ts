/**
 * 피드 북마크 API
 * 
 * 사용 예시:
 * import { feedBookmarkAPI } from '../entities/feed/api/feedBookmark';
 * 
 * // 북마크 추가
 * await feedBookmarkAPI.bookmarkFeed(123);
 * 
 * // 북마크 취소
 * await feedBookmarkAPI.unbookmarkFeed(123);
 * 
 * // 북마크 여부 확인
 * const isBookmarked = await feedBookmarkAPI.isBookmarked(123);
 * 
 * // 내가 북마크한 피드 목록
 * const bookmarkedFeeds = await feedBookmarkAPI.getBookmarkedFeeds({ limit: 10, offset: 0 });
 */

import { supabase } from '../../../shared/api/supabase';
import { requireCurrentUser, getCurrentUser } from '../../../shared/api/authUtils';

/**
 * NOTE
 * - Supabase(DB) 응답은 snake_case (Row/DTO)
 * - 앱 내부에서 사용할 모델은 camelCase (Model)
 * - feedBookmarkAPI가 그 경계(매핑) 역할을 한다.
 */

// ===== DB Row (snake_case) =====
export interface FeedBookmarkRow {
  feed_id: number;
  user_id: string;
  created_at: string;
}

// ===== App Model (camelCase) =====
export interface FeedBookmark {
  feedId: number;
  userId: string;
  createdAt: string;
}

export interface GetBookmarkedFeedsParams {
  limit?: number;
  offset?: number;
}

const mapFeedBookmark = (row: FeedBookmarkRow): FeedBookmark => ({
  feedId: row.feed_id,
  userId: row.user_id,
  createdAt: row.created_at,
});

export const feedBookmarkAPI = {
  /**
   * 피드 북마크 추가
   * @param feedId - 피드 ID
   * @returns FeedBookmark
   */
  bookmarkFeed: async (feedId: number): Promise<FeedBookmark> => {
    const user = await requireCurrentUser();
  
    const { data, error } = await supabase
      .from('feed_bookmarks')
      .insert({
        feed_id: feedId,
        user_id: user.id,
      })
      .select()
      .single();
  
    if (error) {
      // PK (feed_id, user_id) 중복
      if (error.code === '23505') {
        throw new Error('Already bookmarked this feed');
      }
      throw error;
    }
  
    return mapFeedBookmark(data as FeedBookmarkRow);
  },

  /**
   * 피드 북마크 취소
   * @param feedId - 피드 ID
   */
  unbookmarkFeed: async (feedId: number): Promise<void> => {
    const user = await requireCurrentUser();

    const { error } = await supabase
      .from('feed_bookmarks')
      .delete()
      .eq('feed_id', feedId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * 특정 피드에 북마크 했는지 확인
   * @param feedId - 피드 ID
   * @returns 북마크 여부
   */
  isBookmarked: async (feedId: number): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;
  
    const { data, error } = await supabase
      .from('feed_bookmarks')
      .select('feed_id')
      .eq('feed_id', feedId)
      .eq('user_id', user.id)
      .maybeSingle();
  
    if (error) throw error;
  
    return !!data;
  },
  

  /**
   * 여러 피드에 대한 북마크 여부 확인
   * @param feedIds - 피드 ID 배열
   * @returns feedId를 key로 하는 북마크 여부 Map
   */
  areBookmarked: async (
    feedIds: number[]
  ): Promise<Record<number, boolean>> => {
    const user = await getCurrentUser();
    if (!user) return {};

    if (feedIds.length === 0) return {};

    const { data, error } = await supabase
      .from('feed_bookmarks')
      .select('feed_id')
      .eq('user_id', user.id)
      .in('feed_id', feedIds);

    if (error) throw error;

    const result: Record<number, boolean> = {};
    feedIds.forEach((id) => {
      result[id] = false;
    });

    data?.forEach((bookmark) => {
      result[bookmark.feed_id] = true;
    });

    return result;
  },

  /**
   * 내가 북마크한 피드 목록 조회
   * @param params - limit, offset
   * @returns FeedBookmark 배열
   */
  getBookmarkedFeeds: async (
    params: GetBookmarkedFeedsParams = {}
  ): Promise<FeedBookmark[]> => {
    const user = await requireCurrentUser();

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('feed_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as FeedBookmarkRow[] | null | undefined)?.map(mapFeedBookmark) ?? [];
  },
};