import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateStyleRecommendation,
  generateOwnerInsights,
  generatePersonalizedOffer,
  generateMarketingDashboard,
  generateCampaignSummary,
  generatePosterForTheme,
} from '../services/aiService.js';

test('style recommendation includes hairstyle and color', () => {
  const result = generateStyleRecommendation({
    faceShape: 'oval',
    skinTone: 'warm',
    service: 'layer cut',
  });

  assert.equal(typeof result.hairstyle, 'string');
  assert.equal(typeof result.color, 'string');
  assert.match(result.hairstyle, /layer|bob|pixie|blunt/i);
  assert.match(result.color, /brown|gold|ash|copper|honey/i);
});

test('owner insights produce actionable salon recommendations', () => {
  const result = generateOwnerInsights({
    bookings: [
      { client: 'A', status: 'Pending', date: '2026-09-15' },
      { client: 'B', status: 'Pending', date: '2026-09-15' },
      { client: 'C', status: 'Completed', date: '2026-09-14' },
    ],
    appointments: [
      { service: 'Haircut', staff: 'Sameer', status: 'Pending' },
      { service: 'Haircut', staff: 'Sameer', status: 'Pending' },
      { service: 'Color', staff: 'Aisha', status: 'Completed' },
    ],
    services: [
      { title: 'Haircut', price: 1200 },
      { title: 'Color', price: 1800 },
      { title: 'Keratin', price: 2500 },
    ],
    staff: [
      { name: 'Sameer', status: 'Available' },
      { name: 'Aisha', status: 'Busy' },
    ],
    slots: [
      { day: 'Saturday', time: '17:00', status: 'Open' },
      { day: 'Saturday', time: '18:00', status: 'Open' },
    ],
  });

  assert.ok(result.noShowRisk.length >= 1);
  assert.ok(result.rushHours.length >= 1);
  assert.ok(result.inventoryAlerts.length >= 1);
  assert.ok(result.dynamicPricing.length >= 1);
});

test('personalized offer includes customer name and discount', () => {
  const result = generatePersonalizedOffer({
    customerName: 'Deepesh',
    daysSinceVisit: 45,
    preferredService: 'Hair color',
  });

  assert.match(result.subject, /Deepesh|hair/i);
  assert.ok(result.discount.includes('20%'));
  assert.match(result.message, /Deepesh/i);
});

test('marketing dashboard summarizes profit and top service', () => {
  const result = generateMarketingDashboard({
    bookings: [
      { service: 'Haircut', amount: 1200 },
      { service: 'Haircut', amount: 1350 },
      { service: 'Color', amount: 2800 },
      { service: 'Color', amount: 2600 },
      { service: 'Facial', amount: 1800 },
    ],
    customers: [
      { name: 'Aman', totalSpend: 12000 },
      { name: 'Riya', totalSpend: 18000 },
      { name: 'Aman', totalSpend: 2000 },
    ],
    trend: 'upward',
  });

  assert.ok(result.profitPrediction.includes('₹') || result.profitPrediction.includes('Rs'));
  assert.match(result.topService, /Haircut|Color|Facial/i);
  assert.match(result.loyalCustomer, /Aman|Riya/i);
  assert.match(result.instagramCaption, /Glow|salon|hair|style/i);
});

test('campaign summary and poster generator produce ready-to-send marketing assets', () => {
  const campaign = generateCampaignSummary({
    churnedCustomers: Array.from({ length: 12 }, (_, index) => ({ name: `Customer ${index + 1}` })),
    birthdayCustomers: Array.from({ length: 3 }, (_, index) => ({ name: `Birthday ${index + 1}` })),
    theme: 'Diwali Offer Poster',
  });

  assert.equal(campaign.churned.count, 12);
  assert.equal(campaign.birthday.count, 3);
  assert.match(campaign.poster.title, /Diwali|Offer|Poster/i);
  assert.match(campaign.poster.caption, /Diwali|Glow|20%/i);
});
