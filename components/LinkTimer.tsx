import React, { useEffect, useState } from 'react';

// ===== NhutCoder Team — chip thời gian sống của link (?id=) =====
// Hiện khi thiệp mở bằng link cá nhân hóa từ site chính. Bấm vào chip → mở
// trang quản lý link (tạo QR, gia hạn bằng Xu, hồi sinh link hết hạn).
const CREATE_URL = 'https://nhutcoder-team-v2.vercel.app/tang-giang-sinh';

interface LinkTimerProps {
  expiresAt: number;
  linkId: string;
}

const LinkTimer: React.FC<LinkTimerProps> = ({ expiresAt, linkId }) => {
  const [left, setLeft] = useState(expiresAt - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(expiresAt - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const href = `${CREATE_URL}?id=${linkId}`;
  const cls =
    'absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto rounded-full px-3.5 py-1.5 text-[11px] font-mono font-semibold shadow-lg backdrop-blur border transition-colors';

  if (left <= 0) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cls} border-red-400/50 bg-red-500/25 text-red-100`}
      >
        Link hết hạn — Gia hạn bằng Xu
      </a>
    );
  }

  const s = Math.floor(left / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  const txt =
    d > 0 ? `Còn ${d} ngày ${h % 24} giờ`
    : h > 0 ? `Còn ${h}:${String(m % 60).padStart(2, '0')}`
    : `Còn ${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Gia hạn link bằng Xu — mở trang quản lý link"
      className={`${cls} border-yellow-400/40 bg-black/50 text-yellow-200 hover:bg-black/70`}
    >
      {txt} <span className="opacity-60">· Gia hạn</span>
    </a>
  );
};

export default LinkTimer;
