import React from 'react';

const P: Record<string, string> = {
  sound: 'M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12',
  mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6',
  star: 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  tree: 'M12 2l5 7h-3l4 6h-4l3 5H7l3-5H6l4-6H7zM12 20v3',
  share: 'M12 3v12M7 8l5-5 5 5M5 13v7h14v-7',
  cam: 'M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  full: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  drop: 'M12 3C7 9 5 12 5 15a7 7 0 0 0 14 0c0-3-2-6-7-12z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  retry: 'M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5',
  heart: 'M12 21C4 15 3 9 7 6.5 9.5 5 11.5 6.5 12 8c.5-1.5 2.5-3 5-1.5C21 9 20 15 12 21z',
  bell: 'M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7C9 2 6 4 8 7M12 7c3-5 6-3 4 0',
  snow: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7',
  text: 'M5 5h14M12 5v15M8 20h8',
  cup: 'M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 9h2a2.5 2.5 0 0 1 0 5h-2',
  book: 'M4 5h7a2 2 0 0 1 1 .5A2 2 0 0 1 13 5h7v14h-7a2 2 0 0 0-1 .5 2 2 0 0 0-1-.5H4zM12 5.5V19',
  shoe: 'M3 16v-3l5-1 3 2 5 1c3 .5 5 1 5 3v1H3z',
  play: 'M7 4l13 8-13 8z',
  pause: 'M8 5v14M16 5v14',
  warn: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  x: 'M5 5l14 14M19 5L5 19',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
};

const Icon: React.FC<{ n: string; s?: number; f?: boolean; className?: string }> = ({ n, s = 18, f, className }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={f ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth={f ? 1 : 1.8} strokeLinecap="round" strokeLinejoin="round" className={className}
    style={{ display: 'inline', verticalAlign: '-0.2em' }} aria-hidden="true">
    <path d={P[n]} />
  </svg>
);

export default Icon;
