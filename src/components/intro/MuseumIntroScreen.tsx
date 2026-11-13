import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Volume2, VolumeX, ZapOff } from 'lucide-react';
import { SafeImage } from '../common/SafeImage';

interface MuseumIntroScreenProps {
  audioEnabled: boolean;
  reducedMotion: boolean;
  onToggleAudio: () => void;
  onToggleReducedMotion: () => void;
  onEnterMuseum: () => void;
}

interface DawnParticle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

export const MuseumIntroScreen: React.FC<MuseumIntroScreenProps> = ({
  audioEnabled,
  reducedMotion,
  onToggleAudio,
  onToggleReducedMotion,
  onEnterMuseum,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(48, Math.max(20, Math.floor(window.innerWidth / 34)));
    const particles: DawnParticle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.2 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.18 - Math.random() * 0.35,
      alpha: 0.25 + Math.random() * 0.55,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 206, 118, ${p.alpha})`;
        ctx.fill();
      }
      animId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.02 }}
      transition={{ duration: reducedMotion ? 0.05 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-wood-950 text-cream overflow-hidden flex flex-col justify-between"
    >
      {/* Full-bleed Tay Nguyen Dawn Backdrop with Ede Longhouse & Distant Hero */}
      <SafeImage
        src="/src/assets/images/intro_tay_nguyen_dawn_1794539492873.jpg"
        alt="Bình minh đại ngàn Tây Nguyên với nhà dài Ê-đê ở trung tâm và bóng người anh hùng từ xa"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dawn Sunbeams & Contrast Scrim */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${reducedMotion ? '' : 'dawn-sunbeam'}`}
        style={{
          background:
            'radial-gradient(circle at 78% 22%, rgba(250, 204, 110, 0.36) 0%, rgba(220, 168, 71, 0.12) 34%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-wood-950/90 via-wood-950/40 to-wood-950/55 pointer-events-none"
      />

      {/* Floating Dawn Light Particles */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* Top Subtle Controls */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-10 pt-5 flex items-center justify-between gap-4">
        <div className="font-serif text-lg sm:text-xl font-bold tracking-wider text-gold-400">
          SỬ THI SỐ 4.0
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleAudio}
            className="px-3.5 py-2 min-h-[40px] rounded-lg bg-wood-950/70 backdrop-blur-sm border border-white/15 text-xs font-medium text-cream hover:border-gold-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`px-3.5 py-2 min-h-[40px] rounded-lg backdrop-blur-sm border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              reducedMotion
                ? 'bg-gold-500/20 border-gold-400 text-gold-400'
                : 'bg-wood-950/70 border-white/15 text-cream hover:border-gold-400'
            }`}
          >
            <ZapOff className="w-4 h-4" />
            <span className="hidden sm:inline">
              {reducedMotion ? 'Giảm chuyển động: Bật' : 'Giảm chuyển động'}
            </span>
          </button>
        </div>
      </div>

      {/* Center Museum Emblem & Title */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-4 my-auto">
        <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-gold-400 font-semibold">
          SỬ THI SỐ 4.0
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-cream drop-shadow-md">
          BẢO TÀNG SỬ THI XUYÊN KHÔNG
        </h1>
        <p className="text-sm sm:text-base text-cream/85 max-w-xl mx-auto leading-relaxed">
          Không gian di sản văn học Ngữ văn lớp 10 kết hợp mô hình Nhà dài Ê-đê 3D và trải nghiệm đọc hiểu tương tác.
        </p>
      </div>

      {/* Bottom Slogan & Primary Enter CTA */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-10 sm:pb-14 text-center space-y-6">
        <p className="font-serif italic text-lg sm:text-2xl text-cream/95">
          “Hành trình từ đại ngàn Tây Nguyên đến những thiên anh hùng ca của nhân loại.”
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onEnterMuseum}
            className="group px-8 py-4 rounded-xl bg-gold-500 text-wood-950 font-semibold text-base sm:text-lg tracking-wide shadow-[0_0_32px_rgba(220,168,71,0.45)] hover:bg-gold-400 hover:shadow-[0_0_44px_rgba(220,168,71,0.68)] transition-all flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>BẮT ĐẦU HÀNH TRÌNH</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
