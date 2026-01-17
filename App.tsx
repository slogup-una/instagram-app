import 'react-native-url-polyfill/auto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigation from './src/navigation/RootNavigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { testFeedAPI, testFeedBookmarkAPI, testFeedLikeAPI, testFeedShareAPI, testFeedCommentAPI, testFollowAPI, testUserProfileAPI} from './src/entities/supbaseTest';
import { useEffect } from 'react';

const queryClient = new QueryClient();

export default function App() {
  // supabase test
  useEffect(() => {
    (async () => {
      //await testFeedAPI();
      //await testFeedBookmarkAPI();
      //await testFeedLikeAPI();
      //await testFeedShareAPI();
      //await testFeedCommentAPI();
      //await testFollowAPI();
      //await testUserProfileAPI();
    })();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
