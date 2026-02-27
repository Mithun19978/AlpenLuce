import { clsx } from 'clsx';

type BadgeColor = 'gold' | 'green' | 'red' | 'gray' | 'blue' | 'orange';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  gold: 'bg-gold/10 text-gold border-gold/30',
  green: 'bg-green-500/10 text-green-400 border-green-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  gray: 'bg-white/5 text-white/40 border-white/10',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        colorMap[color]
      )}
    >
      {label}
    </span>
  );
}

// Helper to get badge props from a status string
export function statusBadge(status: string): { label: string; color: BadgeColor } {
  const map: Record<string, { label: string; color: BadgeColor }> = {
    PENDING: { label: 'Pending', color: 'orange' },
    APPROVED: { label: 'Approved', color: 'green' },
    REJECTED: { label: 'Rejected', color: 'red' },
    OPEN: { label: 'Open', color: 'blue' },
    ESCALATED: { label: 'Escalated', color: 'orange' },
    RESOLVED: { label: 'Resolved', color: 'green' },
    CLOSED: { label: 'Closed', color: 'gray' },
    PROCESSING: { label: 'Processing', color: 'blue' },
    SHIPPED: { label: 'Shipped', color: 'gold' },
    DELIVERED: { label: 'Delivered', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
  };
  return map[status] ?? { label: status, color: 'gray' };
}
