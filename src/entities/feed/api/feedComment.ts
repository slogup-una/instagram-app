/**
 * 피드 댓글 API
 * 
 * 사용 예시:
 * import { feedCommentAPI } from '../entities/feed/api/feedComment';
 * 
 * // 댓글 작성
 * const comment = await feedCommentAPI.createComment({
 *   feedId: 123,
 *   content: '좋은 게시물이네요!'
 * });
 * 
 * // 대댓글 작성
 * const reply = await feedCommentAPI.createComment({
 *   feedId: 123,
 *   parentCommentId: 456,
 *   content: '동감합니다!'
 * });
 * 
 * // 댓글 수정
 * await feedCommentAPI.updateComment(789, '수정된 댓글 내용');
 * 
 * // 댓글 삭제
 * await feedCommentAPI.deleteComment(789);
 * 
 * // 피드의 댓글 목록 조회
 * const comments = await feedCommentAPI.getComments(123);
 * 
 * // 특정 댓글 조회
 * const comment = await feedCommentAPI.getComment(789);
 */

import { supabase } from '../../../shared/api/supabase';

export interface FeedComment {
  id: number;
  feed_id: number;
  user_id: string;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
}

export interface FeedCommentWithProfile extends FeedComment {
  user_profiles: {
    nickname: string | null;
    profile_image_url: string | null;
  };
  replies?: FeedCommentWithProfile[]; // 대댓글 목록
}

export interface CreateCommentParams {
  feedId: number;
  content: string;
  parentCommentId?: number | null; // 대댓글인 경우 부모 댓글 ID
}

export const feedCommentAPI = {
  /**
   * 댓글 작성
   * @param params - feedId, content, parentCommentId (선택)
   * @returns FeedComment
   */
  createComment: async (
    params: CreateCommentParams
  ): Promise<FeedComment> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('feed_comments')
      .insert([
        {
          feed_id: params.feedId,
          user_id: user.id,
          parent_comment_id: params.parentCommentId || null,
          content: params.content,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // ✅ Trigger가 자동으로 카운트 증가 처리

    return data;
  },

  /**
   * 댓글 수정 (본인만 가능)
   * @param commentId - 댓글 ID
   * @param content - 수정할 내용
   * @returns 수정된 FeedComment
   */
  updateComment: async (
    commentId: number,
    content: string
  ): Promise<FeedComment> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // 본인 댓글인지 확인
    const { data: existingComment, error: fetchError } = await supabase
      .from('feed_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    if (existingComment.user_id !== user.id) {
      throw new Error('Not authorized to update this comment');
    }

    const { data, error } = await supabase
      .from('feed_comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 댓글 삭제 (본인만 가능)
   * @param commentId - 댓글 ID
   */
  deleteComment: async (commentId: number): Promise<void> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // 본인 댓글인지 확인 및 feed_id 가져오기
    const { data: existingComment, error: fetchError } = await supabase
      .from('feed_comments')
      .select('user_id, feed_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    if (existingComment.user_id !== user.id) {
      throw new Error('Not authorized to delete this comment');
    }

    const { error } = await supabase
      .from('feed_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // ✅ Trigger가 자동으로 카운트 감소 처리 (CASCADE된 대댓글도 자동)

  },

  /**
   * 피드의 댓글 목록 조회 (대댓글 포함)
   * @param feedId - 피드 ID
   * @returns FeedCommentWithProfile 배열 (대댓글은 replies에 포함)
   */
  getComments: async (feedId: number): Promise<FeedCommentWithProfile[]> => {
    const { data, error } = await supabase
      .from('feed_comments')
      .select(
        `
        *,
        user_profiles (
          nickname,
          profile_image_url
        )
      `
      )
      .eq('feed_id', feedId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 댓글과 대댓글 분리
    const comments = (data || []) as FeedCommentWithProfile[];
    const topLevelComments = comments.filter(
      (comment) => comment.parent_comment_id === null
    );
    const replies = comments.filter(
      (comment) => comment.parent_comment_id !== null
    );

    // 대댓글을 부모 댓글의 replies에 추가
    topLevelComments.forEach((comment) => {
      comment.replies = replies.filter(
        (reply) => reply.parent_comment_id === comment.id
      );
    });

    return topLevelComments;
  },

  /**
   * 특정 댓글 조회
   * @param commentId - 댓글 ID
   * @returns FeedCommentWithProfile 또는 null
   */
  getComment: async (
    commentId: number
  ): Promise<FeedCommentWithProfile | null> => {
    const { data, error } = await supabase
      .from('feed_comments')
      .select(
        `
        *,
        user_profiles (
          nickname,
          profile_image_url
        )
      `
      )
      .eq('id', commentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
};
