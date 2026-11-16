import React, { useState } from 'react';
import {
  ExternalLink,
  QrCode,
  Sparkles,
  Trophy,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { GameFinishPayload, LiveProgressUpdate } from './ArenaClassicGames';
import { playArenaChime } from '../../services/arenaStorageService';

interface SunGoddessWheelGameProps {
  onProgress: (p: LiveProgressUpdate) => void;
  onFinish: (payload: GameFinishPayload) => void;
}

const GAME_URL = 'https://sieu-tro-ly-tro-choi.netlify.app/?choi=4KBWFRDH';
const QR_IMAGE_PATH = '/assets/images/qr_vong_quay_nu_than_mat_troi.png';

export const SunGoddessWheelGame: React.FC<SunGoddessWheelGameProps> = ({
  onProgress,
  onFinish,
}) => {
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [isFullScreenEmbed, setIsFullScreenEmbed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [studentNote, setStudentNote] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(GAME_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGame = () => {
    window.open(GAME_URL, '_blank', 'noopener,noreferrer');
  };

  const handleClaimReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (completed) return;

    setCompleted(true);
    playArenaChime('victory');

    const totalScore = 50;
    const baseScore = 40;
    const completionBonus = 10;

    onProgress({
      stepIndex: 1,
      totalSteps: 1,
      correctCount: 1,
      wrongCount: 0,
      currentScore: totalScore,
    });

    onFinish({
      breakdown: {
        baseScore,
        speedBonus: 0,
        completionBonus,
        analysisBonus: 0,
        evidenceBonus: 0,
        totalScore,
      },
      correctCount: 1,
      wrongCount: 0,
      totalItems: 1,
      reviewItems: [
        {
          prompt: 'Vòng quay sử thi: Chinh phục Nữ thần Mặt Trời',
          yourAnswer: studentNote.trim() || 'Đã hoàn thành vòng quay và chinh phục các câu hỏi thử thách.',
          correctAnswer: 'Hoàn thành vòng quay & mở khóa thông điệp Nữ thần Mặt Trời',
          explanation: 'Chúc mừng bạn đã xuất sắc tham gia và chinh phục mini-game Vòng quay sử thi!',
        },
      ],
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-wood-900 via-wood-800 to-terracotta-900 text-cream p-6 sm:p-8 rounded-2xl shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold tracking-wider uppercase mb-3 border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trò chơi số 07 · Mini Game Sử Thi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-cream tracking-wide">
              VÒNG QUAY SỬ THI
            </h2>
            <p className="text-sandstone-light text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Chinh phục Nữ thần Mặt Trời qua vòng quay thử thách và các câu hỏi tình huống tương tác.
              Quét mã QR bằng điện thoại hoặc nhấn nút để tham gia trực tiếp!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenGame}
              className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-sm shadow-lg hover:shadow-gold-500/20 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở Trò Chơi Ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* QR Code Section */}
        <div className="lg:col-span-5 bg-wood-900/40 border border-sandstone/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-md">
          <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold tracking-wide uppercase mb-4">
            <QrCode className="w-4 h-4" />
            <span>Cách 1: Quét mã QR</span>
          </div>

          <div className="relative group p-4 bg-white rounded-2xl shadow-xl border-4 border-gold-500/40 hover:border-gold-500 transition-all">
            <img
              src={QR_IMAGE_PATH}
              alt="Mã QR Vòng quay sử thi - Chinh phục Nữ thần Mặt Trời"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-wood-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1.5 bg-wood-900/90 text-gold-400 text-xs font-medium rounded-lg shadow">
                Quét bằng Camera hoặc Zalo
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-sandstone-light mt-4 max-w-xs leading-relaxed">
            Dùng ứng dụng Camera, Zalo hoặc Google Lens trên điện thoại để quét mã và trải nghiệm trên màn hình cảm ứng di động.
          </p>
        </div>

        {/* Direct Link & Controls Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-wood-900/40 border border-sandstone/20 rounded-2xl p-6 sm:p-8 space-y-5 shadow-md">
            <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold tracking-wide uppercase">
              <Flame className="w-4 h-4" />
              <span>Cách 2: Tham gia trên máy tính</span>
            </div>

            <p className="text-cream text-sm leading-relaxed">
              Bạn có thể mở trò chơi ở tab mới để có không gian trải nghiệm tối đa, hoặc nhúng trực tiếp ngay tại trang này.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenGame}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-wood-950 font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở game trong tab mới</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-3 rounded-xl bg-wood-800 hover:bg-wood-700 text-cream text-sm font-medium border border-wood-600 flex items-center gap-2 cursor-pointer transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-sandstone-light" />
                    <span>Sao chép link game</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowEmbed(!showEmbed)}
                className="px-4 py-3 rounded-xl bg-wood-800/80 hover:bg-wood-700 text-sandstone-light hover:text-cream text-sm font-medium border border-wood-700 flex items-center gap-2 cursor-pointer transition-all"
              >
                {showEmbed ? 'Ẩn màn hình nhúng' : 'Xem trực tiếp trong bảo tàng'}
              </button>
            </div>

            {/* Instruction Highlights */}
            <div className="mt-4 p-4 rounded-xl bg-wood-950/60 border border-wood-700/50 space-y-2 text-xs text-sandstone-light">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cream">Hướng dẫn nhiệm vụ:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-sandstone">
                    <li>Quay vòng quay để nhận ngẫu nhiên câu hỏi hoặc thử thách sử thi.</li>
                    <li>Vượt qua các câu đố liên quan đến hành trình Đăm Săn đi bắt Nữ thần Mặt Trời.</li>
                    <li>Sau khi hoàn thành, quay lại đây và nhấn nút <strong>Xác nhận hoàn thành</strong> bên dưới để nhận 50 điểm danh dự!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Claim Card */}
          <div className="bg-gradient-to-br from-wood-900/60 via-wood-800/40 to-wood-900/60 border border-gold-500/30 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-cream">Xác nhận hoàn thành nhiệm vụ</h3>
                <p className="text-xs text-sandstone-light">Nhận ngay +50 điểm đấu trường và lưu vào Hộ chiếu sử thi</p>
              </div>
            </div>

            {completed ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold">Đã ghi nhận kết quả thành công!</p>
                  <p className="text-xs text-emerald-300/80 mt-0.5">
                    Bạn đã nhận +50 điểm cho trò chơi số 07. Tiếp tục khám phá các trò chơi khác trong Đấu Trường!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClaimReward} className="space-y-4">
                <div>
                  <label htmlFor="studentNote" className="block text-xs font-medium text-sandstone-light mb-1.5">
                    Cảm nghĩ hoặc số điểm đạt được trong vòng quay (tùy chọn):
                  </label>
                  <input
                    id="studentNote"
                    type="text"
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="Ví dụ: Em đã quay trúng ô Nữ thần Mặt Trời và trả lời đúng cả 3 câu!"
                    className="w-full px-4 py-2.5 rounded-xl bg-wood-950/80 border border-wood-700 text-cream text-sm placeholder:text-sandstone/50 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-wood-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Xác nhận & Nhận 50 Điểm Thưởng</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Iframe Option */}
      {showEmbed && (
        <div
          className={`transition-all duration-300 ${
            isFullScreenEmbed
              ? 'fixed inset-4 z-50 bg-wood-950 rounded-2xl shadow-2xl p-4 flex flex-col border border-gold-500'
              : 'bg-wood-900/60 border border-sandstone/20 rounded-2xl p-4 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-wood-700">
            <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Khung chơi trực tiếp: Vòng quay sử thi</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullScreenEmbed(!isFullScreenEmbed)}
                className="p-1.5 rounded-lg bg-wood-800 hover:bg-wood-700 text-sandstone-light hover:text-cream cursor-pointer"
                title={isFullScreenEmbed ? 'Thu nhỏ' : 'Toàn màn hình'}
              >
                {isFullScreenEmbed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setShowEmbed(false)}
                className="p-1.5 rounded-lg bg-wood-800 hover:bg-wood-700 text-sandstone-light hover:text-cream text-xs font-semibold px-2 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>

          <div className={`w-full rounded-xl overflow-hidden bg-white ${isFullScreenEmbed ? 'flex-1' : 'h-[600px]'}`}>
            <iframe
              src={GAME_URL}
              title="Vòng quay sử thi - Chinh phục Nữ thần Mặt Trời"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};
