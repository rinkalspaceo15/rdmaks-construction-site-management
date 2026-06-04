import { useTranslation } from '../i18n';

type Status = 'active' | 'completed' | 'on_hold';

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG: Record<Status, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

export default StatusBadge;
