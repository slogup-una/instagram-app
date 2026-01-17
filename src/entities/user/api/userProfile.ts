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
import { UserProfile } from '../../auth/api/auth';

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
    return data;
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
    return data || [];
  },
};
