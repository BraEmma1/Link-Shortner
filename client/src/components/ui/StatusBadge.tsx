type LinkStatus = 'active' | 'inactive' | 'expired';

interface StatusBadgeProps {
  status: LinkStatus;
}

const STATUS_CONFIG: Record<
  LinkStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  active: {
    label: 'Active',
    dotColor: 'bg-success-green',
    bgColor: 'bg-[#E6F6F0]',
    textColor: 'text-success-green',
  },
  inactive: {
    label: 'Inactive',
    dotColor: 'bg-secondary',
    bgColor: 'bg-surface-variant',
    textColor: 'text-secondary',
  },
  expired: {
    label: 'Expired',
    dotColor: 'bg-error',
    bgColor: 'bg-error-container',
    textColor: 'text-error',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[12px] font-medium ${config.bgColor} ${config.textColor}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
