import { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser, clearCurrentUser, generateId } from '../lib/storage';
import { hashPassword, verifyAdminPassword, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_SESSION_KEY, createAdminSession, getAdminSession, clearAdminSession } from '../lib/security';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const saved = getCurrentUser();
      if (saved) setUser(saved);

      // Ensure secure admin account exists - wolidantech@gmail.com
      const users = getUsers();
      let needsSave = false;

      // Remove old admin if exists
      const oldAdminIndex = users.findIndex(u => u.email === 'admin@wolidantech.com');
      if (oldAdminIndex !== -1) {
        users.splice(oldAdminIndex, 1);
        needsSave = true;
      }

      // Ensure primary admin exists with hashed password (no plain text)
      const existingAdmin = users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (!existingAdmin) {
        const admin = {
          id: 'admin-secure-001',
          fullName: 'Woli Dan Admin',
          email: ADMIN_EMAIL,
          phone: '08159610509',
          // Store only hash, never plain password
          passwordHash: ADMIN_PASSWORD_HASH,
          password: undefined, // Ensure no plain password
          role: 'admin',
          createdAt: new Date().toISOString(),
          avatar: null,
          isSecureAdmin: true
        };
        users.push(admin);
        needsSave = true;
      } else {
        // Migrate existing admin to secure hash if needed
        if (!existingAdmin.passwordHash) {
          existingAdmin.passwordHash = ADMIN_PASSWORD_HASH;
          delete existingAdmin.password;
          needsSave = true;
        }
        if (existingAdmin.email !== ADMIN_EMAIL) {
          existingAdmin.email = ADMIN_EMAIL;
          needsSave = true;
        }
      }

      if (needsSave) {
        saveUsers(users);
      }

      setLoading(false);
    };
    init();
  }, []);

  const register = async ({ fullName, email, phone, password }) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const passwordHash = await hashPassword(password);
    const newUser = {
      id: generateId(),
      fullName,
      email,
      phone,
      passwordHash, // Store only hash
      role: 'student',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatar: null,
      onboarded: false
    };
    saveUsers([...users, newUser]);
    const sessionUser = { ...newUser, passwordHash: undefined };
    setUser(newUser);
    setCurrentUser(newUser);
    return newUser;
  };

  const login = async (email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('Invalid email or password');
    if (found.banned) throw new Error('This account has been suspended. Contact support on WhatsApp 08159610509.');

    // Admin must use secure admin login route
    if (found.role === 'admin' && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const isValid = await verifyAdminPassword(password);
      if (!isValid) throw new Error('Invalid email or password');
      // Create secure admin session
      createAdminSession();
      setUser(found);
      setCurrentUser(found);
      return found;
    }

    // For students - verify hash
    try {
      const inputHash = await hashPassword(password);
      // Check both hashed and legacy plain for migration
      const isValid = found.passwordHash ? (inputHash === found.passwordHash || password === found.password) : (found.password === password);
      if (!isValid) throw new Error('Invalid email or password');
      
      // Migrate to hash if needed
      if (!found.passwordHash) {
        found.passwordHash = inputHash;
        delete found.password;
        saveUsers(users);
      }
    } catch {
      // Fallback for legacy users
      if (found.password !== password && found.passwordHash !== password) {
        throw new Error('Invalid email or password');
      }
    }

    found.lastLoginAt = new Date().toISOString();
    saveUsers(users);
    setUser({ ...found });
    setCurrentUser({ ...found });
    return found;
  };

  // Password reset (local-mode: verify email + phone ownership).
  // Production: Supabase Auth sends a secure email link instead.
  const resetPassword = async (email, phone, newPassword) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) throw new Error('No account found with this email');
    const u = users[idx];
    if (u.role === 'admin') throw new Error('Admin password can only be changed from the admin dashboard');
    if (String(u.phone || '').replace(/\D/g, '').slice(-10) !== String(phone || '').replace(/\D/g, '').slice(-10)) {
      throw new Error('Phone number does not match our records');
    }
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters');
    const passwordHash = await hashPassword(newPassword);
    users[idx] = { ...u, passwordHash, password: undefined };
    saveUsers(users);
    return true;
  };

  const setUserBanned = (userId, banned) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;
    users[idx] = { ...users[idx], banned };
    saveUsers(users);
  };

  // Dedicated secure admin login
  const adminLogin = async (email, password) => {
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Unauthorized: Invalid admin credentials');
    }

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      throw new Error('Invalid admin email or password');
    }

    const users = getUsers();
    let admin = users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    
    if (!admin) {
      admin = {
        id: 'admin-secure-001',
        fullName: 'Woli Dan Admin',
        email: ADMIN_EMAIL,
        phone: '08159610509',
        passwordHash: ADMIN_PASSWORD_HASH,
        role: 'admin',
        createdAt: new Date().toISOString(),
        avatar: null
      };
      saveUsers([...users, admin]);
    }

    createAdminSession();
    setUser(admin);
    setCurrentUser(admin);
    return admin;
  };

  const logout = () => {
    setUser(null);
    clearCurrentUser();
    clearAdminSession();
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const adminLogout = () => {
    logout();
  };

  const updateProfile = (updates) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    const updated = { ...users[idx], ...updates };
    // Never allow updating to expose password
    if (updated.password) delete updated.password;
    users[idx] = updated;
    saveUsers(users);
    setUser(updated);
    setCurrentUser(updated);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) throw new Error('Not authenticated');
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) throw new Error('User not found');

    const currentUser = users[idx];
    
    // Verify current password
    if (currentUser.role === 'admin') {
      const isValid = await verifyAdminPassword(currentPassword);
      if (!isValid) throw new Error('Current password is incorrect');
    } else {
      const currentHash = await hashPassword(currentPassword);
      const isValid = currentUser.passwordHash === currentHash || currentUser.password === currentPassword;
      if (!isValid) throw new Error('Current password is incorrect');
    }

    const newHash = await hashPassword(newPassword);
    users[idx] = {
      ...currentUser,
      passwordHash: newHash,
      password: undefined
    };
    saveUsers(users);
    
    const updated = users[idx];
    setUser(updated);
    setCurrentUser(updated);
    return true;
  };

  const isAdminSessionValid = () => {
    const session = getAdminSession();
    return !!session;
  };

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
      setUserBanned,
      isAdmin: user?.role === 'admin',
      isAdminSessionValid,
      adminEmail: ADMIN_EMAIL
    }}>
      {children}
    </AuthContext.Provider>
  );
};
