// @vitest-environment jsdom
// The JAMB pass is a paid entitlement resolved from real data:
// a PUBLISHED `exam_access` bundle + an APPROVED payment on it.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  store: { fetchBundles: vi.fn(), fetchMyPayments: vi.fn() },
}));
vi.mock('../lib/store', () => mocks.store);

import { useJambAccess } from '../lib/useJambAccess';

const PASS = { id: 'bundle-jamb', title: 'JAMB CBT pass', price: 5000, kind: 'exam_access', isPublished: true };
const USER = { id: 'student-1' };

function Probe({ user }) {
  const { state, entitled, product, payment } = useJambAccess(user);
  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="entitled">{String(entitled)}</span>
      <span data-testid="product">{product ? product.title : 'none'}</span>
      <span data-testid="payment">{payment ? payment.status : 'none'}</span>
    </div>
  );
}

const renderGate = async (user = USER) => {
  const view = render(<Probe user={user} />);
  await waitFor(() => expect(view.getByTestId('state').textContent).not.toBe('loading'));
  return view;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.store.fetchMyPayments.mockResolvedValue([]);
});

describe('JAMB paid gate', () => {
  it('grants access on an approved payment for the published pass', async () => {
    mocks.store.fetchBundles.mockResolvedValue([PASS, { id: 'b-course', title: 'Course bundle', kind: 'courses', isPublished: true }]);
    mocks.store.fetchMyPayments.mockResolvedValue([{ id: 'p1', bundleId: 'bundle-jamb', status: 'approved' }]);
    const view = await renderGate();
    expect(view.getByTestId('state').textContent).toBe('granted');
    expect(view.getByTestId('entitled').textContent).toBe('true');
    expect(view.getByTestId('product').textContent).toBe('JAMB CBT pass');
  });

  it('reports a payment that is still awaiting admin approval', async () => {
    mocks.store.fetchBundles.mockResolvedValue([PASS]);
    mocks.store.fetchMyPayments.mockResolvedValue([{ id: 'p1', bundleId: 'bundle-jamb', status: 'pending' }]);
    const view = await renderGate();
    expect(view.getByTestId('state').textContent).toBe('pending');
    expect(view.getByTestId('entitled').textContent).toBe('false');
    expect(view.getByTestId('payment').textContent).toBe('pending');
  });

  it('locks the area when the pass is published but unpaid', async () => {
    mocks.store.fetchBundles.mockResolvedValue([PASS]);
    mocks.store.fetchMyPayments.mockResolvedValue([]);
    const view = await renderGate();
    expect(view.getByTestId('state').textContent).toBe('locked');
  });

  it('never offers an UNPUBLISHED pass for sale', async () => {
    // The seeded pass stays unpublished until its price and content are reviewed;
    // selling it early would contradict that, so the page says "not on sale yet".
    mocks.store.fetchBundles.mockResolvedValue([{ ...PASS, isPublished: false }]);
    const view = await renderGate();
    expect(view.getByTestId('state').textContent).toBe('no-product');
    expect(view.getByTestId('product').textContent).toBe('none');
  });

  it('ignores a rejected payment and payments for other products', async () => {
    mocks.store.fetchBundles.mockResolvedValue([PASS]);
    mocks.store.fetchMyPayments.mockResolvedValue([
      { id: 'p1', bundleId: 'bundle-jamb', status: 'rejected' },
      { id: 'p2', bundleId: 'bundle-other', status: 'approved' },
    ]);
    const view = await renderGate();
    expect(view.getByTestId('state').textContent).toBe('locked');
  });

  it('does not claim entitlement for a signed-out visitor', async () => {
    const view = await renderGate(null);
    expect(view.getByTestId('state').textContent).toBe('locked');
    expect(mocks.store.fetchBundles).not.toHaveBeenCalled();
  });

  it('surfaces a failure instead of silently unlocking', async () => {
    mocks.store.fetchBundles.mockRejectedValue(new Error('Cannot reach the course server.'));
    const view = await renderGate();
    expect(view.getByTestId('state').textContent).toBe('error');
    expect(view.getByTestId('entitled').textContent).toBe('false');
  });
});
