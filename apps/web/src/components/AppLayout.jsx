import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../app/SessionContext.jsx';

export function AppLayout() {
  const { user, signOut } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="flex w-full flex-col border-b border-slate-200 bg-white px-5 py-4 md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r md:px-6 md:py-7">
        <Link to="/bugs" className="flex items-center gap-3 font-display text-lg font-extrabold tracking-tight text-slate-800">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">B</span>
          <span>Bug Tracker <span className="font-semibold text-slate-400">Lite</span></span>
        </Link>

        <p className="mb-3 mt-10 hidden text-[11px] font-bold tracking-[0.14em] text-slate-400 md:block">WORKSPACE</p>
        <NavLink to="/bugs" className={({ isActive }) => `hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold md:flex ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'}`}>
          <span aria-hidden="true">▦</span> All bugs
        </NavLink>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 md:mt-auto">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-700">{user?.name}</span>
            <span className="block truncate text-xs text-slate-400">{user?.email}</span>
          </span>
          <button className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={signOut} title="Sign out">↗</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 md:ml-64">
        <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-10 text-sm md:flex">
          <p className="text-slate-400">Workspace <span className="mx-2 text-slate-300">/</span> Issues</p>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">{user?.name?.[0]?.toUpperCase()}</span>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
