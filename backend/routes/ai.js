import express from 'express';
import {
  answerChat,
  generateCampaignSummary,
  generateMarketingDashboard,
  generatePersonalizedOffer,
  getAiSummary,
} from '../services/aiService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createItem, getCollection } from '../db.js';

const router = express.Router();

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    const [services, slots, bookings, appointments, staff] = await Promise.all([
      getCollection('services'), getCollection('slots'), getCollection('bookings'), getCollection('appointments'), getCollection('staff'),
    ]);
    const result = answerChat({ message, role: req.user?.role, user: req.user, services, slots, bookings, appointments, staff });
    if (result.booking && req.user?.role === 'customer') {
      result.booking = await createItem('bookings', result.booking);
      result.reply = `${result.booking.service} ka booking successfully create ho gaya: ${result.booking.date}. Status Pending hai.`;
      result.intent = 'booking-created';
    }
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Chat failed' });
  }
});

router.post('/recommendation', (req, res) => {
  try {
    const payload = req.body || {};
    const result = getAiSummary({
      faceShape: payload.faceShape,
      skinTone: payload.skinTone,
      service: payload.service,
      bookings: payload.bookings || [],
      appointments: payload.appointments || [],
      services: payload.services || [],
      staff: payload.staff || [],
      slots: payload.slots || [],
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI recommendation failed' });
  }
});

router.post('/offer', (req, res) => {
  try {
    const { customerName, daysSinceVisit, preferredService } = req.body || {};
    const result = generatePersonalizedOffer({
      customerName,
      daysSinceVisit,
      preferredService,
    });

    res.json({ success: true, offer: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI offer generation failed' });
  }
});

router.post('/marketing-dashboard', (req, res) => {
  try {
    const payload = req.body || {};
    const result = generateMarketingDashboard({
      bookings: payload.bookings || [],
      customers: payload.customers || [],
      trend: payload.trend || 'upward',
    });

    res.json({ success: true, dashboard: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Marketing dashboard generation failed' });
  }
});

router.post('/campaigns', (req, res) => {
  try {
    const payload = req.body || {};
    const result = generateCampaignSummary({
      churnedCustomers: payload.churnedCustomers || [],
      birthdayCustomers: payload.birthdayCustomers || [],
      theme: payload.theme || 'Diwali Offer Poster',
    });

    res.json({ success: true, campaigns: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Campaign generation failed' });
  }
});

router.post('/send-whatsapp', (req, res) => {
  try {
    const { message, to } = req.body || {};
    if (!message || !to) {
      return res.status(400).json({ success: false, message: 'WhatsApp message and recipient are required' });
    }

    const payload = {
      success: true,
      channel: 'Twilio WhatsApp',
      to,
      message,
      status: 'Queued for delivery',
      note: 'Connect this endpoint to Twilio Messaging API for live sending.',
    };

    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'WhatsApp send failed' });
  }
});

export default router;
