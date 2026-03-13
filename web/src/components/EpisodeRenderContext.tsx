'use client';

import { createContext, useContext } from 'react';

export interface EpisodeRenderState {
  renderMode: boolean;
  slideElapsedSec: number;
}

const defaultState: EpisodeRenderState = {
  renderMode: false,
  slideElapsedSec: 0,
};

const EpisodeRenderContext = createContext<EpisodeRenderState>(defaultState);

export function EpisodeRenderProvider({
  value,
  children,
}: {
  value: EpisodeRenderState;
  children: React.ReactNode;
}) {
  return (
    <EpisodeRenderContext.Provider value={value}>
      {children}
    </EpisodeRenderContext.Provider>
  );
}

export function useEpisodeRenderState(): EpisodeRenderState {
  return useContext(EpisodeRenderContext);
}
