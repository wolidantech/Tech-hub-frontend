import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMyIdCard, issueIdCardRpc } from './store';

/**
 * Student ID card state machine.
 *
 * The card is ISSUED BY THE DATABASE (`issue_student_id_card()`, migration 011):
 * it needs a profile photo, allocates the number server-side and is idempotent.
 * This hook therefore only reads what exists and asks the server to mint one —
 * the browser never invents a card number.
 *
 * status: 'loading' | 'ready' (card issued) | 'need-photo' | 'unissued' | 'error'
 */
export function useStudentIdCard(user) {
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [issuing, setIssuing] = useState(false);
  // Uploading the photo and issuing the card happen back to back, and saving the
  // photo re-triggers `load()`. A read that lands before the insert commits must
  // not wipe the card the server has just issued, so an issued card is kept until
  // a read actually returns a row.
  const issuedRef = useRef(false);

  const load = useCallback(async () => {
    if (!user?.id) { setStatus('unissued'); return; }
    try {
      const row = await fetchMyIdCard(user.id);
      if (!row && issuedRef.current) return;
      if (row) issuedRef.current = false;
      setCard(row);
      if (row && row.status === 'active') setStatus('ready');
      else if (user.avatar) setStatus('unissued');   // photo present, card not minted yet
      else setStatus('need-photo');
      setError('');
    } catch (err) {
      if (issuedRef.current) return;
      setCard(null);
      setStatus('error');
      setError(err?.message || 'Could not load your ID card.');
    }
  }, [user?.id, user?.avatar]);

  useEffect(() => { load(); }, [load]);

  /** Ask the backend to issue (or re-issue) the card. Requires a profile photo. */
  const issue = useCallback(async () => {
    setIssuing(true);
    setError('');
    try {
      const issued = await issueIdCardRpc();
      issuedRef.current = !!issued;
      setCard(issued ? { ...issued, revokedAt: null } : null);
      setStatus(issued ? 'ready' : 'error');
      if (!issued) setError('The server did not return a card. Please try again.');
      return issued;
    } catch (err) {
      const msg = err?.message || 'Could not issue your ID card.';
      setError(msg);
      // The database says so when the photo is missing — surface it as the CTA.
      setStatus(/photo/i.test(msg) ? 'need-photo' : 'error');
      return null;
    } finally {
      setIssuing(false);
    }
  }, []);

  return { card, status, error, issuing, issue, reload: load };
}
