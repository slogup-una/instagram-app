/**
 * Supabase 인증 관련 공통 유틸리티
 * 
 * 사용 예시:
 * import { getCurrentUser, requireCurrentUser } from '../../../shared/api/authUtils';
 * 
 * // 인증이 선택적인 경우 (user가 없으면 null 반환)
 * const user = await getCurrentUser();
 * if (!user) return;
 * 
 * // 인증이 필수인 경우 (user가 없으면 에러 throw)
 * const user = await requireCurrentUser();
 */

import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * 현재 로그인한 사용자 가져오기 (선택적)
 * @returns User 또는 null (인증되지 않은 경우)
 * @throws 인증 에러가 발생한 경우
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * 현재 로그인한 사용자 가져오기 (필수)
 * @returns User (인증되지 않은 경우 에러 throw)
 * @throws 인증되지 않은 경우 또는 인증 에러가 발생한 경우
 */
export const requireCurrentUser = async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
};
