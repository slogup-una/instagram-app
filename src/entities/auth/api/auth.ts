import { supabase } from '../../../shared/api/supabase';

export interface SignUpParams {
  email: string;
  password: string;
}



export interface SignInParams {

  email: string;

  password: string;

}

export interface UpdateProfileParams {
  nickname?: string | null;
  description?: string | null;
  profile_image_url?: string | null;
}

export interface UserProfile {
  user_id: string;
  nickname: string | null;
  description: string | null;
  profile_image_url: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  created_at: string;
}



export const authAPI = {

  // 회원가입

  signUp: async ({ email, password }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) throw error;
    if (!data.user) throw new Error('No user created');
  
    // nickname이 제공되지 않으면 랜덤 생성
    const nickname = generateRandomNickname();
    const profileImageUrl = generateRandomProfileImage();
  
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: data.user.id,
          nickname: nickname,
          profile_image_url: profileImageUrl,
        },
      ]);
  
    if (profileError) {
      // ⚠️ 사이드프로젝트에서는 여기까지 rollback 안 해도 됨
      // 진짜 서비스면 auth user 삭제 고려
      throw new Error(`프로필 생성 실패: ${profileError.message}`);
    }
  
    return data;
  },

  // 로그인
  signIn: async ({ email, password }: SignInParams) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // 현재 유저 가져오기
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // 현재 유저의 프로필 정보 가져오기
  getCurrentUserProfile: async (): Promise<UserProfile | null> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // 특정 유저 ID로 프로필 정보 가져오기
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

  // 현재 유저의 프로필 정보 수정
  /* 사용예시
  import { authAPI } from '../entities/auth';

  // 닉네임만 수정
  await authAPI.updateUserProfile({ 
    nickname: '새로운닉네임' 
  });

  // 여러 필드 동시 수정
  await authAPI.updateUserProfile({
    nickname: '새로운닉네임',
    description: '안녕하세요!',
    profile_image_url: 'https://example.com/image.jpg'
  });

  // null로 설정 (필드 초기화)
  await authAPI.updateUserProfile({
    description: null
  });
  */
  updateUserProfile: async (
    params: UpdateProfileParams
  ): Promise<UserProfile> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // 수정할 데이터만 필터링 (undefined 제외)
    const updateData: Partial<UpdateProfileParams> = {};
    if (params.nickname !== undefined) updateData.nickname = params.nickname;
    if (params.description !== undefined)
      updateData.description = params.description;
    if (params.profile_image_url !== undefined)
      updateData.profile_image_url = params.profile_image_url;

    // 수정할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Profile update failed');

    return data;
  },
};

const generateRandomNickname = () =>
  `user_${Math.random().toString(36).slice(2, 8)}`;

const generateRandomProfileImage = () =>
  `https://picsum.photos/50/50?random=${Date.now()}`;
