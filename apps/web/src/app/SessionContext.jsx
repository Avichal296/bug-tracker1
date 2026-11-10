import { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('bug-user') || 'null');
  } catch {
    return null;
  }
}

export function SessionProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bug-token') || '');
  const [user, setUser] = useState(readUser);

  const value = useMemo(() => ({
    token,
    user,
    signIn(session) {
      localStorage.setItem('bug-token', session.token);
      localStorage.setItem('bug-user', JSON.stringify(session.user));
      setToken(session.token);
      setUser(session.user);
    },
    signOut() {
      localStorage.removeItem('bug-token');
      localStorage.removeItem('bug-user');
      setToken('');
      setUser(null);
    },
  }), [token, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
