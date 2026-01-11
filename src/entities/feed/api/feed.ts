import { publicFetchAPI } from '../../../shared/api/fetchAPI';

export const getFeeds = async () => {
  return publicFetchAPI<any>('/feeds', {
    method: 'GET',
  });
};
