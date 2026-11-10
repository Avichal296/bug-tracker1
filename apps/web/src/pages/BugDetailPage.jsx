import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../app/SessionContext.jsx';
import { Notice } from '../components/Notice.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { getBug, removeBug } from '../services/bugService.js';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function BugDetailPage() {
  const { bugId } = useParams();
  const { token } = useSession();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getBug(token, bugId)
      .then(setResult)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [bugId, token]);

  async function handleDelete() {
    if (!window.confirm('Delete this bug and its attached image? This cannot be undone.')) return;

    setBusy(true);
    try {
      await removeBug(token, bugId);
      navigate('/bugs', { state: { notice: 'Bug deleted.' } });
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading bug details…</p>;
  if (!result) {
    return (
      <div className="space-y-4">
        <Notice>{error}</Notice>
        <Link className="text-sm text-emerald-800" to="/bugs">← Back to issues</Link>
      </div>
    );
  }

  const { bug, imageUrl } = result;

  return (
    <div className="max-w-4xl">
      <Link className="mb-7 inline-flex text-sm text-slate-500 hover:text-emerald-800" to="/bugs">← Back to issues</Link>
      <Notice>{error}</Notice>

      <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={bug.status} />
            <span className="text-sm capitalize text-slate-500">{bug.severity} severity</span>
          </div>
          <div className="flex gap-2">
            <Link className="button-secondary" to={`/bugs/${bug.id}/edit`}>Edit</Link>
            <button className="button-danger" onClick={handleDelete} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>

        <h1 className="page-title">{bug.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Created {formatDate(bug.createdAt)}</p>
        <div className="mt-7 whitespace-pre-wrap border-t border-slate-100 pt-6 text-sm leading-7 text-slate-600">
          {bug.description || 'No description was added.'}
        </div>
        {imageUrl && <img className="mt-7 max-h-[34rem] max-w-full rounded-lg border border-slate-200 object-contain" src={imageUrl} alt="Bug screenshot" />}
      </article>
    </div>
  );
}
