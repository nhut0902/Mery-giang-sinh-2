import React, { useEffect, useState } from 'react';

const Countdown: React.FC = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const y = new Date(now).getFullYear();
  let end = new Date(y, 11, 25).getTime();
  if (now >= end + 864e5) end = new Date(y + 1, 11, 25).getTime();
  const left = end - now;
  const box = 'absolute top-4 left-4 z-40 pointer-events-none';
  if (left <= 0) return <div className={`${box} text-yellow-300 text-xl`}>Giáng Sinh vui vẻ!</div>;
  const u: [number, string][] = [
    [Math.floor(left / 864e5), 'ngày'], [Math.floor(left / 36e5) % 24, 'giờ'],
    [Math.floor(left / 6e4) % 60, 'phút'], [Math.floor(left / 1e3) % 60, 'giây'],
  ];
  return (
    <div className={`${box} flex gap-1.5`} aria-label="Đếm ngược đến Giáng Sinh">
      {u.map(([v, l]) => (
        <div key={l} className="min-w-[38px] rounded-lg border border-white/15 bg-white/10 backdrop-blur px-1.5 py-1 text-center">
          <div className="text-lg leading-none text-yellow-300 tabular-nums">{String(v).padStart(2, '0')}</div>
          <div className="text-[9px] text-gray-300 font-mono">{l}</div>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
