export function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend > 0 ? 'text-blue-600' : 'text-slate-400'
            }`}>
              {trend > 0 ? '↑' : '→'} {Math.abs(trend)}% from last period
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    primary: 'bg-blue-50 text-blue-700',
    success: 'bg-blue-50 text-blue-700',
    warning: 'bg-blue-50 text-blue-600',
    danger: 'bg-slate-100 text-slate-700',
    invoice: 'bg-blue-50 text-blue-700',
    payment: 'bg-blue-100 text-blue-800',
    dispute: 'bg-slate-200 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="text-center py-12">
      {icon && <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ConfidenceBar({ value, size = 'default' }) {
  const getColor = (v) => {
    if (v >= 85) return 'bg-blue-600';
    if (v >= 70) return 'bg-blue-400';
    return 'bg-slate-400';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-slate-100 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
        <div
          className={`h-full rounded-full transition-all ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`font-medium text-slate-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {value}%
      </span>
    </div>
  );
}

export function StatusDot({ status }) {
  const colors = {
    processed: 'bg-blue-500',
    pending: 'bg-slate-400',
    completed: 'bg-blue-500',
    pending_review: 'bg-slate-400',
    resolved: 'bg-blue-600',
    in_progress: 'bg-blue-400',
    active: 'bg-blue-500',
  };

  return (
    <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-300'}`} />
  );
}
