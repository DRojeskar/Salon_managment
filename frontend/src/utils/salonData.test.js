import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSalonProfile } from './salonData.js';

test('normalizeSalonProfile stores name, phone, address, and timings', () => {
  const salon = normalizeSalonProfile({
    name: 'Glow Studio Jaipur',
    phone: '9876543210',
    address: 'Mansarovar, Jaipur',
    openTime: '09:00',
    closeTime: '21:00',
  });

  assert.equal(salon.name, 'Glow Studio Jaipur');
  assert.equal(salon.phone, '9876543210');
  assert.equal(salon.address, 'Mansarovar, Jaipur');
  assert.equal(salon.openTime, '09:00');
  assert.equal(salon.closeTime, '21:00');
});
