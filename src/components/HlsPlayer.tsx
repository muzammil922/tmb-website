'use client';

import { NetflixPlayer, type NetflixPlayerProps } from './NetflixPlayer';

export function HlsPlayer(props: NetflixPlayerProps) {
  return <NetflixPlayer {...props} />;
}
