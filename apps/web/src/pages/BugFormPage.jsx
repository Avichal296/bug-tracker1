import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../app/SessionContext.jsx';
import { Notice } from '../components/Notice.jsx';
import { getBug, saveBug, uploadImage } from '../services/bugService.js';

export function BugFormPage() {
  const { bugId } = useParams();
  const isEditing = Boolean(bugId);
  const { token } = useSession();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    getBug(token, bugId)
      .then((result) => setBug(result))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [bugId, isEditing, token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);

    try {
      let imageKey = bug?.bug.imageKey || '';
      const imageFile = form.get('image');
      if (imageFile?.size) imageKey = await uploadImage(token, imageFile);

      await saveBug(token, bugId, {
        title: form.get('title'),
        description: form.get('description'),
        severity: form.get('severity'),
        status: form.get('status'),
        imageKey,
      });

      navigate('/bugs', { state: { notice: isEditing ? 'Changes saved.' : 'Bug added.' } });
    } catch (requestError) {
      setError(Object.values(requestError.fields || {})[0] || requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading bug details…</p>;

  return (
    <div className="max-w-3xl">
      <Link className="mb-7 inline-flex text-sm text-slate-500 hover:text-emerald-800" to={isEditing ? `/bugs/${bugId}` : '/bugs'}>← Back</Link>

      <div className="mb-6">
        <p className="eyebrow">{isEditing ? 'UPDATE ISSUE' : 'NEW ISSUE'}</p>
        <h1 className="page-title">{isEditing ? 'Edit bug' : 'Create a bug'}</h1>
        <p className="mt-2 text-sm text-slate-500">Add enough detail so the next person can reproduce it.</p>
      </div>

      <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7" onSubmit={handleSubmit}>
        <Notice>{error}</Notice>

        <label className="form-label">Title <span className="text-rose-600">*</span>
          <input className="form-input" name="title" defaultValue={bug?.bug.title || ''} maxLength="120" placeholder="What went wrong?" required />
        </label>

        <label className="form-label">Description
          <textarea className="form-input min-h-32 resize-y leading-6" name="description" defaultValue={bug?.bug.description || ''} maxLength="5000" placeholder="Steps to reproduce, expected result, and what happened…" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">Severity
            <select className="form-input" name="severity" defaultValue={bug?.bug.severity || 'med'}>
              <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
            </select>
          </label>
          <label className="form-label">Status
            <select className="form-input" name="status" defaultValue={bug?.bug.status || 'open'}>
              <option value="open">Open</option><option value="in-progress">In progress</option><option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <label className="form-label">Screenshot <span className="font-normal text-slate-400">Optional · JPG, PNG or WebP · up to 5 MB</span>
          <input className="form-input border-dashed bg-slate-50 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-800" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        {isEditing && bug?.imageUrl && <p className="text-xs text-slate-500">A screenshot is attached. Choose a file to replace it.</p>}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link className="button-secondary" to={isEditing ? `/bugs/${bugId}` : '/bugs'}>Cancel</Link>
          <button className="button-primary" disabled={busy}>{busy ? 'Saving…' : isEditing ? 'Save changes' : 'Create bug'}</button>
        </div>
      </form>
    </div>
  );
}
