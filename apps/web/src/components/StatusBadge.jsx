const statusStyles = {
  open: 'bg-amber-50 text-amber-800 ring-amber-200',
  'in-progress': 'bg-blue-50 text-blue-800 ring-blue-200',
  closed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

const statusNames = {
  open: 'Open',
  'in-progress': 'In progress',
  closed: 'Closed',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}>
      {statusNames[status] || status}
    </span>
  );
}
