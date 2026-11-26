import React, { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, Download, ExternalLink, QrCode } from 'lucide-react';
import { STEM_QR_PRESETS } from '../../data/arenaAndStemData';
import { StemQrTargetPreset, StemStudioTabId } from '../../types/museum';

interface StemQrGeneratorSectionProps {
  defaultGroupName: string;
  defaultClassName: string;
  onSwitchTab: (tab: StemStudioTabId) => void;
}

function buildStemDeepLink(stemTab: StemStudioTabId): string {
  if (typeof window === 'undefined') {
    return `https://su-thi-so.edu.vn/?zone=stem-studio&stemTab=${stemTab}`;
  }
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('zone', 'stem-studio');
  url.searchParams.set('stemTab', stemTab);
  return url.toString();
}

export const StemQrGeneratorSection: React.FC<StemQrGeneratorSectionProps> = ({
  defaultGroupName,
  defaultClassName,
  onSwitchTab,
}) => {
  const [selectedId, setSelectedId] = useState<StemQrTargetPreset['id']>('qr-house');
  const [groupLabel, setGroupLabel] = useState<string>(() => {
    const cleanName = defaultGroupName?.trim();
    const cleanClass = defaultClassName?.trim();
    if (
      !cleanName ||
      cleanName.includes('Hồ Thị Thanh Loan') ||
      cleanName.includes('Học sinh trải nghiệm')
    ) {
      return 'Nhóm Kiến trúc sư di sản lớp 10D3 trường Trung học phổ thông Trần Nguyên Hãn';
    }
    if (cleanName && cleanClass) return `${cleanName} · ${cleanClass}`;
    return cleanName || 'Nhóm Kiến trúc sư di sản lớp 10D3 trường Trung học phổ thông Trần Nguyên Hãn';
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  const selectedPreset = useMemo(
    () => STEM_QR_PRESETS.find((p) => p.id === selectedId) || STEM_QR_PRESETS[0],
    [selectedId]
  );

  const targetUrl = useMemo(
    () => buildStemDeepLink(selectedPreset.stemTab),
    [selectedPreset.stemTab]
  );

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedId(selectedPreset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDownloadPrintablePng = () => {
    const sourceCanvas = canvasWrapRef.current?.querySelector('canvas');
    if (!sourceCanvas) return;

    const width = 640;
    const height = 800;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F8F4EC';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#C8B99B';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    ctx.fillStyle = '#231B13';
    ctx.fillRect(18, 18, width - 36, 108);

    ctx.fillStyle = '#E5C478';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SỬ THI SỐ 4.0 · BẢO TÀNG SỬ THI XUYÊN KHÔNG', width / 2, 58);

    ctx.fillStyle = '#F8F4EC';
    ctx.font = 'bold 26px serif';
    ctx.fillText(selectedPreset.label.toUpperCase(), width / 2, 100);

    const qrBoxSize = 400;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 160;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeStyle = '#D5C7AE';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    const qrDrawSize = 356;
    ctx.drawImage(
      sourceCanvas,
      (width - qrDrawSize) / 2,
      qrBoxY + (qrBoxSize - qrDrawSize) / 2,
      qrDrawSize,
      qrDrawSize
    );

    ctx.fillStyle = '#1F4A38';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(
      groupLabel.trim() || 'Nhóm Kiến trúc sư di sản lớp 10D3 trường Trung học phổ thông Trần Nguyên Hãn',
      width / 2,
      616
    );

    ctx.fillStyle = '#4E3B27';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      'Quét mã QR bằng điện thoại để mở trực tiếp nội dung trên Bảo tàng số',
      width / 2,
      656
    );

    ctx.fillStyle = '#735A3E';
    ctx.font = '13px monospace';
    const truncatedUrl =
      targetUrl.length > 68 ? `${targetUrl.slice(0, 65)}...` : targetUrl;
    ctx.fillText(truncatedUrl, width / 2, 704);

    ctx.fillStyle = '#B68938';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('TEM GẮN MÔ HÌNH TRƯNG BÀY STEAM', width / 2, 748);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${selectedPreset.fileSlug}.png`;
    a.click();
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-wood-900">
            <QrCode className="w-5 h-5 text-gold-600" />
            <h2 className="font-serif text-2xl font-bold">
              Kết nối QR · Tạo tem gắn lên mô hình vật lí
            </h2>
          </div>
          <p className="text-sm text-wood-700 leading-relaxed">
            Chọn đúng đích đến trong ứng dụng để tạo mã QR và tải về dạng ảnh PNG in giấy cứng đặt cạnh mô hình nhà dài hoặc bản đồ hành trình Đăm Săn.
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-wood-700">
            Chọn 1 trong 3 trang đích của mã QR:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {STEM_QR_PRESETS.map((preset) => {
              const active = preset.id === selectedId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedId(preset.id)}
                  className={`text-left p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-wood-900 text-cream border-wood-900'
                      : 'bg-parchment/60 text-wood-900 border-sandstone hover:border-gold-500'
                  }`}
                >
                  <div className="space-y-1">
                    <p
                      className={`text-[11px] font-mono ${
                        active ? 'text-gold-300' : 'text-forest-800'
                      }`}
                    >
                      {preset.shortTag}
                    </p>
                    <p className="text-sm font-bold">{preset.label}</p>
                    <p
                      className={`text-xs leading-relaxed ${
                        active ? 'text-cream/80' : 'text-wood-700'
                      }`}
                    >
                      {preset.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold shrink-0 px-3 py-1 rounded-md border ${
                      active
                        ? 'border-gold-400/60 text-gold-300'
                        : 'border-sandstone text-wood-700 bg-cream'
                    }`}
                  >
                    {active ? 'Đang chọn' : 'Chọn tạo QR'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="qr-group-label"
            className="block text-xs font-semibold text-wood-800"
          >
            Nhãn tên nhóm / lớp hiển thị trên tem in
          </label>
          <input
            id="qr-group-label"
            type="text"
            value={groupLabel}
            onChange={(e) => setGroupLabel(e.target.value)}
            placeholder="Ví dụ: Nhóm 02 · Lớp 10A1"
            className="w-full px-3.5 py-2.5 text-sm bg-cream border border-sandstone rounded-lg focus:outline-none focus:border-forest-700"
          />
        </div>

        <div className="p-4 rounded-xl bg-parchment/80 border border-sandstone space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-wood-900">
              Liên kết đích mà mã QR sẽ mở:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2.5 py-1 text-xs font-semibold bg-cream text-wood-800 border border-sandstone rounded hover:border-gold-500 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedId === selectedPreset.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-forest-700" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSwitchTab(selectedPreset.stemTab)}
                className="px-2.5 py-1 text-xs font-semibold bg-forest-700 text-cream rounded hover:bg-forest-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Mở thử trang đích</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-xs font-mono text-wood-700 break-all">{targetUrl}</p>
        </div>
      </div>

      <aside className="lg:col-span-5 bg-wood-900 text-cream rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-gold-400">
            Tem trưng bày bảo tàng STEAM
          </p>
          <p className="text-xs text-cream/75">{selectedPreset.shortTag}</p>
        </div>

        <div
          ref={canvasWrapRef}
          className="p-4 bg-cream rounded-xl border-2 border-gold-400/60"
        >
          <QRCodeCanvas
            value={targetUrl}
            size={210}
            bgColor="#F8F4EC"
            fgColor="#231B13"
            level="M"
            includeMargin
          />
        </div>

        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-cream">
            {selectedPreset.label}
          </h3>
          <p className="text-xs font-medium text-gold-300">
            {groupLabel.trim() ||
              'Nhóm Kiến trúc sư di sản lớp 10D3 trường Trung học phổ thông Trần Nguyên Hãn'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPrintablePng}
          className="w-full px-4 py-3 text-sm font-bold bg-gold-500 text-wood-900 rounded-xl hover:bg-gold-400 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Tải ảnh mã QR (.PNG) để in gắn mô hình</span>
        </button>

        <p className="text-xs text-cream/70 leading-relaxed max-w-xs">
          Ảnh tải về đã có sẵn khung tên bảo tàng, tên mục đích và tên nhóm để in thẳng ra giấy đặt bên mô hình vật lí.
        </p>
      </aside>
    </section>
  );
};
