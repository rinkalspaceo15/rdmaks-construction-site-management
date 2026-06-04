import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

function PageHeader({ title, actionLabel, onAction }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="group inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
        className="mt-2 h-1 w-12 rounded-full bg-amber-500"
      />
    </div>
  );
}

export default PageHeader;
