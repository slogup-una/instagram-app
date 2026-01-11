export interface FeedDto {
  id: number;
  user: UserDto;
  images: string[];
  caption: string;
  likesCount: number;
  sharedCount: number;
  isLiked: boolean;
  comments: CommentDto[];
  createdAt: string;
}

export interface UserDto {
  id: number;
  username: string;
  profileImage: string;
}

export interface CommentDto {
  id: number;
  username: string;
  text: string;
}
