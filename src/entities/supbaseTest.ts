import { feedAPI } from './feed/api/feed';
import { feedBookmarkAPI } from './feed/api/feedBookmark';
import { feedLikeAPI } from './feed/api/feedLike';
import {feedShareAPI } from './feed/api/feedShare';
import {feedCommentAPI} from './feed/api/feedComment';
import {followAPI} from './follow/api/follow';
import {userProfileAPI} from './user/api/userProfile';

/**
 * 테스트 헬퍼 함수들
 */
const testHelpers = {
  /**
   * 테스트 단계 시작
   */
  step: (stepNumber: number, description: string) => {
    console.log(`\n🔹 [${stepNumber}] ${description}`);
  },

  /**
   * 테스트 성공 로그
   */
  success: (message: string, data?: any) => {
    console.log(`✅ [성공] ${message}`, data || '');
  },

  /**
   * 테스트 실패 로그
   */
  fail: (message: string, error?: any) => {
    console.error(`❌ [실패] ${message}`, error || '');
  },

  /**
   * 테스트 예상값 검증
   */
  expect: <T>(actual: T, expected: T, message: string): boolean => {
    const isMatch = JSON.stringify(actual) === JSON.stringify(expected);
    if (isMatch) {
      testHelpers.success(`${message} (예상: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`);
      return true;
    } else {
      testHelpers.fail(`${message} (예상: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`);
      return false;
    }
  },

  /**
   * 테스트 예상값 검증 (불리언)
   */
  expectBoolean: (actual: boolean, expected: boolean, message: string): boolean => {
    if (actual === expected) {
      testHelpers.success(`${message} (예상: ${expected}, 실제: ${actual})`);
      return true;
    } else {
      testHelpers.fail(`${message} (예상: ${expected}, 실제: ${actual})`);
      return false;
    }
  },

  /**
   * 테스트 예상값 검증 (null이 아님)
   */
  expectNotNull: <T>(actual: T | null, message: string): boolean => {
    if (actual !== null && actual !== undefined) {
      testHelpers.success(`${message} (값 존재함)`);
      return true;
    } else {
      testHelpers.fail(`${message} (값이 null 또는 undefined)`);
      return false;
    }
  },

  /**
   * 테스트 예상값 검증 (배열 길이)
   */
  expectLength: <T>(actual: T[], expectedLength: number, message: string): boolean => {
    if (actual.length === expectedLength) {
      testHelpers.success(`${message} (예상 길이: ${expectedLength}, 실제 길이: ${actual.length})`);
      return true;
    } else {
      testHelpers.fail(`${message} (예상 길이: ${expectedLength}, 실제 길이: ${actual.length})`);
      return false;
    }
  },

  /**
   * 테스트 섹션 시작
   */
  section: (title: string) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ${title}`);
    console.log('='.repeat(60));
  },

  /**
   * 테스트 섹션 종료
   */
  sectionEnd: (title: string, passed: number, failed: number) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 ${title} 결과`);
    console.log(`✅ 성공: ${passed}개`);
    console.log(`❌ 실패: ${failed}개`);
    console.log(`📈 성공률: ${passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0}%`);
    console.log('='.repeat(60));
  },
};

export const testFeedAPI = async () => {
    testHelpers.section('FeedAPI 테스트');
    let passed = 0;
    let failed = 0;

    try {
      testHelpers.step(1, '피드 생성');
      const created = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: 'test feed',
      });
      if (testHelpers.expectNotNull(created, '피드 생성')) {
        passed++;
      } else {
        failed++;
      }
      const feedId = created.id;
  
      testHelpers.step(2, '피드 조회');
      const feed = await feedAPI.getFeed(feedId);
      if (testHelpers.expect(feed?.id, feedId, '피드 ID 일치')) {
        passed++;
      } else {
        failed++;
      }

      testHelpers.step(2.1, '피드 상태 조회 (좋아요/북마크 전)');
      const feedWithStatusBefore = await feedAPI.getFeedWithStatus(feedId);
      if (testHelpers.expectBoolean(feedWithStatusBefore?.isLiked || false, false, '좋아요 상태 (false)') &&
          testHelpers.expectBoolean(feedWithStatusBefore?.isBookmarked || false, false, '북마크 상태 (false)')) {
        passed += 2;
      } else {
        failed += 2;
      }
  
      testHelpers.step(3, '피드 목록 조회');
      const feeds = await feedAPI.getFeeds({ limit: 5 });
      if (testHelpers.expectLength(feeds, 5, '피드 목록 길이')) {
        passed++;
      } else {
        failed++;
      }

      testHelpers.step(3.1, '피드 목록 상태 조회 (좋아요/북마크 전)');
      const feedsWithStatusBefore = await feedAPI.getFeedsWithStatus({ limit: 5 });
      testHelpers.success('피드 목록 상태 조회 완료', feedsWithStatusBefore.slice(0, 3).map((f) => ({
        id: f.id,
        isLiked: f.isLiked,
        isBookmarked: f.isBookmarked,
      })));

      testHelpers.step(3.2, '좋아요 및 북마크 추가');
      await feedLikeAPI.likeFeed(feedId);
      await feedBookmarkAPI.bookmarkFeed(feedId);
      testHelpers.success('좋아요 및 북마크 추가 완료');

      testHelpers.step(3.3, '피드 상태 조회 (좋아요/북마크 후)');
      const feedWithStatusAfter = await feedAPI.getFeedWithStatus(feedId);
      if (testHelpers.expectBoolean(feedWithStatusAfter?.isLiked || false, true, '좋아요 상태 (true)') &&
          testHelpers.expectBoolean(feedWithStatusAfter?.isBookmarked || false, true, '북마크 상태 (true)')) {
        passed += 2;
      } else {
        failed += 2;
      }

      testHelpers.step(3.4, '피드 목록 상태 조회 (좋아요/북마크 후)');
      const feedsWithStatusAfter = await feedAPI.getFeedsWithStatus({ limit: 5 });
      const target = feedsWithStatusAfter.find((f) => f.id === feedId);
      if (testHelpers.expectBoolean(target?.isLiked || false, true, '목록에서 좋아요 상태 (true)') &&
          testHelpers.expectBoolean(target?.isBookmarked || false, true, '목록에서 북마크 상태 (true)')) {
        passed += 2;
      } else {
        failed += 2;
      }
  
      testHelpers.step(4, '피드 수정');
      const updated = await feedAPI.updateFeed(feedId, {
        caption: 'updated caption',
      });
      if (testHelpers.expect(updated.caption, 'updated caption', '피드 캡션 수정')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(5, '피드 삭제');
      await feedAPI.deleteFeed(feedId);
      testHelpers.success('피드 삭제 완료');
      passed++;
    } catch (e) {
      testHelpers.fail('FeedAPI 테스트 중 에러 발생', e);
      failed++;
    } finally {
      testHelpers.sectionEnd('FeedAPI 테스트', passed, failed);
    }
  };
  
  export const testFeedBookmarkAPI = async () => {
    testHelpers.section('FeedBookmarkAPI 테스트');
    let passed = 0;
    let failed = 0;

    try {
      testHelpers.step(1, '테스트용 피드 생성');
      const feed = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: 'bookmark test feed',
      });
      if (testHelpers.expectNotNull(feed, '피드 생성')) {
        passed++;
      } else {
        failed++;
      }
      const feedId = feed.id;
  
      testHelpers.step(2, '북마크 여부 확인 (북마크 전)');
      const before = await feedBookmarkAPI.isBookmarked(feedId);
      if (testHelpers.expectBoolean(before, false, '북마크 여부 (false)')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(3, '북마크 추가');
      const bookmark = await feedBookmarkAPI.bookmarkFeed(feedId);
      if (testHelpers.expect(bookmark.feedId, feedId, '북마크 추가')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(4, '북마크 여부 확인 (북마크 후)');
      const after = await feedBookmarkAPI.isBookmarked(feedId);
      if (testHelpers.expectBoolean(after, true, '북마크 여부 (true)')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(5, '여러 피드 북마크 여부 확인');
      const map = await feedBookmarkAPI.areBookmarked([feedId, 999999]);
      if (testHelpers.expectBoolean(map[feedId] || false, true, '북마크된 피드 확인') &&
          testHelpers.expectBoolean(map[999999] || false, false, '북마크 안 된 피드 확인')) {
        passed += 2;
      } else {
        failed += 2;
      }
  
      testHelpers.step(6, '북마크한 피드 목록 조회');
      const list = await feedBookmarkAPI.getBookmarkedFeeds({ limit: 10 });
      const hasFeedId = list.some((b) => b.feedId === feedId);
      if (testHelpers.expectBoolean(hasFeedId, true, '북마크 목록에 피드 포함')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(7, '북마크 취소');
      await feedBookmarkAPI.unbookmarkFeed(feedId);
      testHelpers.success('북마크 취소 완료');
      passed++;
  
      testHelpers.step(8, '북마크 여부 확인 (취소 후)');
      const afterDelete = await feedBookmarkAPI.isBookmarked(feedId);
      if (testHelpers.expectBoolean(afterDelete, false, '북마크 여부 (false)')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(9, '테스트 피드 정리');
      await feedAPI.deleteFeed(feedId);
      testHelpers.success('피드 정리 완료');
      passed++;
    } catch (e) {
      testHelpers.fail('FeedBookmarkAPI 테스트 중 에러 발생', e);
      failed++;
    } finally {
      testHelpers.sectionEnd('FeedBookmarkAPI 테스트', passed, failed);
    }
  };

  export const testFeedLikeAPI = async () => {
    testHelpers.section('FeedLikeAPI 테스트');
    let passed = 0;
    let failed = 0;

    try {
      testHelpers.step(1, '테스트용 피드 생성');
      const feed = await feedAPI.createFeed({
        images: ['https://test.com/like-test.jpg'],
        caption: 'like test feed',
      });
      if (testHelpers.expectNotNull(feed, '피드 생성')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(2, '좋아요 추가');
      await feedLikeAPI.likeFeed(feed.id);
      testHelpers.success('좋아요 추가 완료');
      passed++;
  
      testHelpers.step(3, '좋아요 여부 확인 (추가 후)');
      const isLikedAfterLike = await feedLikeAPI.isLiked(feed.id);
      if (testHelpers.expectBoolean(isLikedAfterLike, true, '좋아요 여부 (true)')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(4, '좋아요 취소');
      await feedLikeAPI.unlikeFeed(feed.id);
      testHelpers.success('좋아요 취소 완료');
      passed++;
  
      testHelpers.step(5, '좋아요 여부 확인 (취소 후)');
      const isLikedAfterUnlike = await feedLikeAPI.isLiked(feed.id);
      if (testHelpers.expectBoolean(isLikedAfterUnlike, false, '좋아요 여부 (false)')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(6, '좋아요 다시 추가');
      await feedLikeAPI.likeFeed(feed.id);
      testHelpers.success('좋아요 다시 추가 완료');
      passed++;
  
      testHelpers.step(7, '내가 좋아요한 피드 목록 조회');
      const likedFeeds = await feedLikeAPI.getLikedFeeds({ limit: 10 });
      const hasFeedId = likedFeeds.some((l) => l.feedId === feed.id);
      if (testHelpers.expectBoolean(hasFeedId, true, '좋아요 목록에 피드 포함')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(8, '테스트 피드 정리');
      await feedAPI.deleteFeed(feed.id);
      testHelpers.success('피드 정리 완료');
      passed++;
    } catch (e) {
      testHelpers.fail('FeedLikeAPI 테스트 중 에러 발생', e);
      failed++;
    } finally {
      testHelpers.sectionEnd('FeedLikeAPI 테스트', passed, failed);
    }
  };

  export const testFeedShareAPI = async () => {
    testHelpers.section('FeedShareAPI 테스트');
    let passed = 0;
    let failed = 0;

    try {
      testHelpers.step(1, '테스트용 피드 생성');
      const createdFeed = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: '테스트용 피드',
      });
      if (testHelpers.expectNotNull(createdFeed, '피드 생성')) {
        passed++;
      } else {
        failed++;
      }
      const feedId = createdFeed.id;
  
      testHelpers.step(2, '공유 추가');
      const shared = await feedShareAPI.shareFeed(feedId);
      if (testHelpers.expect(shared.feedId, feedId, '공유 추가')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(3, '내가 공유한 피드 목록 조회');
      const sharedFeeds = await feedShareAPI.getSharedFeeds({ limit: 10 });
      const hasFeedId = sharedFeeds.some((s) => s.feedId === feedId);
      if (testHelpers.expectBoolean(hasFeedId, true, '공유 목록에 피드 포함')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(4, '여러 번 공유 테스트 (중복 허용)');
      const sharedAgain = await feedShareAPI.shareFeed(feedId);
      if (testHelpers.expectNotNull(sharedAgain, '중복 공유 허용')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(5, '공유 카운트 확인');
      const feedsAfterShare = await feedAPI.getFeed(feedId);
      if (testHelpers.expectNotNull(feedsAfterShare?.sharedCount, 'sharedCount 존재')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(6, '테스트 피드 정리');
      await feedAPI.deleteFeed(feedId);
      testHelpers.success('피드 정리 완료');
      passed++;
    } catch (err) {
      testHelpers.fail('FeedShareAPI 테스트 중 에러 발생', err);
      failed++;
    } finally {
      testHelpers.sectionEnd('FeedShareAPI 테스트', passed, failed);
    }
  };

  export const testFeedCommentAPI = async () => {
    testHelpers.section('FeedCommentAPI 테스트');
    let passed = 0;
    let failed = 0;

    try {
      testHelpers.step(1, '테스트용 피드 생성');
      const createdFeed = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: '테스트용 피드 댓글',
      });
      if (testHelpers.expectNotNull(createdFeed, '피드 생성')) {
        passed++;
      } else {
        failed++;
      }
      const feedId = createdFeed.id;
  
      testHelpers.step(2, '댓글 작성');
      const comment = await feedCommentAPI.createComment({
        feedId,
        content: '첫 댓글입니다!',
      });
      if (testHelpers.expect(comment.content, '첫 댓글입니다!', '댓글 작성')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(3, '대댓글 작성');
      const reply = await feedCommentAPI.createComment({
        feedId,
        parentCommentId: comment.id,
        content: '대댓글입니다!',
      });
      if (testHelpers.expect(reply.parentCommentId, comment.id, '대댓글 작성')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(4, '댓글 수정');
      const updatedComment = await feedCommentAPI.updateComment(
        comment.id,
        '수정된 댓글입니다.'
      );
      if (testHelpers.expect(updatedComment.content, '수정된 댓글입니다.', '댓글 수정')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(5, '댓글 목록 조회');
      const comments = await feedCommentAPI.getComments(feedId);
      const hasComment = comments.some((c) => c.id === comment.id);
      if (testHelpers.expectBoolean(hasComment, true, '댓글 목록에 포함')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(6, '특정 댓글 조회');
      const singleComment = await feedCommentAPI.getComment(comment.id);
      if (testHelpers.expect(singleComment?.id, comment.id, '특정 댓글 조회')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(7, '댓글 삭제');
      await feedCommentAPI.deleteComment(comment.id);
      testHelpers.success('댓글 삭제 완료');
      passed++;
  
      testHelpers.step(8, '댓글 목록 조회 (삭제 후)');
      const commentsAfterDelete = await feedCommentAPI.getComments(feedId);
      const hasDeletedComment = commentsAfterDelete.some((c) => c.id === comment.id);
      if (testHelpers.expectBoolean(hasDeletedComment, false, '삭제된 댓글 미포함')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(9, '테스트 피드 정리');
      await feedAPI.deleteFeed(feedId);
      testHelpers.success('피드 정리 완료');
      passed++;
    } catch (err) {
      testHelpers.fail('FeedCommentAPI 테스트 중 에러 발생', err);
      failed++;
    } finally {
      testHelpers.sectionEnd('FeedCommentAPI 테스트', passed, failed);
    }
  };

  export const testFollowAPI = async () => {
    const targetUserId = 'f81ca95d-4cac-48cd-9d3b-9e5848c7198b';
    testHelpers.section('FollowAPI 테스트');
    let passed = 0;
    let failed = 0;
  
    try {
      testHelpers.step(1, '팔로우 시도');
      try {
        await followAPI.follow(targetUserId);
        testHelpers.success(`팔로우 성공: ${targetUserId}`);
        passed++;
      } catch (err: any) {
        testHelpers.fail(`팔로우 실패: ${err.message}`, err);
        failed++;
      }
  
      testHelpers.step(2, '팔로우 여부 확인');
      const isFollowing = await followAPI.isFollowing(targetUserId);
      if (testHelpers.expectBoolean(isFollowing, true, '팔로우 여부 (true)')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(3, '여러 유저 팔로우 여부 확인');
      const areFollowing = await followAPI.areFollowing([targetUserId]);
      if (testHelpers.expectBoolean(areFollowing[targetUserId] || false, true, '팔로우 여부 확인')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(4, '팔로워 목록 조회');
      const followers = await followAPI.getFollowers({ limit: 5 });
      if (testHelpers.expectNotNull(followers, '팔로워 목록 조회')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(5, '팔로잉 목록 조회');
      const followings = await followAPI.getFollowings({ limit: 5 });
      if (testHelpers.expectNotNull(followings, '팔로잉 목록 조회')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(6, '팔로워/팔로잉 수 조회');
      const counts = await followAPI.getFollowCounts(targetUserId);
      if (testHelpers.expectNotNull(counts.followerCount, '팔로워 수') &&
          testHelpers.expectNotNull(counts.followingCount, '팔로잉 수')) {
        passed += 2;
      } else {
        failed += 2;
      }
  
      testHelpers.step(7, '언팔로우 시도');
      try {
        await followAPI.unfollow(targetUserId);
        testHelpers.success(`언팔로우 성공: ${targetUserId}`);
        passed++;
      } catch (err: any) {
        testHelpers.fail(`언팔로우 실패: ${err.message}`, err);
        failed++;
      }
  
      testHelpers.step(8, '언팔로우 후 팔로우 여부 확인');
      const isFollowingAfterUnfollow = await followAPI.isFollowing(targetUserId);
      if (testHelpers.expectBoolean(isFollowingAfterUnfollow, false, '팔로우 여부 (false)')) {
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      testHelpers.fail('FollowAPI 테스트 중 에러 발생', err);
      failed++;
    } finally {
      testHelpers.sectionEnd('FollowAPI 테스트', passed, failed);
    }
  };
  
  export const testUserProfileAPI = async () => {
    const targetUserId = 'f81ca95d-4cac-48cd-9d3b-9e5848c7198b';
    testHelpers.section('UserProfileAPI 테스트');
    let passed = 0;
    let failed = 0;
  
    try {
      testHelpers.step(1, '단일 유저 프로필 조회');
      const profile = await userProfileAPI.getUserProfile(targetUserId);
      if (testHelpers.expect(profile?.userId, targetUserId, '프로필 조회')) {
        passed++;
      } else {
        failed++;
      }
  
      testHelpers.step(2, '여러 유저 프로필 조회');
      const profiles = await userProfileAPI.getUserProfiles([targetUserId]);
      const hasTargetUser = profiles.some((p) => p.userId === targetUserId);
      if (testHelpers.expectBoolean(hasTargetUser, true, '프로필 목록에 포함')) {
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      testHelpers.fail('UserProfileAPI 테스트 중 에러 발생', err);
      failed++;
    } finally {
      testHelpers.sectionEnd('UserProfileAPI 테스트', passed, failed);
    }
  };
  
  // 마지막에 호출
  // testUserProfileAPI();
  