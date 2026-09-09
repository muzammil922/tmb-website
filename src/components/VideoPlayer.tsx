'use client';

import { NetflixPlayer, type NetflixPlayerProps } from './NetflixPlayer';

export function VideoPlayer(props: NetflixPlayerProps) {
  return <NetflixPlayer {...props} />;
}
