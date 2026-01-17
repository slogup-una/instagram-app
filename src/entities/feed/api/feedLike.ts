/**
 * 피드 좋아요 API
 * 
 * 사용 예시:
 * import { feedLikeAPI } from '../entities/feed/api/feedLike';
 * 
 * // 좋아요 추가
 * await feedLikeAPI.likeFeed(123);
 * 
 * // 좋아요 취소
 * await feedLikeAPI.unlikeFeed(123);
 * 
 * // 좋아요 여부 확인
 * const isLiked = await feedLikeAPI.isLiked(123);
 * 
 * // 내가 좋아요한 피드 목록
 * const likedFeeds = await feedLikeAPI.getLikedFeeds({ limit: 10, offset: 0 });
 */

import { supabase } from '../../../shared/api/supabase';

export interface FeedLike {
  feed_id: number;
  user_id: string;
  created_at: string;
}

export interface GetLikedFeedsParams {
  limit?: number;
  offset?: number;
}

export const feedLikeAPI = {
  /**
   * 피드에 좋아요 추가
   * @param feedId - 피드 ID
   * @returns FeedLike
   */
  likeFeed: async (feedId: number): Promise<FeedLike> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');
  
    const { data, error } = await supabase
      .from('feed_likes')
      .insert({
        feed_id: feedId,
        user_id: user.id,
      })
      .select()
      .single();
  
    if (error) {
      if (error.code === '23505') {
        throw new Error('Already liked this feed');
      }
      throw error;
    }
  
    // ✅ Trigger가 자동으로 카운트 증가 처리
    return data;
  },
  

  /**
   * 피드 좋아요 취소
   * @param feedId - 피드 ID
   */
  unlikeFeed: async (feedId: number): Promise<void> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');
  
    const { error } = await supabase
      .from('feed_likes')
      .delete()
      .eq('feed_id', feedId)
      .eq('user_id', user.id);
  
    if (error) throw error;
  
    // ✅ Trigger가 자동으로 카운트 감소 처리
  },  

  /**
   * 특정 피드에 좋아요 했는지 확인
   * @param feedId - 피드 ID
   * @returns 좋아요 여부
   */
  isLiked: async (feedId: number): Promise<boolean> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return false;
  
    const { data, error } = await supabase
      .from('feed_likes')
      .select('feed_id')
      .eq('feed_id', feedId)
      .eq('user_id', user.id)
      .maybeSingle();
  
    if (error) throw error;
  
    return !!data;
  },  

  /**
   * 여러 피드에 대한 좋아요 여부 확인
   * @param feedIds - 피드 ID 배열
   * @returns feedId를 key로 하는 좋아요 여부 Map
   */
  areLiked: async (feedIds: number[]): Promise<Record<number, boolean>> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return {};

    if (feedIds.length === 0) return {};

    const { data, error } = await supabase
      .from('feed_likes')
      .select('feed_id')
      .eq('user_id', user.id)
      .in('feed_id', feedIds);

    if (error) throw error;

    const result: Record<number, boolean> = {};
    feedIds.forEach((id) => {
      result[id] = false;
    });

    data?.forEach((like) => {
      result[like.feed_id] = true;
    });

    return result;
  },

  /**
   * 내가 좋아요한 피드 목록 조회
   * @param params - limit, offset
   * @returns FeedLike 배열
   */
  getLikedFeeds: async (
    params: GetLikedFeedsParams = {}
  ): Promise<FeedLike[]> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('feed_likes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },
};
