import { create } from "zustand";

interface UIState {
  isAppLoading: boolean;
  setIsAppLoading: (isLoading: boolean) => void;
  isMessageAnswerLoading: boolean;
  setIsMessageAnswerLoading: (isLoading: boolean) => void;
}

interface MessagesState {
  list: string[];
  addMessage: (message: string) => void;
  clearMessages: () => void;
}

interface AppState {
  uiState: UIState;
  // messages: MessagesState;
}

const useAppStore = create<AppState>((set) => ({
  uiState: {
    isAppLoading: false,
    isMessageAnswerLoading: false,
    setIsAppLoading: (isLoading: boolean) =>
      set((state) => ({
        uiState: {
          ...state.uiState,
          isAppLoading: isLoading,
        },
      })),
    setIsMessageAnswerLoading: (isLoading: boolean) =>
      set((state) => ({
        uiState: {
          ...state.uiState,
          isMessageAnswerLoading: isLoading,
        },
      })),
  },

  // // Messages slice
  // messages: {
  //   list: [],
  //   addMessage: (message) =>
  //     set((state) => ({
  //       messages: {
  //         ...state.messages,
  //         list: [...state.messages.list, message],
  //       },
  //     })),
  //   clearMessages: () =>
  //     set((state) => ({
  //       messages: {
  //         ...state.messages,
  //         list: [],
  //       },
  //     })),
  // },
}));

export default useAppStore;
