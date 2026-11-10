import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../app/SessionContext.jsx';
import { Notice } from '../components/Notice.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { listBugs } from '../services/bugService.js';

const filters = [
  { value: 'all', label: 'All bugs' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'closed', label: 'Closed' },
];

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function DashboardPage() {
  const { token, signOut } = useSession();
  const [filter, setFilter] = useState('all');
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    listBugs(token, filter)
      .then(({ bugs: results }) => { if (active) setBugs(results); })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) signOut();
        else setError(requestError.message);
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [filter, signOut, token]);

  return (
    <>
      <Notice>{error}</Notice>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">ISSUE OVERVIEW</p>
          <h1 className="page-title">Your bugs</h1>
          <p className="mt-2 text-sm text-slate-500">Keep a handle on what needs fixing.</p>
        </div>
        <Link className="button-primary inline-flex items-center justify-center gap-2" to="/bugs/new"><span>＋</span> New bug</Link>
      </div>

      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-slate-200">
        {filters.map((item) => (
          <button key={item.value} onClick={() => setFilter(item.value)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm ${filter === item.value ? 'border-emerald-700 font-semibold text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {item.label}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 pb-3 pl-2 text-xs text-slate-400 sm:block">{bugs.length} {bugs.length === 1 ? 'issue' : 'issues'}</span>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">Loading your bugs…</div>
      ) : bugs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-lg text-emerald-700">✓</span>
          <h2 className="font-display text-lg font-bold text-slate-800">{filter === 'all' ? 'Nothing on your list yet' : `No ${filters.find((item) => item.value === filter)?.label.toLowerCase()} bugs`}</h2>
          <p className="mx-auto mb-5 mt-2 max-w-sm text-sm leading-6 text-slate-500">{filter === 'all' ? 'Add the first issue and keep the details in one place.' : 'Try another status filter or add a new bug.'}</p>
          {filter === 'all' && <Link className="button-primary inline-flex" to="/bugs/new">Create your first bug</Link>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {bugs.map((bug) => (
            <Link key={bug.id} to={`/bugs/${bug.id}`} className="group flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 hover:bg-slate-50 sm:gap-4 sm:px-5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${bug.severity === 'high' ? 'bg-rose-500' : bug.severity === 'low' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-emerald-800">{bug.title}</span>
                <span className="mt-1 block truncate text-xs text-slate-400">{bug.description || 'No description added'}</span>
              </span>
              <StatusBadge status={bug.status} />
              <span className="hidden w-14 text-xs capitalize text-slate-500 sm:block">{bug.severity}</span>
              <time className="hidden text-xs text-slate-400 md:block">{formatDate(bug.createdAt)}</time>
              <span className="text-lg text-slate-300 group-hover:text-emerald-700">›</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
