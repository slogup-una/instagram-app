import axios, { AxiosRequestConfig } from 'axios';
import { ErrorResponse } from './fetchAPI.types';
import Config from 'react-native-config';

const publicFetchAPI = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const publicApiClient = axios.create({
    baseURL: Config.APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('APP_API_URL:', Config.APP_API_URL);

  try {
    const response = await publicApiClient.request<T>({
      url: endpoint,
      baseURL: endpoint.startsWith('http') ? undefined : Config.APP_API_URL,
      ...config,
    });

    return response.data;
  } catch (error) {
    const errorResponse = error as ErrorResponse;
    throw errorResponse.data;
  }
};

const privateFetchAPI = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const privateApiClient = axios.create({
    baseURL: Config.APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    const response = await privateApiClient.request<T>({
      url: endpoint,
      baseURL: endpoint.startsWith('http') ? undefined : Config.APP_API_URL,
      ...config,
    });

    return response.data;
  } catch (error) {
    const errorResponse = error as ErrorResponse;
    throw errorResponse.data;
  }
};

export { publicFetchAPI, privateFetchAPI };
