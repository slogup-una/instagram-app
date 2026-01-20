import { feedAPI } from './feed/api/feed';
import { feedBookmarkAPI } from './feed/api/feedBookmark';
import { feedLikeAPI } from './feed/api/feedLike';
import {feedShareAPI } from './feed/api/feedShare';
import {feedCommentAPI} from './feed/api/feedComment';
import {followAPI} from './follow/api/follow';
import {userProfileAPI} from './user/api/userProfile';

export const testFeedAPI = async () => {
    console.log('--- testFeedAPI start ---');
    try {
      console.log('--- [1] createFeed ---');
      const created = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: 'test feed',
      });
      console.log('created', created);
  
      const feedId = created.id;
  
      console.log('--- [2] getFeed ---');
      const feed = await feedAPI.getFeed(feedId);
      console.log('getFeed', feed);

      console.log('--- [2-1] getFeedWithStatus (before like/bookmark) ---');
      const feedWithStatusBefore = await feedAPI.getFeedWithStatus(feedId);
      console.log(
        '[getFeedWithStatus before]',
        {
          id: feedWithStatusBefore?.id,
          isLiked: feedWithStatusBefore?.isLiked,
          isBookmarked: feedWithStatusBefore?.isBookmarked,
        }
      );
  
      console.log('--- [3] getFeeds ---');
      const feeds = await feedAPI.getFeeds({ limit: 5 });
      console.log('getFeeds', feeds);

      console.log('--- [3-1] getFeedsWithStatus (before like/bookmark) ---');
      const feedsWithStatusBefore = await feedAPI.getFeedsWithStatus({ limit: 5 });
      console.log(
        '[getFeedsWithStatus before] sample',
        feedsWithStatusBefore.slice(0, 3).map((f) => ({
          id: f.id,
          isLiked: f.isLiked,
          isBookmarked: f.isBookmarked,
        }))
      );

      console.log('--- [3-2] like + bookmark this feed ---');
      await feedLikeAPI.likeFeed(feedId);
      await feedBookmarkAPI.bookmarkFeed(feedId);
      console.log('like/bookmark done');

      console.log('--- [3-3] getFeedWithStatus (after like/bookmark) ---');
      const feedWithStatusAfter = await feedAPI.getFeedWithStatus(feedId);
      console.log(
        '[getFeedWithStatus after]',
        {
          id: feedWithStatusAfter?.id,
          isLiked: feedWithStatusAfter?.isLiked,
          isBookmarked: feedWithStatusAfter?.isBookmarked,
        }
      );

      console.log('--- [3-4] getFeedsWithStatus (after like/bookmark) ---');
      const feedsWithStatusAfter = await feedAPI.getFeedsWithStatus({ limit: 5 });
      const target = feedsWithStatusAfter.find((f) => f.id === feedId);
      console.log(
        '[getFeedsWithStatus after] target',
        {
          id: target?.id,
          isLiked: target?.isLiked,
          isBookmarked: target?.isBookmarked,
        }
      );
  
      console.log('--- [4] updateFeed ---');
      const updated = await feedAPI.updateFeed(feedId, {
        caption: 'updated caption',
      });
      console.log('updated', updated);
  
      console.log('--- [5] deleteFeed ---');
      await feedAPI.deleteFeed(feedId);
      console.log('delete success');
    } catch (e) {
      console.error('❌ feedAPI test error', e);
    }
  };
  
  export const testFeedBookmarkAPI = async () => {
    console.log('--- testFeedBookmarkAPI start ---');
    try {
      console.log('--- [1] createFeed ---');
      const feed = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: 'bookmark test feed',
      });
      console.log('created feed', { id: feed.id, caption: feed.caption });
  
      const feedId = feed.id;
  
      console.log('--- [2] isBookmarked (before) ---');
      const before = await feedBookmarkAPI.isBookmarked(feedId);
      console.log('isBookmarked before (expect false):', before);
  
      console.log('--- [3] bookmarkFeed ---');
      const bookmark = await feedBookmarkAPI.bookmarkFeed(feedId);
      console.log('bookmarked', {
        feedId: bookmark.feedId,
        userId: bookmark.userId,
        createdAt: bookmark.createdAt,
      });
  
      console.log('--- [4] isBookmarked (after) ---');
      const after = await feedBookmarkAPI.isBookmarked(feedId);
      console.log('isBookmarked after (expect true):', after);
  
      console.log('--- [5] areBookmarked ---');
      const map = await feedBookmarkAPI.areBookmarked([feedId, 999999]);
      console.log('areBookmarked map (expect true/false):', map);
  
      console.log('--- [6] getBookmarkedFeeds ---');
      const list = await feedBookmarkAPI.getBookmarkedFeeds({ limit: 10 });
      console.log(
        'bookmarked feeds (ids):',
        list.map((b) => b.feedId)
      );
  
      console.log('--- [7] unbookmarkFeed ---');
      await feedBookmarkAPI.unbookmarkFeed(feedId);
      console.log('unbookmark success');
  
      console.log('--- [8] isBookmarked (after delete) ---');
      const afterDelete = await feedBookmarkAPI.isBookmarked(feedId);
      console.log('isBookmarked after delete (expect false):', afterDelete);
  
      console.log('--- [9] cleanup feed ---');
      await feedAPI.deleteFeed(feedId);
      console.log('feed cleanup success');
    } catch (e) {
      console.error('❌ feedBookmarkAPI test error', e);
    }
  };

  export const testFeedLikeAPI = async () => {
    console.log('=== FeedLike API Test Start ===');
  
    // 1. 피드 생성
    const feed = await feedAPI.createFeed({
      images: ['https://test.com/like-test.jpg'],
      caption: 'like test feed',
    });
    console.log('Created feed:', { id: feed.id, caption: feed.caption });
  
    // 2. 좋아요 추가
    await feedLikeAPI.likeFeed(feed.id);
    console.log('Like added');
  
    // 3. 좋아요 여부 확인
    const isLikedAfterLike = await feedLikeAPI.isLiked(feed.id);
    console.log('Is liked after like (expect true):', isLikedAfterLike);
  
    // 4. 좋아요 취소
    await feedLikeAPI.unlikeFeed(feed.id);
    console.log('Like removed');
  
    // 5. 다시 좋아요 여부 확인
    const isLikedAfterUnlike = await feedLikeAPI.isLiked(feed.id);
    console.log('Is liked after unlike (expect false):', isLikedAfterUnlike);
  
    // 6. 다시 좋아요 추가
    await feedLikeAPI.likeFeed(feed.id);
    console.log('Like added again');
  
    // 7. 내가 좋아요한 피드 목록 조회
    const likedFeeds = await feedLikeAPI.getLikedFeeds({ limit: 10 });
    console.log(
      'My liked feeds (ids):',
      likedFeeds.map((l) => l.feedId)
    );
  
    await feedAPI.deleteFeed(feed.id);
    console.log('feed cleanup success');
    console.log('=== FeedLike API Test End ===');
  };

  export const testFeedShareAPI = async () => {
    try {
      console.log('--- FeedShareAPI 테스트 시작 ---');
  
      // 1️⃣ 테스트용 피드 생성
      const createdFeed = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: '테스트용 피드',
      });
      console.log('생성된 피드:', { id: createdFeed.id, caption: createdFeed.caption });
  
      const feedId = createdFeed.id;
  
      // 2️⃣ 공유 추가
      const shared = await feedShareAPI.shareFeed(feedId);
      console.log('공유 완료:', {
        id: shared.id,
        feedId: shared.feedId,
        userId: shared.userId,
      });
  
      // 3️⃣ 내가 공유한 피드 목록 조회
      const sharedFeeds = await feedShareAPI.getSharedFeeds({ limit: 10 });
      console.log(
        '내 공유 피드 목록 (ids):',
        sharedFeeds.map((s) => s.feedId)
      );
  
      // 4️⃣ 여러 번 공유 테스트 (중복 허용)
      const sharedAgain = await feedShareAPI.shareFeed(feedId);
      console.log('다시 공유:', sharedAgain);
  
      // 5️⃣ 공유 목록 조회 후 shared_count 확인
      const feedsAfterShare = await feedAPI.getFeed(feedId);
      console.log('피드 sharedCount 확인:', feedsAfterShare?.sharedCount);
  
      await feedAPI.deleteFeed(feedId);
      console.log('feed cleanup success');

      console.log('--- FeedShareAPI 테스트 종료 ---');
    } catch (err) {
      console.error('테스트 에러:', err);
    }
  };

  export const testFeedCommentAPI = async () => {
    try {
      console.log('================ FeedCommentAPI 테스트 시작 ================');
  
      // 1️⃣ 테스트용 피드 생성
      console.log('🔹 1️⃣ 테스트용 피드 생성 중...');
      const createdFeed = await feedAPI.createFeed({
        images: ['https://test.com/test.jpg'],
        caption: '테스트용 피드 댓글',
      });
      console.log('✅ 생성된 피드:', { id: createdFeed.id, caption: createdFeed.caption });
      const feedId = createdFeed.id;
  
      // 2️⃣ 댓글 작성
      console.log('🔹 2️⃣ 댓글 작성 중...');
      const comment = await feedCommentAPI.createComment({
        feedId,
        content: '첫 댓글입니다!',
      });
      console.log('✅ 작성된 댓글:', {
        id: comment.id,
        feedId: comment.feedId,
        content: comment.content,
      });
  
      // 3️⃣ 대댓글 작성
      console.log('🔹 3️⃣ 대댓글 작성 중...');
      const reply = await feedCommentAPI.createComment({
        feedId,
        parentCommentId: comment.id,
        content: '대댓글입니다!',
      });
      console.log('✅ 작성된 대댓글:', {
        id: reply.id,
        parentCommentId: reply.parentCommentId,
        content: reply.content,
      });
  
      // 4️⃣ 댓글 수정
      console.log('🔹 4️⃣ 댓글 수정 중...');
      const updatedComment = await feedCommentAPI.updateComment(
        comment.id,
        '수정된 댓글입니다.'
      );
      console.log('✅ 수정된 댓글:', {
        id: updatedComment.id,
        content: updatedComment.content,
      });
  
      // 5️⃣ 댓글 목록 조회
      console.log('🔹 5️⃣ 댓글 목록 조회 중...');
      const comments = await feedCommentAPI.getComments(feedId);
      console.log(
        '✅ 댓글 목록 (대댓글 포함) 요약:',
        comments.map((c) => ({
          id: c.id,
          parentCommentId: c.parentCommentId,
          content: c.content,
          replyCount: c.replies?.length ?? 0,
        }))
      );
  
      // 6️⃣ 특정 댓글 조회
      console.log('🔹 6️⃣ 특정 댓글 조회 중...');
      const singleComment = await feedCommentAPI.getComment(comment.id);
      console.log('✅ 특정 댓글 조회 결과:', {
        id: singleComment?.id,
        content: singleComment?.content,
      });
  
      // 7️⃣ 댓글 삭제
      console.log('🔹 7️⃣ 댓글 삭제 중...');
      await feedCommentAPI.deleteComment(comment.id);
      console.log('✅ 댓글 삭제 완료');
  
      const commentsAfterDelete = await feedCommentAPI.getComments(feedId);
      console.log(
        '✅ 댓글 목록 삭제 후 (expect 0 or only replies cleaned):',
        commentsAfterDelete
      );
  
      await feedAPI.deleteFeed(feedId);
      console.log('feed cleanup success');

      console.log('================ FeedCommentAPI 테스트 종료 ================'); 
    } catch (err) {
      console.error('❌ 테스트 에러 발생:', err);
    }
  };

  export const testFollowAPI = async () => {
    const targetUserId = 'f81ca95d-4cac-48cd-9d3b-9e5848c7198b';
  
    try {
      console.log('--- FollowAPI 테스트 시작 ---');
  
      // 1️⃣ 팔로우 시도
      try {
        await followAPI.follow(targetUserId);
        console.log(`[팔로우] ${targetUserId} 팔로우 성공`);
      } catch (err: any) {
        console.warn(`[팔로우] 에러 발생: ${err.message}`);
      }
  
      // 2️⃣ 팔로우 여부 확인
      const isFollowing = await followAPI.isFollowing(targetUserId);
      console.log(`[팔로우 여부] ${targetUserId} 팔로우 중?`, isFollowing);
  
      // 3️⃣ 여러 유저 팔로우 여부 확인 (단일 테스트)
      const areFollowing = await followAPI.areFollowing([targetUserId]);
      console.log('[여러 유저 팔로우 여부]', areFollowing);
  
      // 4️⃣ 팔로워 목록 조회
      const followers = await followAPI.getFollowers({ limit: 5 });
      console.log(
        '[팔로워 목록 요약]',
        followers.map((f) => ({
          followerId: f.followerId,
          followerNickname: f.followerProfile.nickname,
        }))
      );
  
      // 5️⃣ 팔로잉 목록 조회
      const followings = await followAPI.getFollowings({ limit: 5 });
      console.log(
        '[팔로잉 목록 요약]',
        followings.map((f) => ({
          followingId: f.followingId,
          followingNickname: f.followingProfile.nickname,
        }))
      );
  
      // 6️⃣ 팔로워/팔로잉 수 조회
      const counts = await followAPI.getFollowCounts(targetUserId);
      console.log('[팔로워/팔로잉 수]', {
        followerCount: counts.followerCount,
        followingCount: counts.followingCount,
      });
  
      // 7️⃣ 언팔로우 시도
      try {
        await followAPI.unfollow(targetUserId);
        console.log(`[언팔로우] ${targetUserId} 언팔로우 성공`);
      } catch (err: any) {
        console.warn(`[언팔로우] 에러 발생: ${err.message}`);
      }
  
      // 8️⃣ 언팔로우 후 팔로우 여부 확인
      const isFollowingAfterUnfollow = await followAPI.isFollowing(targetUserId);
      console.log(`[언팔 후 팔로우 여부] ${targetUserId} 팔로우 중?`, isFollowingAfterUnfollow);
  
      console.log('--- FollowAPI 테스트 종료 ---');
    } catch (err) {
      console.error('[FollowAPI 테스트 에러]', err);
    }
  };
  
  export const testUserProfileAPI = async () => {
    const targetUserId = 'f81ca95d-4cac-48cd-9d3b-9e5848c7198b';
  
    try {
      console.log('--- [UserProfileAPI] 테스트 시작 ---');
  
      // 1️⃣ 단일 유저 프로필 조회
      const profile = await userProfileAPI.getUserProfile(targetUserId);
      console.log(`[UserProfileAPI] 단일 조회 - ${targetUserId}:`, profile && {
        userId: profile.userId,
        nickname: profile.nickname,
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        postCount: profile.postCount,
      });
  
      // 2️⃣ 여러 유저 프로필 조회
      const profiles = await userProfileAPI.getUserProfiles([targetUserId]);
      console.log(
        `[UserProfileAPI] 여러 유저 조회 - [${targetUserId}]:`,
        profiles.map((p) => ({
          userId: p.userId,
          nickname: p.nickname,
        }))
      );
  
      console.log('--- [UserProfileAPI] 테스트 종료 ---');
    } catch (err) {
      console.error('[UserProfileAPI] 테스트 에러:', err);
    }
  };
  
  // 마지막에 호출
  // testUserProfileAPI();
  