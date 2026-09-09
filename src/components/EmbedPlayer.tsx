'use client';

import { NetflixPlayer } from './NetflixPlayer';

interface EmbedPlayerProps {
  src: string;
  title?: string;
  onClose?: () => void;
}

export function EmbedPlayer({ src, title = 'Cinema Mode', onClose }: EmbedPlayerProps) {
  return (
    <NetflixPlayer
      title={title}
      sources={[{ id: 'embed', name: 'Stream Server 1', url: src, type: 'embed' }]}
      onClose={onClose}
    />
  );
}
