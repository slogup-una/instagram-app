import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './src/navigation/TabNavigation';
import { ThemeProvider } from './src/context/ThemeContext';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <TabNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
