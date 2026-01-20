/**
 * 다른 유저 프로필 조회 API
 * 
 * 사용 예시:
 * import { userProfileAPI } from '../entities/user/api/userProfile';
 * 
 * // 특정 유저의 프로필 조회
 * const profile = await userProfileAPI.getUserProfile('user-uuid-here');
 * 
 * // 여러 유저의 프로필 조회
 * const profiles = await userProfileAPI.getUserProfiles(['uuid1', 'uuid2']);
 */

import { supabase } from '../../../shared/api/supabase';

/**
 * NOTE
 * - Supabase(DB) 응답은 snake_case (Row/DTO)
 * - 앱 내부에서 사용할 모델은 camelCase (Model)
 * - userProfileAPI가 그 경계(매핑) 역할을 한다.
 */

// ===== DB Row (snake_case) =====
export interface UserProfileRow {
  user_id: string;
  nickname: string | null;
  description: string | null;
  profile_image_url: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  created_at: string;
}

// ===== App Model (camelCase) =====
export interface UserProfile {
  userId: string;
  nickname: string | null;
  description: string | null;
  profileImageUrl: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: string;
}

const mapUserProfile = (row: UserProfileRow): UserProfile => ({
  userId: row.user_id,
  nickname: row.nickname,
  description: row.description,
  profileImageUrl: row.profile_image_url,
  followerCount: row.follower_count,
  followingCount: row.following_count,
  postCount: row.post_count,
  createdAt: row.created_at,
});

export const userProfileAPI = {
  /**
   * 특정 유저 ID로 프로필 정보 가져오기
   * @param userId - 조회할 유저의 UUID
   * @returns UserProfile 또는 null (프로필이 없는 경우)
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // 데이터 없음
      throw error;
    }
    if (!data) return null;
    return mapUserProfile(data as UserProfileRow);
  },

  /**
   * 여러 유저의 프로필 정보 가져오기
   * @param userIds - 조회할 유저 UUID 배열
   * @returns UserProfile 배열
   */
  getUserProfiles: async (userIds: string[]): Promise<UserProfile[]> => {
    if (userIds.length === 0) return [];

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', userIds);

    if (error) throw error;
    return (data as UserProfileRow[] | null | undefined)?.map(mapUserProfile) ?? [];
  },
};
