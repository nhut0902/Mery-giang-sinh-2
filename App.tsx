import React, { useState, useRef, useCallback, useEffect } from 'react';
import Snow from './components/Snow';
import Tree from './components/Tree';
import Card from './components/Card';
import { GREETINGS, AUDIO_URL } from './constants';
import Icon from './components/Icons';
import Countdown from './components/Countdown';
import LinkTimer from './components/LinkTimer';

// ===== NhutCoder Team — site chính quản lý link thiệp (?id=) =====
// Link free sống 10 phút; gia hạn/hồi sinh bằng Xu tại CREATE_URL?id=…
const API_BASE = 'https://nhutcoder-team-v2.vercel.app';
const CREATE_URL = `${API_BASE}/tang-giang-sinh`;

interface GiftData {
  name?: string;
  to?: string;
  from?: string;
  text?: string;
  sign?: string;
}

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const qs = new URLSearchParams(location.search);
  // ===== NhutCoder Team — tải dữ liệu link cá nhân hóa ?id=XXXX =====
  const [gift, setGift] = useState<GiftData | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [expired, setExpired] = useState<{ title: string; sub: string } | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    setLinkId(id);
    fetch(`${API_BASE}/api/xmas-links/${id}`, { cache: 'no-store' })
      .then(r => {
        if (r.status === 410) { setExpired({ title: 'Link đã hết hạn', sub: 'Thiệp đã hết thời gian hiển thị. Gia hạn bằng Xu để hồi sinh, hoặc tạo thiệp mới miễn phí nhé.' }); return null; }
        if (r.status === 404) { setExpired({ title: 'Không tìm thấy thiệp', sub: 'Link không tồn tại hoặc đã được dọn dẹp. Tạo thiệp mới của riêng bạn nhé.' }); return null; }
        if (!r.ok) return null;
        return r.json();
      })
      .then(j => {
        if (!j || !j.ok || !j.data) return;
        setGift(j.data);
        setExpiresAt(j.expiresAt);
      })
      .catch(() => {});
  }, []);

  // Ưu tiên dữ liệu link ?id= → tham số kiểu cũ ?to=/?from= → tên mặc định.
  // LƯU Ý: `to` của thiệp này là TÊN người nhận (Card thay chữ "Kiều Anh" trong
  // thư bằng tên đó), nên khi user điền lời chào riêng thì hiển thị như một dòng riêng.
  const to = gift?.name || qs.get('to') || 'Kiều Anh';
  const from = gift?.from || qs.get('from') || '';
  const giftLines = gift && (gift.to || gift.text)
    ? ([gift.to, gift.text].filter(Boolean) as string[])
    : null;
  const [photo, setPhoto] = useState<{ img: HTMLImageElement; n: number }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader(); // processed locally, nothing is uploaded
    r.onload = () => {
      const img = new Image();
      img.onload = () => setPhoto({ img, n: Date.now() });
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startExperience = () => {
    setStarted(true);
    playMusic();
    
    // Tự động hiện thiệp sau 10 giây
    setTimeout(() => {
      setShowCard(true);
    }, 10000);
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          console.log("Audio playing successfully");
          setAudioError(false);
          setIsMuted(false);
        })
        .catch(e => {
          console.error("Audio play failed:", e);
          setAudioError(true);
        });
      audioRef.current.volume = 0.5;
    }
  };

  const handleNextGreeting = useCallback(() => {
    setCurrentGreeting((prev) => (prev + 1) % GREETINGS.length);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsMuted(false);
          setAudioError(false);
        }).catch(() => setAudioError(true));
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsMuted(false);
      setAudioError(false);
    };
    const handlePause = () => setIsMuted(true);
    const handleError = (e: any) => {
      console.error("Audio error event:", e);
      setAudioError(true);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[radial-gradient(ellipse_at_center,_#1b2735_0%,_#090a0f_100%)] overflow-hidden text-white flex flex-col">
      {/* Background Audio */}
      <audio 
        ref={audioRef} 
        src={AUDIO_URL} 
        loop 
        preload="auto" 
        crossOrigin="anonymous"
        onError={() => setAudioError(true)}
      />

      {/* Snow Effect */}
      <Snow />

      {/* Music Control & Error Messages */}
      {started && (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-3">
          <button 
            onClick={toggleMusic}
            className={`p-3 rounded-full backdrop-blur border transition-all text-xl pointer-events-auto shadow-lg ${
              isMuted ? 'bg-red-500/30 border-red-500/50' : 'bg-white/10 border-white/30 hover:bg-white/20'
            }`}
          >
            <Icon n={isMuted ? 'mute' : 'sound'} s={22} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            onClick={() => fileRef.current?.click()}
            title="Tải ảnh lên để biến hình"
            aria-label="Tải ảnh lên để biến hình"
            className="p-3 rounded-full backdrop-blur border transition-all pointer-events-auto shadow-lg bg-white/10 border-white/30 hover:bg-white/20"
          >
            <Icon n="image" s={22} />
          </button>
          
          {audioError && (
            <div className="flex flex-col items-end gap-1 animate-[appear_0.3s_ease-out]">
              <div className="bg-black/80 border border-red-500/40 p-2 rounded-lg text-right shadow-2xl">
                <p className="text-[11px] text-red-400 font-bold font-mono"><Icon n="warn" s={12} /> KHÔNG TẢI ĐƯỢC NHẠC</p>
                <p className="text-[9px] text-gray-400 font-mono italic max-w-[200px] break-all">Kiểm tra kết nối mạng hoặc link nhạc</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); playMusic(); }}
                  className="mt-2 text-[10px] bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-2 py-1 rounded transition-colors text-white font-mono pointer-events-auto"
                >
                  <Icon n="retry" s={12} /> THỬ LẠI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative flex flex-col items-center justify-center z-10 pointer-events-none">
        
        {/* Header Text */}
        <div className={`w-full transition-all duration-1000 transform ${started ? 'translate-y-[-180px] md:translate-y-[-220px] scale-75' : 'translate-y-[-60px]'}`}>
          <h1 className="text-3xl md:text-6xl text-yellow-400 font-bold tracking-wider drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] text-center mb-4">
            MERRY CHRISTMAS
          </h1>
          {started && (
             <div className="w-full h-12 md:h-16 relative overflow-hidden pointer-events-none">
                <div 
                  key={currentGreeting}
                  className="absolute top-0 whitespace-nowrap text-2xl md:text-4xl text-green-300 font-bold drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]"
                  style={{ 
                    animation: 'run 10s linear forwards',
                    willChange: 'transform'
                  }}
                  onAnimationEnd={handleNextGreeting}
                >
                  <Icon n="tree" s={22} f /> {GREETINGS[currentGreeting].text} <Icon n="tree" s={22} f />
                </div>
             </div>
          )}
        </div>

        {/* Start Button / Star Interaction */}
        {!started && (
          <div className="flex flex-col items-center animate-[float_3s_ease-in-out_infinite] pointer-events-auto cursor-pointer" onClick={startExperience}>
             <div className="text-yellow-300 text-7xl md:text-8xl drop-shadow-[0_0_25px_rgba(255,215,0,1)] transition-transform hover:scale-110 active:scale-95"><Icon n="star" s={90} f /></div>
             <p className="mt-4 text-gray-300 text-lg md:text-xl font-mono border border-gray-600 px-4 py-2 rounded bg-black/40 backdrop-blur-sm shadow-xl">
               Chạm vào ngôi sao
             </p>
          </div>
        )}

        {/* The Tree */}
        <div className={`transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
          <Tree isVisible={started} photo={photo} />
        </div>

      </div>

      {/* Floating Buttons/Controls */}
      {started && !showCard && (
        <button 
          onClick={() => setShowCard(true)}
          className="absolute bottom-32 right-6 md:right-10 pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-red-400/60 rounded-full w-12 h-12 flex items-center justify-center transition-all z-20 shadow-[0_0_15px_rgba(255,100,100,0.4)] group"
          title="Mở thiệp chúc mừng"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md"><Icon n="mail" s={22} /></span>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse"></div>
        </button>
      )}

      {/* Message Card */}
      {showCard && (
        <div className="pointer-events-auto">
            <Card
              key={`${to}|${from}|${gift?.to || ''}|${gift?.text || ''}|${gift?.sign || ''}`}
              onClose={() => setShowCard(false)}
              to={to}
              from={from}
              customLines={giftLines}
              sign={gift?.sign}
            />
        </div>
      )}

      {started && <Countdown />}

      {/* ===== NhutCoder Team — chip thời gian sống của link + màn hết hạn ===== */}
      {linkId && !expired && expiresAt && <LinkTimer expiresAt={expiresAt} linkId={linkId} />}
      {expired && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center text-center px-6">
          <div className="text-4xl text-yellow-300 mb-3">❄</div>
          <div className="text-2xl md:text-3xl text-yellow-200 font-bold mb-2">{expired.title}</div>
          <p className="text-sm text-gray-300 max-w-[340px] leading-relaxed mb-5">{expired.sub}</p>
          <div className="flex flex-col items-center gap-3">
            {linkId && (
              <a
                href={`${CREATE_URL}?id=${linkId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95 bg-gradient-to-br from-orange-700 to-orange-500"
              >
                Gia hạn link bằng Xu
              </a>
            )}
            <a
              href={CREATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95 bg-gradient-to-br from-amber-600 to-amber-400"
            >
              Tạo thiệp mới — miễn phí
            </a>
          </div>
        </div>
      )}

      {/* Footer / Info & Links */}
      <div className="w-full pb-6 pt-4 text-center z-30 flex flex-col items-center gap-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
         <p className="text-gray-400 text-xs md:text-sm font-mono opacity-90 pointer-events-none mb-1">
            Powered By <span className="text-red-400 font-bold">Nhutcoder</span>
         </p>
         
         <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
            <a 
                href="https://www.facebook.com/share/1CQSP8hUo3/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-yellow-500 hover:text-yellow-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-md"
            >
                <Icon n="cup" s={13} /> Donate cho mình
            </a>

            <a 
                href="https://blog-89b4.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-green-400 hover:text-green-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-green-500/30 shadow-md"
            >
                <Icon n="book" s={13} /> Đọc Blog
            </a>

            <a
                href={CREATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-rose-300 hover:text-rose-200 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-rose-400/30 shadow-md"
            >
                <Icon n="mail" s={13} /> Tạo thiệp riêng của bạn
            </a>

            <a
                href="https://giaydephuongnho.vercel.app"
                target="_blank" 
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-red-500/30 shadow-md"
            >
                <Icon n="shoe" s={13} /> Mua giày dép
            </a>
         </div>
      </div>
      
    </div>
  );
};

export default App;