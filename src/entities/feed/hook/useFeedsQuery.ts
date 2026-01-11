import { useQuery } from '@tanstack/react-query';
import { getFeeds } from '../api/feed';

export const useFeedsQuery = () => {
  return useQuery({
    queryKey: ['/feeds'],
    queryFn: () => getFeeds(),
    staleTime: 1000,
  });
};
