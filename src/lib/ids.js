// Pure client-side ID helpers. Database rows use server-generated UUIDs;
// certificate IDs, verification codes and payment references are generated
// server-side — never mint them in the browser.
export const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

export const generateCouponCode = (prefix = 'WOLI') =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
