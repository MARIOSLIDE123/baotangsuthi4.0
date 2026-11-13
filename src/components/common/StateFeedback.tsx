import React from 'react';
import { AlertCircle, FolderOpen, Info, Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Đang tải tư liệu bảo tàng...',
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-sandstone bg-parchment/50 rounded-xl">
    <Loader2 className="w-7 h-7 text-gold-600 animate-spin mb-3" />
    <p className="text-sm font-medium text-wood-800">{message}</p>
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Không thể tải dữ liệu', message, onRetry }) => (
  <div className="flex flex-col items-start gap-3 p-6 border border-red-300 bg-red-50/70 rounded-xl text-wood-900">
    <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>{title}</span>
    </div>
    <p className="text-sm text-wood-800 leading-relaxed">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 transition-colors cursor-pointer"
      >
        Thử lại
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-sandstone bg-parchment/40 rounded-xl">
    <FolderOpen className="w-8 h-8 text-wood-500 mb-3" strokeWidth={1.5} />
    <h3 className="font-serif text-xl font-semibold text-wood-900">{title}</h3>
    <p className="text-sm text-wood-700 max-w-md mt-1 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const DemoModeBanner: React.FC<{
  serviceName: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ serviceName, detail, actionLabel, onAction }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border border-gold-500/40 bg-parchment/80 rounded-xl text-sm">
    <div className="flex items-start gap-2.5 text-wood-800">
      <Info className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-wood-900">{serviceName} · Chế độ Demo: </span>
        <span className="text-wood-700">{detail}</span>
      </div>
    </div>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-3.5 py-1.5 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
