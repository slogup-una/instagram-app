/**
 * 피드 공유 API
 * 
 * 사용 예시:
 * import { feedShareAPI } from '../entities/feed/api/feedShare';
 * 
 * // 공유 추가
 * await feedShareAPI.shareFeed(123);
 * 
 * // 내가 공유한 피드 목록
 * const sharedFeeds = await feedShareAPI.getSharedFeeds({ limit: 10, offset: 0 });
 */

import { supabase } from '../../../shared/api/supabase';

export interface FeedShare {
  id: number;
  feed_id: number;
  user_id: string;
  created_at: string;
}

export interface GetSharedFeedsParams {
  limit?: number;
  offset?: number;
}

export const feedShareAPI = {
  /**
   * 피드 공유 추가
   * @param feedId - 피드 ID
   * @returns FeedShare
   */
  shareFeed: async (feedId: number): Promise<FeedShare> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');
  
    // insert만 수행 → 중복 허용
    const { data, error } = await supabase
      .from('feed_shares')
      .insert([{ feed_id: feedId, user_id: user.id }])
      .select()
      .single(); // 한 행만 반환
  
    if (error) throw error;
  
    // ✅ Trigger가 자동으로 카운트 증가 처리

    return data;
  },

  /**
   * 내가 공유한 피드 목록 조회
   * @param params - limit, offset
   * @returns FeedShare 배열
   */
  getSharedFeeds: async (
    params: GetSharedFeedsParams = {}
  ): Promise<FeedShare[]> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('feed_shares')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },
};
