/**
 * 팔로우 API
 * 
 * 사용 예시:
 * import { followAPI } from '../entities/follow/api/follow';
 * 
 * // 팔로우
 * await followAPI.follow('user-uuid-here');
 * 
 * // 언팔로우
 * await followAPI.unfollow('user-uuid-here');
 * 
 * // 팔로우 여부 확인
 * const isFollowing = await followAPI.isFollowing('user-uuid-here');
 * 
 * // 내 팔로워 목록
 * const followers = await followAPI.getFollowers({ limit: 10, offset: 0 });
 * 
 * // 내가 팔로우하는 사람 목록
 * const followings = await followAPI.getFollowings({ limit: 10, offset: 0 });
 * 
 * // 팔로워 수, 팔로잉 수 조회
 * const counts = await followAPI.getFollowCounts('user-uuid-here');
 */

import { supabase } from '../../../shared/api/supabase';
import { requireCurrentUser, getCurrentUser } from '../../../shared/api/authUtils';

/**
 * NOTE
 * - Supabase(DB) 응답은 snake_case (Row/DTO)
 * - 앱 내부에서 사용할 모델은 camelCase (Model)
 * - followAPI가 그 경계(매핑) 역할을 한다.
 */

// ===== DB Row (snake_case) =====
export interface FollowRow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowProfileRow {
  user_id: string;
  nickname: string | null;
  profile_image_url: string | null;
}

export interface FollowWithProfileRow extends FollowRow {
  follower_profile: {
    user_id: string;
    nickname: string | null;
    profile_image_url: string | null;
  };
  following_profile: {
    user_id: string;
    nickname: string | null;
    profile_image_url: string | null;
  };
}

// ===== App Model (camelCase) =====
export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowProfile {
  userId: string;
  nickname: string | null;
  profileImageUrl: string | null;
}

export interface FollowWithProfile extends Follow {
  followerProfile: FollowProfile;
  followingProfile: FollowProfile;
}

export interface GetFollowsParams {
  limit?: number;
  offset?: number;
}

export interface FollowCounts {
  followerCount: number;
  followingCount: number;
}

const mapFollow = (row: FollowRow): Follow => ({
  followerId: row.follower_id,
  followingId: row.following_id,
  createdAt: row.created_at,
});

const mapFollowProfile = (row: FollowProfileRow | null | undefined): FollowProfile => ({
  userId: row?.user_id ?? '',
  nickname: row?.nickname ?? null,
  profileImageUrl: row?.profile_image_url ?? null,
});

const mapFollowWithProfile = (row: FollowWithProfileRow): FollowWithProfile => ({
  ...mapFollow(row),
  followerProfile: mapFollowProfile(row.follower_profile as any),
  followingProfile: mapFollowProfile(row.following_profile as any),
});

export const followAPI = {
  /**
   * 유저 팔로우
   * @param userId - 팔로우할 유저 ID
   */
  follow: async (userId: string): Promise<void> => {
    const { error } = await supabase.rpc('follow_user', {
      target_user_id: userId,
    });

    if (error) {
      if (error.message.includes('Already following')) {
        throw new Error('Already following this user');
      }
      if (error.message.includes('Cannot follow yourself')) {
        throw new Error('Cannot follow yourself');
      }
      throw error;
    }
  },

  /**
   * 유저 언팔로우
   * @param userId - 언팔로우할 유저 ID
   */
  unfollow: async (userId: string): Promise<void> => {
    const { error } = await supabase.rpc('unfollow_user', {
      target_user_id: userId,
    });

    if (error) {
      if (error.message.includes('Not following')) {
        throw new Error('Not following this user');
      }
      throw error;
    }
  },

  /**
   * 특정 유저를 팔로우 하고 있는지 확인
   * @param userId - 확인할 유저 ID
   * @returns 팔로우 여부
   */
  isFollowing: async (userId: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // 데이터 없음
      throw error;
    }

    return !!data;
  },

  /**
   * 여러 유저에 대한 팔로우 여부 확인
   * @param userIds - 유저 ID 배열
   * @returns userId를 key로 하는 팔로우 여부 Map
   */
  areFollowing: async (
    userIds: string[]
  ): Promise<Record<string, boolean>> => {
    const user = await getCurrentUser();
    if (!user) return {};

    if (userIds.length === 0) return {};

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', userIds);

    if (error) throw error;

    const result: Record<string, boolean> = {};
    userIds.forEach((id) => {
      result[id] = false;
    });

    data?.forEach((follow) => {
      result[follow.following_id] = true;
    });

    return result;
  },

  /**
   * 내 팔로워 목록 조회
   * @param params - limit, offset
   * @returns FollowWithProfile 배열
   */
  getFollowers: async (
    params: GetFollowsParams = {}
  ): Promise<FollowWithProfile[]> => {
    const user = await requireCurrentUser();

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        *,
        follower_profile:user_profiles!follows_follower_profile_fkey (
          user_id,
          nickname,
          profile_image_url
        )
      `
      )
      .eq('following_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as FollowWithProfileRow[] | null | undefined)?.map(mapFollowWithProfile) ?? [];
  },

  /**
   * 내가 팔로우하는 사람 목록 조회
   * @param params - limit, offset
   * @returns FollowWithProfile 배열
   */
  getFollowings: async (
    params: GetFollowsParams = {}
  ): Promise<FollowWithProfile[]> => {
    const user = await requireCurrentUser();

    const { limit = 10, offset = 0 } = params;

    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        *,
        following_profile:user_profiles!follows_following_profile_fkey (
          user_id,
          nickname,
          profile_image_url
        )
      `
      )
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as FollowWithProfileRow[] | null | undefined)?.map(mapFollowWithProfile) ?? [];
  },

  /**
   * 특정 유저의 팔로워 수, 팔로잉 수 조회
   * @param userId - 유저 ID (없으면 현재 유저)
   * @returns FollowCounts
   */
  getFollowCounts: async (userId?: string): Promise<FollowCounts> => {
    let targetUserId = userId;

    if (!targetUserId) {
      const user = await requireCurrentUser();
      targetUserId = user.id;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('follower_count, following_count')
      .eq('user_id', targetUserId)
      .single();

    if (error) throw error;

    return {
      followerCount: profile.follower_count,
      followingCount: profile.following_count,
    };
  },
};
