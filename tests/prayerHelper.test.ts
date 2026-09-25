import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrayerName } from '../src/utils/prayerHelper';

test('getPrayerName - Friday (Jumat) dhuhr returns Jum\'at', () => {
  // 2026-09-25 is a Friday (day index 5)
  const friday = new Date(2026, 8, 25, 12, 0, 0);
  assert.equal(friday.getDay(), 5, 'Sanity check: date must be Friday');

  // Both id and en should return "Jum'at"
  assert.equal(getPrayerName('dhuhr', 'id', friday), "Jum'at");
  assert.equal(getPrayerName('dhuhr', 'en', friday), "Jum'at");
  assert.equal(getPrayerName('Dhuhr', 'id', friday), "Jum'at");
  assert.equal(getPrayerName('DHUHR', 'en', friday), "Jum'at");
});

test('getPrayerName - Non-Friday dhuhr returns Dzuhur (id) / Dhuhr (en)', () => {
  // 2026-09-24 is Thursday (day index 4)
  const thursday = new Date(2026, 8, 24, 12, 0, 0);
  assert.equal(thursday.getDay(), 4, 'Sanity check: date must be Thursday');

  assert.equal(getPrayerName('dhuhr', 'id', thursday), 'Dzuhur');
  assert.equal(getPrayerName('dhuhr', 'en', thursday), 'Dhuhr');

  // 2026-09-26 is Saturday (day index 6)
  const saturday = new Date(2026, 8, 26, 12, 0, 0);
  assert.equal(saturday.getDay(), 6, 'Sanity check: date must be Saturday');

  assert.equal(getPrayerName('dhuhr', 'id', saturday), 'Dzuhur');
  assert.equal(getPrayerName('dhuhr', 'en', saturday), 'Dhuhr');
});

test('getPrayerName - Other prayers remain unchanged on Friday', () => {
  const friday = new Date(2026, 8, 25, 12, 0, 0);

  assert.equal(getPrayerName('fajr', 'id', friday), 'Subuh');
  assert.equal(getPrayerName('fajr', 'en', friday), 'Fajr');
  assert.equal(getPrayerName('sunrise', 'id', friday), 'Terbit');
  assert.equal(getPrayerName('sunrise', 'en', friday), 'Sunrise');
  assert.equal(getPrayerName('asr', 'id', friday), 'Ashar');
  assert.equal(getPrayerName('asr', 'en', friday), 'Asr');
  assert.equal(getPrayerName('maghrib', 'id', friday), 'Maghrib');
  assert.equal(getPrayerName('maghrib', 'en', friday), 'Maghrib');
  assert.equal(getPrayerName('isha', 'id', friday), 'Isya');
  assert.equal(getPrayerName('isha', 'en', friday), 'Isha');
});

test('getPrayerName - Accepts number and string timestamps', () => {
  const friday = new Date(2026, 8, 25, 12, 0, 0);
  assert.equal(getPrayerName('dhuhr', 'id', friday.getTime()), "Jum'at");
  assert.equal(getPrayerName('dhuhr', 'id', friday.toISOString()), "Jum'at");

  const thursday = new Date(2026, 8, 24, 12, 0, 0);
  assert.equal(getPrayerName('dhuhr', 'id', thursday.getTime()), 'Dzuhur');
  assert.equal(getPrayerName('dhuhr', 'id', thursday.toISOString()), 'Dzuhur');
});
