import { useCallback, useEffect, useState } from 'react';
import { fetchBundles, fetchMyPayments } from './store';

/**
 * Access to the JAMB CBT area is a PAID entitlement, separate from course
 * enrolment: it is an approved payment against a published `exam_access` bundle
 * (migration 011 adds `bundles.kind`). That reuses the existing bank-transfer +
 * admin-approval flow, so there is exactly one payment path and no second
 * entitlement table to drift out of sync.
 *
 * state: 'loading' | 'granted' | 'pending' | 'no-product' | 'locked' | 'error'
 *   granted    – an approved payment exists
 *   pending    – a payment is waiting for admin approval
 *   no-product – no exam-access product has been published yet
 *   locked     – product exists, no payment yet  → show the paywall
 */
export function useJambAccess(user) {
  const [state, setState] = useState('loading');
  const [product, setProduct] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) { setState('locked'); return; }
    try {
      const [bundles, payments] = await Promise.all([fetchBundles(), fetchMyPayments(user.id)]);
      const examProducts = (bundles || []).filter((b) => b.kind === 'exam_access');
      // Only a PUBLISHED pass can be bought: the seeded one stays unpublished
      // until its price and content are reviewed, and selling it early would
      // contradict that. The server re-checks entitlement anyway.
      const published = examProducts.find((b) => b.isPublished) || null;
      setProduct(published);
      const mine = (payments || []).filter((p) => published && p.bundleId === published.id);
      const approved = mine.find((p) => p.status === 'approved');
      const pending = mine.find((p) => p.status === 'pending');
      setPayment(approved || pending || null);
      if (!published) setState('no-product');   // includes "exists but unpublished"
      else if (approved) setState('granted');
      else if (pending) setState('pending');
      else setState('locked');
      setError('');
    } catch (err) {
      setState('error');
      setError(err?.message || 'Could not check your JAMB access.');
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return {
    state,
    product,
    payment,
    error,
    entitled: state === 'granted',
    reload: load,
  };
}
