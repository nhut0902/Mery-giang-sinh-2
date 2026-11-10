import React, { useState, useEffect } from 'react';
import Icon from './Icons';

interface CardProps {
  onClose: () => void;
  to?: string;
  from?: string;
}

const BASE = [
  "Giáng Sinh lại về rồi. Chúc Kiều Anh luôn thật ấm áp, không chỉ vì thời tiết mà còn vì có những người luôn nghĩ đến Kiều Anh. Mong là trong mùa Noel này, mỗi khi Kiều Anh mỉm cười, sẽ có một chút lý do đến từ mình.",
  "Mong rằng những ngày lễ này sẽ mang đến cho bạn những khoảnh khắc tuyệt vời bên gia đình và người thân.",
  "Cảm ơn bạn vì đã luôn ở bên và chia sẻ những niềm vui trong năm qua. Chúc bạn năm mới an khang, hạnh phúc và thành công!"
];

// Outlines sampled with the same point count so they can morph point-to-point
const TAU = Math.PI * 2;
const M = 56;
type V = [number, number];
const polar = (f: (t: number) => number) => (t: number): V => [f(t) * Math.cos(t), f(t) * Math.sin(t)];
const heart = (t: number): V => [(16 * Math.sin(t) ** 3) / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17];
const FORMS: V[][] = [
  polar((t) => 0.44 + 0.56 * Math.abs(Math.cos(2.5 * (t + Math.PI / 2))) ** 1.5),
  heart,
  polar((t) => 0.62 + 0.38 * Math.cos(6 * t)),
  polar(() => 0.8),
].map((f) => Array.from({ length: M }, (_, k) => f((k / M) * TAU)));
const COLS = [[255, 212, 90], [255, 77, 109], [150, 210, 255], [120, 224, 143]];

const MorphIcon: React.FC = () => {
  const [s, setS] = useState({ d: '', c: '#ffd45a' });
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const T = now / 2000, i = Math.floor(T) % FORMS.length, j = (i + 1) % FORMS.length;
      const q = Math.min(Math.max(((T % 1) - 0.5) / 0.5, 0), 1), e = q * q * (3 - 2 * q);
      const d = FORMS[i].map(([x, y], k) => `${(12 + (x + (FORMS[j][k][0] - x) * e) * 10).toFixed(2)} ${(12 + (y + (FORMS[j][k][1] - y) * e) * 10).toFixed(2)}`).join('L');
      const c = COLS[i].map((v, k) => Math.round(v + (COLS[j][k] - v) * e)).join(',');
      setS({ d: `M${d}Z`, c: `rgb(${c})` });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 4px ${s.c})` }} aria-hidden="true">
      <path d={s.d} fill={s.c} />
    </svg>
  );
};

// Letters flicker through random glyphs, then lock into place
const Scramble: React.FC<{ text: string; on: boolean }> = ({ text, on }) => {
  const [s, setS] = useState('');
  useEffect(() => {
    if (!on) return;
    const G = '*+#%&@=ÂĂÊÔƠƯ';
    let f = 0;
    const id = setInterval(() => {
      f++;
      setS(text.split('').map((c, i) => (c === ' ' || i < f / 2 ? c : G[(Math.random() * G.length) | 0])).join(''));
      if (f > text.length * 2) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [text, on]);
  return <>{s}</>;
};

const Card: React.FC<CardProps> = ({ onClose, to = 'Kiều Anh', from = '' }) => {
  const LINES = BASE.map((l) => l.split('Kiều Anh').join(to || 'bạn'));
  const [displayedLines, setDisplayedLines] = useState<string[]>(["", "", ""]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [st, setSt] = useState(0); // 0 envelope closed, 1 flap open, 2 letter unfolded

  useEffect(() => {
    const a = setTimeout(() => setSt(1), 350), b = setTimeout(() => setSt(2), 1250);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (st < 2 || lineIndex >= LINES.length) return;
    const timer = setTimeout(() => {
      setDisplayedLines((prev) => {
        const n = [...prev];
        n[lineIndex] = LINES[lineIndex].substring(0, charIndex + 1);
        return n;
      });
      if (charIndex + 1 < LINES[lineIndex].length) setCharIndex((v) => v + 1);
      else setTimeout(() => { setLineIndex((v) => v + 1); setCharIndex(0); }, 300);
    }, 50);
    return () => clearTimeout(timer);
  }, [st, lineIndex, charIndex]);

  const handleSkip = () => {
    setDisplayedLines(LINES);
    setLineIndex(LINES.length);
  };
  const done = lineIndex >= LINES.length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/70 backdrop-blur-sm animate-[appear_0.5s_ease-out]" style={{ perspective: 900 }}>
      {/* Envelope that opens, then dissolves into the letter */}
      <div className="absolute pointer-events-none transition-all duration-700" style={{ opacity: st >= 2 ? 0 : 1, transform: st >= 2 ? 'scale(1.5)' : 'none' }}>
        <div className="relative w-56 h-36" style={{ perspective: 600 }}>
          <svg viewBox="0 0 224 144" className="absolute inset-0 w-full h-full">
            <rect width="224" height="144" rx="8" fill="#b91c1c" />
            <path d="M0 144L112 62 224 144" fill="none" stroke="#7f1d1d" strokeWidth="3" />
          </svg>
          <svg viewBox="0 0 224 144" className="absolute inset-0 w-full h-full"
            style={{ transformOrigin: 'top', transition: 'transform .8s ease-in-out', transform: st >= 1 ? 'rotateX(180deg)' : 'none' }}>
            <path d="M0 0H224L112 84Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div
        className="relative bg-[#fffaff] border-[3px] border-red-400 rounded-xl p-5 md:p-6 max-w-[90%] md:max-w-sm w-full shadow-[0_0_40px_rgba(255,50,50,0.3)] text-center text-[#222] font-['Mallanna',_sans-serif] transform"
        style={{ opacity: st >= 2 ? 1 : 0, transform: st >= 2 ? 'none' : 'translateY(16px) scale(.94)', transition: 'all .8s cubic-bezier(.22,1,.36,1)' }}
        onClick={handleSkip}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute -top-3 -right-3 w-7 h-7 bg-white border-2 border-red-400 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all z-20 shadow-md"
          aria-label="Đóng"
        >
          <Icon n="x" s={14} />
        </button>

        <div className="mb-3">
          <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl text-red-600 font-bold drop-shadow-sm">
            <MorphIcon /><Scramble text="Thư Chúc Mừng" on={st >= 2} /><MorphIcon />
          </h2>
          <div className="w-12 h-1 bg-red-400 mx-auto mt-1 rounded-full"></div>
        </div>

        <div className="space-y-3 text-base md:text-lg leading-tight font-semibold min-h-[140px] text-left select-none cursor-pointer overflow-y-auto max-h-[50vh]" title="Nhấn để hiện tất cả chữ">
          {displayedLines.map((text, idx) => (
            idx <= lineIndex && (
              <p key={idx} className="bg-red-50/50 p-2 rounded-md border-l-2 border-red-200 animate-[morphIn_0.6s_ease-out]">
                {text}
                {idx === lineIndex && !done && (
                  <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} inline-block w-[2px] h-[1.1em] bg-red-600 ml-1 align-bottom`}></span>
                )}
              </p>
            )
          ))}
        </div>

        <div className={`mt-4 text-red-600 font-bold text-lg md:text-xl transition-all duration-1000 ${done ? 'opacity-100 scale-105' : 'opacity-0 translate-y-2'}`}>
          <Scramble text="Giáng Sinh Vui Vẻ!" on={done} /> <Icon n="heart" s={18} f className="text-red-500" />
          {from && <div className="mt-1 text-sm text-gray-500 italic font-normal">— {from}</div>}
        </div>

        {!done && (
          <div className="absolute bottom-2 right-4 text-[9px] text-gray-400 italic animate-pulse">Chạm để xem hết...</div>
        )}
      </div>
    </div>
  );
};

export default Card;
