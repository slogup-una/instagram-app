import { useQuery } from '@tanstack/react-query';
import { getFeeds } from '../api/feed';

export const useFeedsQuery = () => {
  return useQuery({
    queryKey: ['/feeds'],
    queryFn: async () => {
      const res = await getFeeds();
      console.log('getFeeds:', res);
      return res;
    },
    staleTime: 1000,
  });
};
