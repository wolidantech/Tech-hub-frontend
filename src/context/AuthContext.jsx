import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requireSb, friendlyError } from '../lib/supabase';
import {
  fetchMyProfile, fetchProfiles, updateProfileRow, adminSetBanned as banRow,
  adminSetRole as roleRow, touchLastLogin, uploadAvatar, fetchSettings,
} from '../lib/store';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const BANNED_MSG = 'This account has been suspended. Contact support on WhatsApp 08159610509.';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const loadProfile = useCallback(async (authUserId) => {
    const profile = await fetchMyProfile(authUserId);
    if (!profile) {
      await requireSb().auth.signOut();
      throw new Error('Account setup is incomplete. Please contact support.');
    }
    if (profile.banned) {
      await requireSb().auth.signOut();
      throw new Error(BANNED_MSG);
    }
    setUser(profile);
    return profile;
  }, []);

  const refreshStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      setStudents(await fetchProfiles());
    } catch (err) {
      console.error('[auth] failed to load students:', err.message);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const init = async () => {
      try {
        const sb = requireSb();
        const { data } = await sb.auth.getSession();
        if (data?.session?.user && alive) {
          try {
            await loadProfile(data.session.user.id);
          } catch (err) {
            console.error('[auth] session restore failed:', err.message);
            if (alive) setUser(null);
          }
        }
      } catch (err) {
        console.error('[auth] init failed:', err.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    init();
    let sub = null;
    try {
      sub = requireSb().auth.onAuthStateChange(async (event, session) => {
        if (!alive) return;
        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            await loadProfile(session.user.id);
          }
        } catch (err) {
          console.error('[auth] state change failed:', err.message);
          setUser(null);
        }
      });
    } catch { /* unconfigured: SetupGate handles */ }
    return () => { alive = false; sub?.data?.subscription?.unsubscribe(); };
  }, [loadProfile]);

  // Load the student roster for admins (drives StudentControl, broadcasts, etc.)
  useEffect(() => {
    if (user?.role === 'admin') refreshStudents();
    else setStudents([]);
  }, [user?.role, refreshStudents]);

  const register = async ({ fullName, email, phone, password }) => {
    const settings = await fetchSettings().catch(() => null);
    if (settings && settings.allowRegistration === false) {
      throw new Error('Registration is currently closed. Please check back later.');
    }
    const sb = requireSb();
    const { data, error } = await sb.auth.signUp({
      email: String(email || '').trim(),
      password,
      options: { data: { full_name: fullName, phone: phone || '' } },
    });
    if (error) throw new Error(friendlyError(error, 'Registration failed. Please try again.'));
    // If email confirmation is ON, there is no session yet — user must confirm first.
    if (!data.session) {
      return { pendingConfirmation: true, email };
    }
    const profile = await loadProfile(data.user.id);
    touchLastLogin(profile.id);
    return profile;
  };

  const login = async (email, password) => {
    const sb = requireSb();
    const { data, error } = await sb.auth.signInWithPassword({
      email: String(email || '').trim(), password,
    });
    if (error) throw new Error(friendlyError(error, 'Login failed. Please try again.'));
    const profile = await loadProfile(data.user.id);
    touchLastLogin(profile.id);
    return profile;
  };

  const adminLogin = async (email, password) => {
    const sb = requireSb();
    const { data, error } = await sb.auth.signInWithPassword({
      email: String(email || '').trim(), password,
    });
    if (error) throw new Error(friendlyError(error, 'Login failed. Please try again.'));
    const profile = await fetchMyProfile(data.user.id);
    if (!profile || profile.role !== 'admin') {
      await sb.auth.signOut();
      throw new Error('Unauthorized: this area is for administrators only.');
    }
    if (profile.banned) {
      await sb.auth.signOut();
      throw new Error(BANNED_MSG);
    }
    setUser(profile);
    touchLastLogin(profile.id);
    return profile;
  };

  const logout = async () => {
    try { await requireSb().auth.signOut(); } catch { /* ignore */ }
    setUser(null);
    setStudents([]);
  };
  const adminLogout = () => logout();

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const patch = { ...(updates || {}) };
    if (patch.avatarFile) {
      const path = await uploadAvatar(user.id, patch.avatarFile);
      patch.avatar = path; // stored as path; rendered via public URL
      delete patch.avatarFile;
    }
    delete patch.role;
    delete patch.banned;
    delete patch.email;
    const updated = await updateProfileRow(user.id, patch);
    setUser(updated);
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) throw new Error('Not authenticated');
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters');
    const sb = requireSb();
    // Re-authenticate with the current password first
    const { error: signErr } = await sb.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (signErr) throw new Error('Current password is incorrect');
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw new Error(friendlyError(error, 'Could not change password. Please try again.'));
    return true;
  };

  // Sends a secure email link (Supabase Auth). User lands on /update-password.
  const resetPassword = async (email) => {
    const sb = requireSb();
    const redirectTo = `${window.location.origin}/update-password`;
    const { error } = await sb.auth.resetPasswordForEmail(String(email || '').trim(), { redirectTo });
    if (error) throw new Error(friendlyError(error, 'Could not send reset email. Please try again.'));
    return true;
  };

  // Called from /update-password after the user clicks the email recovery link.
  const setNewPassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters');
    const { error } = await requireSb().auth.updateUser({ password: newPassword });
    if (error) throw new Error(friendlyError(error, 'Could not set new password. The link may have expired.'));
    return true;
  };

  const setUserBanned = async (userId, banned) => {
    await banRow(userId, banned);
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, banned: !!banned } : s)));
  };

  const setUserRole = async (userId, role) => {
    await roleRow(userId, role);
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, role } : s)));
  };

  const isAdminSessionValid = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      adminLogin,
      logout,
      adminLogout,
      updateProfile,
      changePassword,
      resetPassword,
      setNewPassword,
      setUserBanned,
      setUserRole,
      students,
      studentsLoading,
      refreshStudents,
      isAdmin: user?.role === 'admin',
      isAdminSessionValid,
      adminEmail: '',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
