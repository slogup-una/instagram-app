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

export const getFeeds = async () => {
  return publicFetchAPI<any>('/feeds', {
    method: 'GET',
  });
};

export interface Feed {
  id: number;
  user_id: string;
  images: string[];
  caption: string;
  likes_count: number;
  comments_count: number;
  shared_count: number;
  created_at: string;
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

export interface FeedWithProfile extends Feed {
  user_profiles: {
    nickname: string | null;
    profile_image_url: string | null;
  };
}

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
    return data || [];
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
    return data;
  },

  /**
   * 피드 생성
   * @param params - images (필수), caption (선택)
   * @returns 생성된 Feed
   */
  createFeed: async (params: CreateFeedParams): Promise<Feed> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

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

    // user_profiles의 post_count 증가
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('post_count')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('user_profiles')
        .update({ post_count: profile.post_count + 1 })
        .eq('user_id', user.id);
    }

    return data;
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // 본인 피드인지 확인
    const { data: existingFeed, error: fetchError } = await supabase
      .from('feeds')
      .select('user_id')
      .eq('id', feedId)
      .single();

    if (fetchError) throw fetchError;
    if (existingFeed.user_id !== user.id) {
      throw new Error('Not authorized to update this feed');
    }

    const { data, error } = await supabase
      .from('feeds')
      .update(params)
      .eq('id', feedId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 피드 삭제 (본인만 가능)
   * @param feedId - 피드 ID
   */
  deleteFeed: async (feedId: number): Promise<void> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // 본인 피드인지 확인
    const { data: existingFeed, error: fetchError } = await supabase
      .from('feeds')
      .select('user_id')
      .eq('id', feedId)
      .single();

    if (fetchError) throw fetchError;
    if (existingFeed.user_id !== user.id) {
      throw new Error('Not authorized to delete this feed');
    }

    const { error } = await supabase.from('feeds').delete().eq('id', feedId);

    if (error) throw error;

    // user_profiles의 post_count 감소
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('post_count')
      .eq('user_id', user.id)
      .single();

    if (profile && profile.post_count > 0) {
      await supabase
        .from('user_profiles')
        .update({ post_count: profile.post_count - 1 })
        .eq('user_id', user.id);
    }
  },

  /**
   * 내 피드 목록 조회
   * @param params - limit, offset
   * @returns Feed 배열
   */
  getMyFeeds: async (params: GetFeedsParams = {}): Promise<Feed[]> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },
};
