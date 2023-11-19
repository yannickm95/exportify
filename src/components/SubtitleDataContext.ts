import { createContext, useContext } from 'react';

export const SubtitleDataContext = createContext<
  | {
      viewType: 'error' | 'login' | 'playlists' | null;
      playlistAmount: number;
      userId: string;
      setSubtitleData: (data: { userId: string; playlistAmount: number }) => void;
    }
  | undefined
>(undefined);

SubtitleDataContext.displayName = 'SubtitleDataContext';

export function useSubtitleDataContext() {
  const data = useContext(SubtitleDataContext);

  return data!;
}
