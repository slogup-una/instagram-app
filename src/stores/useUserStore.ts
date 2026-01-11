import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IUserState {
  isInit: boolean;
  setIsInit: (value: boolean) => void;
}

export const useUserStore = create<IUserState>()(
  persist(
    (set) => ({
      isInit: true,
      setIsInit: (value) => set({ isInit: value }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
