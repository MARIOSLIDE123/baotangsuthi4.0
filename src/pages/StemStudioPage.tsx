import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Compass,
  Hammer,
  Layers,
  QrCode,
} from 'lucide-react';
import {
  MuseumRouteId,
  ServiceConnectionStatus,
  StemStudioTabId,
} from '../types/museum';
import {
  StemHouseMissionPanel,
  StemJourneyMissionPanel,
} from '../components/stem/StemMissionsPanel';
import { StemRubricSection } from '../components/stem/StemRubricSection';
import { StemPadletGallery } from '../components/stem/StemPadletGallery';
import { StemQrGeneratorSection } from '../components/stem/StemQrGeneratorSection';

interface StemStudioPageProps {
  serviceStatus: ServiceConnectionStatus;
  activeTab: StemStudioTabId;
  studentName: string;
  className: string;
  completedStemActions?: string[];
  onRecordStemAction?: (actionKey: string, label: string) => void;
  onChangeTab: (tab: StemStudioTabId) => void;
  onNavigate: (route: MuseumRouteId) => void;
}

const STEM_TABS: Array<{
  id: StemStudioTabId;
  code: string;
  label: string;
  actionTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'house',
    code: '01',
    label: 'Nhiệm vụ STEM nhà dài',
    actionTitle: 'Đã hoàn thành tìm hiểu & phác thảo mô hình Nhà dài Ê-đê',
    icon: Hammer,
  },
  {
    id: 'journey',
    code: '02',
    label: 'Nhiệm vụ hành trình Đăm Săn',
    actionTitle: 'Đã hoàn thành thiết kế sản phẩm Hành trình Đăm Săn',
    icon: Compass,
  },
  {
    id: 'rubric',
    code: '03',
    label: 'Rubric đánh giá 4 mức',
    actionTitle: 'Đã tự đối chiếu & đánh giá sản phẩm theo Rubric 4 tiêu chí',
    icon: Award,
  },
  {
    id: 'gallery',
    code: '04',
    label: 'Bảo tàng của chúng em (Padlet)',
    actionTitle: 'Đã đăng sản phẩm / tham quan phòng trưng bày Padlet',
    icon: Layers,
  },
  {
    id: 'qr',
    code: '05',
    label: 'Kết nối QR in mô hình',
    actionTitle: 'Đã tạo mã QR gắn lên mô hình STEM',
    icon: QrCode,
  },
];

export const StemStudioPage: React.FC<StemStudioPageProps> = ({
  serviceStatus,
  activeTab,
  studentName,
  className,
  completedStemActions = [],
  onRecordStemAction,
  onChangeTab,
  onNavigate,
}) => {
  const [localDoneTabs, setLocalDoneTabs] = useState<Record<string, boolean>>({});
  const currentMeta = STEM_TABS.find((t) => t.id === activeTab) || STEM_TABS[0];
  const currentActionKey = `stem_${activeTab}`;
  const isCurrentActionDone =
    completedStemActions.includes(currentActionKey) || Boolean(localDoneTabs[activeTab]);

  const handleConfirmStemStep = () => {
    setLocalDoneTabs((prev) => ({ ...prev, [activeTab]: true }));
    onRecordStemAction?.(currentActionKey, currentMeta.actionTitle);
  };

  return (
    <div className="space-y-8 pb-14">
      <header className="border-b border-sandstone pb-6 space-y-2.5 max-w-4xl">
        <p className="text-xs font-medium text-wood-600">
          Phân khu 08 · Liên kết Ngữ văn – Văn hóa – Thiết kế – STEM
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
          XƯỞNG SÁNG TẠO DI SẢN
        </h1>
        <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
          Hướng dẫn học sinh thiết kế, chế tạo, trình bày và đánh giá sản phẩm STEM gắn với văn hóa sử thi Tây Nguyên; nộp ảnh sản phẩm qua bảng Padlet nhúng trực tiếp và tạo mã QR gắn lên mô hình vật lí.
        </p>
      </header>

      <nav
        aria-label="Phân khu Xưởng sáng tạo di sản"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        {STEM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const tabDone =
            completedStemActions.includes(`stem_${tab.id}`) || Boolean(localDoneTabs[tab.id]);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                isActive
                  ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
                  : 'bg-cream text-wood-900 border-sandstone hover:border-gold-500'
              }`}
            >
              <span
                className={`p-2 rounded-lg shrink-0 ${
                  isActive
                    ? 'bg-gold-500/20 text-gold-300'
                    : 'bg-parchment text-forest-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] font-mono tabular-nums flex items-center justify-between gap-1 ${
                    isActive ? 'text-gold-300' : 'text-wood-500'
                  }`}
                >
                  <span>Mục {tab.code}</span>
                  {tabDone && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />}
                </p>
                <p className="text-xs sm:text-sm font-bold leading-snug">
                  {tab.label}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Action-based STEM milestone confirmation bar */}
      <div className="p-4 rounded-xl bg-parchment/75 border border-sandstone flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-wood-800">
          <strong className="text-wood-900">Ghi nhận tiến độ STEM:</strong>{' '}
          <span>{currentMeta.actionTitle} (Cần hoàn thành ít nhất 3/5 hoạt động STEM).</span>
        </div>
        <button
          type="button"
          onClick={handleConfirmStemStep}
          className={`px-4 py-2 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
            isCurrentActionDone
              ? 'bg-forest-700/15 text-forest-800 border border-forest-700/40'
              : 'bg-forest-700 text-cream hover:bg-forest-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {isCurrentActionDone
              ? 'Đã ghi nhận vào Hộ chiếu'
              : 'Xác nhận đã thực hiện hoạt động này'}
          </span>
        </button>
      </div>

      {activeTab === 'house' && (
        <StemHouseMissionPanel
          onNavigate={onNavigate}
          onSwitchTab={onChangeTab}
        />
      )}

      {activeTab === 'journey' && (
        <StemJourneyMissionPanel
          onNavigate={onNavigate}
          onSwitchTab={onChangeTab}
        />
      )}

      {activeTab === 'rubric' && <StemRubricSection />}

      {activeTab === 'gallery' && (
        <StemPadletGallery
          serviceStatus={serviceStatus}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'qr' && (
        <StemQrGeneratorSection
          defaultGroupName={studentName}
          defaultClassName={className}
          onSwitchTab={onChangeTab}
        />
      )}
    </div>
  );
};
