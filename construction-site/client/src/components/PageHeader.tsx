interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

function PageHeader({ title, actionLabel, onAction }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default PageHeader;
