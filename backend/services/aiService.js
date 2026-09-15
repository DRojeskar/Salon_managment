const FACE_SHAPES = {
  oval: {
    hairstyle: 'Layered cut with soft face-framing movement',
    color: 'Warm brown with honey highlights',
  },
  round: {
    hairstyle: 'Long layered lob to add length and definition',
    color: 'Chocolate brown with caramel balayage',
  },
  square: {
    hairstyle: 'Soft curls with side-swept bangs',
    color: 'Ash brown gloss with subtle warm undertones',
  },
  heart: {
    hairstyle: 'Pixie or shoulder-length feathered cut',
    color: 'Copper brown with golden lowlights',
  },
  diamond: {
    hairstyle: 'Wispy fringe with textured layers',
    color: 'Deep espresso with luminous brown highlights',
  },
  oblong: {
    hairstyle: 'Chin-length layers with soft side volume',
    color: 'Chestnut brown with face-framing highlights',
  },
  rectangle: {
    hairstyle: 'Soft waves with rounded layers and side fringe',
    color: 'Mocha brown with subtle caramel gloss',
  },
  triangle: {
    hairstyle: 'Layered bob with crown volume and wispy fringe',
    color: 'Warm chocolate with golden dimension',
  },
  pear: {
    hairstyle: 'Textured shoulder-length cut with volume at the crown',
    color: 'Rich brown with honey face-framing pieces',
  },
  invertedTriangle: {
    hairstyle: 'Collarbone layers with soft curtain bangs',
    color: 'Copper brown with balanced lowlights',
  },
  asymmetrical: {
    hairstyle: 'Modern asymmetrical cut tailored to your stronger side',
    color: 'Glossy espresso with a bright accent streak',
  },
};

const SKIN_TONES = {
  warm: 'Golden brown with honey undertones',
  cool: 'Ash brown with cool-toned beige highlights',
  neutral: 'Balanced brown with soft caramel dimension',
  fair: 'Soft beige with champagne highlights',
  light: 'Light beige with warm honey dimension',
  medium: 'Balanced tan with caramel highlights',
  tan: 'Warm tan with bronze golden gloss',
  deep: 'Deep brown with rich copper dimension',
  dark: 'Deep espresso with luminous warm highlights',
};

export function generateStyleRecommendation({ faceShape = 'oval', skinTone = 'warm', service = 'layer cut' } = {}) {
  const faceProfile = FACE_SHAPES[faceShape] || FACE_SHAPES.oval;
  const tone = SKIN_TONES[skinTone] || SKIN_TONES.warm;
  const serviceLabel = String(service || 'layer cut').toLowerCase();

  let hairstyle = faceProfile.hairstyle;
  if (serviceLabel.includes('bob')) {
    hairstyle = 'Classic bob with soft face-framing layers';
  } else if (serviceLabel.includes('pixie')) {
    hairstyle = 'Textured pixie cut with volume at the crown';
  } else if (serviceLabel.includes('blunt')) {
    hairstyle = 'Blunt cut with a clean fringe';
  }

  const color = tone.includes('gold') || tone.includes('honey') ? 'Honey brown with soft golden balayage' :
    tone.includes('cool') || tone.includes('ash') ? 'Ash brown with cool beige gloss' :
    'Warm brown with caramel highlights';

  return {
    hairstyle,
    color,
    fit: `${hairstyle} and ${color} suit your ${faceShape || 'oval'} face shape and ${skinTone || 'warm'} skin tone best.`,
    confidence: 'High',
  };
}

function pickMostLikelyNoShow(bookings = [], services = []) {
  const serviceCounts = new Map();
  for (const item of bookings) {
    const key = item.service || 'General';
    serviceCounts.set(key, (serviceCounts.get(key) || 0) + 1);
  }

  const topService = [...serviceCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const serviceName = topService ? topService[0] : 'Haircut';
  const avgPrice = services.reduce((total, service) => total + (Number(service.price) || 0), 0) / Math.max(services.length, 1);

  return {
    label: `Customer follow-up needed for ${serviceName}`,
    reason: `Based on booking patterns and cancellations, high-risk customers should get a reminder call before ${serviceName} appointments.`,
    action: `Send reminder SMS + confirm call when the service is above ₹${Math.round(avgPrice || 1500)}.`,
  };
}

export function generateOwnerInsights({ bookings = [], appointments = [], services = [], staff = [], slots = [] } = {}) {
  const pendingAppointments = appointments.filter((item) => String(item.status || '').toLowerCase() === 'pending').length;
  const peakDays = slots
    .filter((slot) => slot && slot.status === 'Open')
    .map((slot) => slot.day)
    .filter(Boolean);

  const staffLoad = staff.map((member) => ({
    name: member.name || 'Staff',
    load: (appointments.filter((entry) => entry.staff === member.name).length || 0) + (pendingAppointments > 0 ? 1 : 0),
  }));

  const busiestStaff = staffLoad.sort((a, b) => b.load - a.load)[0];

  const inventoryAlerts = [
    {
      item: 'Keratin treatment product',
      message: 'Stock level is likely to run out next week based on current service demand.',
      action: 'Place replenishment order before Friday.',
    },
    {
      item: 'Hair color kit',
      message: 'Color bookings are trending up across the week.',
      action: 'Prepare extra developer and toner stock.',
    },
  ];

  const dynamicPricing = [
    {
      type: 'Weekend surge',
      suggestion: 'Increase pricing by 10-15% on Saturday evening appointments.',
    },
    {
      type: 'Slow-day offer',
      suggestion: 'Offer 8-12% discount on weekday mornings to fill idle slots.',
    },
  ];

  return {
    noShowRisk: [pickMostLikelyNoShow(bookings, services)],
    rushHours: [
      {
        label: 'Saturday evening rush',
        message: `Current open slots suggest the salon may hit a busy period on ${peakDays[0] || 'Saturday'} between 5 PM and 8 PM.`,
        action: 'Add one extra stylist during the peak hours.',
      },
      {
        label: 'Staff capacity alert',
        message: busiestStaff ? `${busiestStaff.name} is handling the heaviest queue and may need support.` : 'Queue volume is rising, monitor staff distribution.',
        action: 'Shift one assistant or reschedule low-priority appointments.',
      },
    ],
    inventoryAlerts,
    dynamicPricing,
  };
}

export function generatePersonalizedOffer({ customerName = 'Customer', daysSinceVisit = 30, preferredService = 'Haircut' } = {}) {
  const discount = daysSinceVisit >= 45 ? '20% OFF' : '10% OFF';
  const subject = `${customerName}, your ${preferredService.toLowerCase()} glow-up is waiting`;
  const message = `${customerName}, aapke style ko refresh karne ka perfect time hai. ${discount} ka offer aaj hi apply hai for ${preferredService.toLowerCase()} services.`;

  return {
    subject,
    discount,
    message,
    channel: 'SMS + Email',
  };
}

export function generateMarketingDashboard({ bookings = [], customers = [], trend = 'upward' } = {}) {
  const serviceTotals = new Map();
  for (const booking of bookings) {
    const service = booking.service || 'General';
    const amount = Number(booking.amount || 0);
    serviceTotals.set(service, (serviceTotals.get(service) || 0) + amount);
  }

  const topService = [...serviceTotals.entries()].sort((a, b) => b[1] - a[1])[0];
  const totalRevenue = bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
  const projectedRevenue = Math.round(totalRevenue * (trend === 'upward' ? 1.22 : 0.96));

  const customerMap = new Map();
  for (const customer of customers) {
    const name = customer.name || 'Customer';
    const spend = Number(customer.totalSpend || 0);
    customerMap.set(name, (customerMap.get(name) || 0) + spend);
  }

  const loyalCustomer = [...customerMap.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    profitPrediction: `Projected monthly profit: ₹${projectedRevenue.toLocaleString('en-IN')} (${trend === 'upward' ? 'strong growth' : 'steady momentum'})`,
    topService: topService ? `${topService[0]} with ₹${topService[1].toLocaleString('en-IN')} revenue` : 'No data yet',
    loyalCustomer: loyalCustomer ? `${loyalCustomer[0]} with ₹${loyalCustomer[1].toLocaleString('en-IN')} lifetime spend` : 'No repeat customer yet',
    instagramCaption: 'Glow with a fresh cut, richer shine, and salon confidence that turns every selfie into a statement. ✨ Book your next beauty reset today!',
  };
}

export function generateCampaignSummary({ churnedCustomers = [], birthdayCustomers = [], theme = 'Diwali Offer Poster' } = {}) {
  const churned = {
    count: churnedCustomers.length,
    label: 'Churned Customers (45 days se nahi aaye)',
    buttonText: 'Send 20% OFF Campaign',
    message: 'Hi {{name}}, it has been a while since your last salon visit. Your glow-up is waiting — enjoy 20% OFF on your next service. Book today!',
  };

  const birthday = {
    count: birthdayCustomers.length,
    label: 'Birthday This Week',
    buttonText: 'Send Auto Wish',
    message: 'Happy Birthday {{name}}! Glow Studio wishes you a beautiful celebration. Your special salon treat is waiting for you this week.',
  };

  const poster = generatePosterForTheme(theme);

  return {
    churned,
    birthday,
    poster,
  };
}

export function generatePosterForTheme(theme = 'Diwali Offer Poster') {
  const title = theme.includes('Diwali') ? 'Diwali Glow Offer' : theme;
  const caption = 'Diwali glow hai, salon ka shine bhi! ✨ Get 20% OFF on stylish hair cuts, colors, and festive grooming this week.';
  const cta = 'Book before the festival rush ends.';

  return {
    title,
    caption,
    cta,
    posterText: `${title}\n${caption}\n${cta}`,
  };
}

export function getAiSummary({ faceShape, skinTone, service, bookings, appointments, services, staff, slots } = {}) {
  return {
    styleRecommendation: generateStyleRecommendation({ faceShape, skinTone, service }),
    ownerInsights: generateOwnerInsights({ bookings, appointments, services, staff, slots }),
  };
}

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function findServiceInMessage(message, services = []) {
  const normalizedMessage = normalizeText(message);
  const compactMessage = normalizedMessage.replace(/[\s-]/g, '');
  return services.find((service) => {
    const normalizedTitle = normalizeText(service.title);
    return normalizedMessage.includes(normalizedTitle) || compactMessage.includes(normalizedTitle.replace(/[\s-]/g, ''));
  }) || null;
}

function parseBookingDate(message, now = new Date()) {
  const normalizedMessage = normalizeText(message);
  const dateMatch = normalizedMessage.match(/\b(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\b/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
  }

  const result = new Date(now);
  if (normalizedMessage.includes('day after tomorrow')) result.setDate(result.getDate() + 2);
  else if (normalizedMessage.includes('tomorrow') || normalizedMessage.includes('kal')) result.setDate(result.getDate() + 1);
  else if (normalizedMessage.includes('today') || normalizedMessage.includes('aaj')) return result.toISOString().slice(0, 10);
  else return null;
  return result.toISOString().slice(0, 10);
}

function parseBookingTime(message) {
  const normalizedMessage = normalizeText(message);
  const timeMatch = normalizedMessage.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?m\.?|p\.?m\.?)?\b/);
  if (!timeMatch) return null;

  let hour = Number(timeMatch[1]);
  const minute = timeMatch[2] || '00';
  const meridiem = (timeMatch[3] || '').replace(/\./g, '');
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (hour > 23 || Number(minute) > 59) return null;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function answerFaq(message, services = [], slots = []) {
  const normalizedMessage = normalizeText(message);
  const service = findServiceInMessage(normalizedMessage, services);
  if (normalizedMessage.includes('feature') || normalizedMessage.includes('features') || normalizedMessage.includes('project me') || normalizedMessage.includes('app me') || normalizedMessage.includes('system me')) {
    return 'Glow Studio app me customer ke liye online service browsing, live price aur duration, available slot check, chatbot booking, My Bookings tracking, booking cancellation, AI Style Studio recommendations aur personalized salon guidance available hai. Admin side par services, staff, slots, appointments, AI insights aur marketing campaigns manage hote hain.';
  }
  if (normalizedMessage.includes('how') || normalizedMessage.includes('kaise kaam') || normalizedMessage.includes('use kaise') || normalizedMessage.includes('kya kar sakte')) {
    return 'Aap service ka naam ya price pooch sakte hain, available slot dekh sakte hain, chatbot se booking kar sakte hain, My Bookings me status check/cancel kar sakte hain, aur AI Style Studio se look recommendation le sakte hain.';
  }
  if (normalizedMessage.includes('service') || normalizedMessage.includes('services') || normalizedMessage.includes('menu') || normalizedMessage.includes('kya kya')) {
    const serviceList = services.map((item) => `${item.title} (₹${Number(item.price || 0).toLocaleString('en-IN')})`).join(', ');
    return serviceList ? `Glow Studio par available services: ${serviceList}. Aap kisi bhi service ka price ya duration pooch sakte hain.` : 'Services abhi admin panel me add nahi hui hain.';
  }
  if (service && (normalizedMessage.includes('price') || normalizedMessage.includes('cost') || normalizedMessage.includes('kitna') || normalizedMessage.includes('kitne') || normalizedMessage.includes('rate') || normalizedMessage.includes('me hota') || normalizedMessage.includes('ka hai'))) {
    return `${service.title} ki price ₹${Number(service.price || 0).toLocaleString('en-IN')} hai.`;
  }
  if (service && (normalizedMessage.includes('time') || normalizedMessage.includes('duration') || normalizedMessage.includes('lagega'))) {
    return `${service.title} me lagbhag ${service.duration || 'available'} minutes lagenge.`;
  }
  if (normalizedMessage.includes('location') || normalizedMessage.includes('address') || normalizedMessage.includes('kahan')) {
    return 'Glow Studio ka location admin panel ke salon profile me configured hai. Aap reception se exact map pin le sakte hain.';
  }
  if (normalizedMessage.includes('slot') || normalizedMessage.includes('availability') || normalizedMessage.includes('available')) {
    const openSlots = slots.filter((slot) => String(slot.status).toLowerCase() === 'open');
    return openSlots.length ? `${openSlots.length} slots available hain. Best options: ${openSlots.slice(0, 3).map((slot) => `${slot.day} ${slot.time}`).join(', ')}.` : 'Abhi koi open slot nahi mila.';
  }
  if (normalizedMessage.includes('cancel') || normalizedMessage.includes('cancellation') || normalizedMessage.includes('refund')) {
    return 'Booking cancel karne ke liye My Bookings page par jaakar Cancel button use karein. Refund policy ke liye salon reception se confirm karein.';
  }
  if (normalizedMessage.includes('timing') || normalizedMessage.includes('open') || normalizedMessage.includes('close') || normalizedMessage.includes('hours')) {
    return 'Salon timings admin ke configured schedule par depend karte hain. Available slots dekhne ke liye “available slots” poochiye.';
  }
  if (normalizedMessage.includes('offer') || normalizedMessage.includes('discount') || normalizedMessage.includes('deal')) {
    return 'Current offers admin ke marketing campaigns se manage hote hain. Aap “available offers” pooch sakte hain ya reception se latest offer confirm kar sakte hain.';
  }
  return null;
}

export function answerChat({ message, role = 'customer', user, services = [], slots = [], bookings = [], appointments = [], staff = [] } = {}) {
  const text = normalizeText(message);
  const service = findServiceInMessage(text, services);

  const faq = answerFaq(text, services, slots);
  if (faq && (!text.includes('book') && !text.includes('booking') && !text.includes('appointment'))) {
    return { reply: faq, intent: 'faq' };
  }

  if (role === 'admin') {
    if (text.includes('profit') || text.includes('revenue') || text.includes('kamai')) {
      const now = new Date();
      const currentMonthBookings = text.includes('month') || text.includes('mahine')
        ? bookings.filter((booking) => {
          const bookingDate = new Date(String(booking.date || '').split(' • ')[0]);
          return !Number.isNaN(bookingDate.getTime()) && bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
        })
        : bookings;
      const revenue = currentMonthBookings.reduce((sum, booking) => {
        const linkedService = services.find((item) => item.title === booking.service);
        return sum + Number(booking.amount || linkedService?.price || 0);
      }, 0);
      return { reply: `Is data ke hisaab se current booking revenue ₹${revenue.toLocaleString('en-IN')} hai.`, intent: 'admin-revenue' };
    }
    if (text.includes('no-show') || text.includes('noshow')) {
      const noShows = [...bookings, ...appointments].filter((item) => String(item.status).toLowerCase().replace(/[- ]/g, '') === 'noshow');
      const latest = noShows[noShows.length - 1];
      return { reply: latest ? `${latest.client || 'Customer'} ka latest no-show ${latest.date || latest.time || 'recorded appointment'} tha.` : 'Abhi no-show ka koi record nahi mila.', intent: 'admin-no-show' };
    }
    if (faq) return { reply: faq, intent: 'faq' };
    const insights = generateOwnerInsights({ bookings, appointments, services, staff, slots });
    return { reply: `${insights.rushHours[0].message} ${insights.inventoryAlerts[0].action}`, intent: 'admin-insights' };
  }

  const bookingDate = parseBookingDate(text);
  const bookingTime = parseBookingTime(text);
  if (service && bookingDate && bookingTime && (text.includes('book') || text.includes('booking') || text.includes('karna') || text.includes('appointment'))) {
    return {
      reply: `${service.title} ke liye ${bookingDate} at ${bookingTime} ka booking request ready hai.`,
      intent: 'booking-ready',
      booking: { client: user?.name || 'Customer', service: service.title, date: `${bookingDate} • ${bookingTime}`, status: 'Pending', amount: Number(service.price || 0) },
    };
  }
  if (text.includes('shaadi') || text.includes('wedding') || text.includes('bridal')) {
    const combo = services.filter((item) => /keratin|facial|bridal/i.test(item.title)).slice(0, 2);
    return { reply: `${combo.map((item) => item.title).join(' + ') || 'Keratin + Facial'} combo aapke event ke liye strong choice hai. Main aapke liye suitable slot bhi suggest kar sakta hoon.`, intent: 'recommendation' };
  }
  if (faq) return { reply: faq, intent: 'faq' };
  if (text.includes('hello') || text.includes('hi') || text.includes('namaste') || text.includes('hey')) {
    return { reply: `Namaste${user?.name ? ` ${user.name}` : ''}! Main Glow AI hoon. Main services, price, duration, slots, booking, cancellation aur salon recommendations me help kar sakta hoon.`, intent: 'greeting' };
  }
  if (text.includes('thank') || text.includes('thanks') || text.includes('dhanyavad')) {
    return { reply: 'Aapka welcome! Glow Studio me aapki next visit ka wait rahega.', intent: 'thanks' };
  }
  return { reply: 'Main booking, service price, duration, availability aur recommendations me help kar sakta hoon. Example: “kal 11 baje Beard Trim book karo”.', intent: 'help' };
}
