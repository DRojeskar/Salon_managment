import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const demoSalonId = 'salon-glow-demo';

const salons = [
  {
    id: demoSalonId,
    name: 'Glow Studio',
    phone: '+919876543210',
    address: 'MG Road, Jaipur',
    email: 'hello@glowstudio.com',
    openTime: '09:00',
    closeTime: '21:00',
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
  },
];

const withSalon = (item) => ({ ...item, salonId: demoSalonId });

const staff = [
  { id: 'staff-1', name: 'Sameer', role: 'Senior Stylist', shift: 'Morning', status: 'Available' },
  { id: 'staff-2', name: 'Aisha', role: 'Color Expert', shift: 'Afternoon', status: 'Busy' },
  { id: 'staff-3', name: 'Rohan', role: 'Beard Specialist', shift: 'Evening', status: 'Available' },
  { id: 'staff-4', name: 'Neha', role: 'Skin Care', shift: 'Morning', status: 'Available' },
  { id: 'staff-5', name: 'Kavya', role: 'Bridal Stylist', shift: 'Friday', status: 'Available' },
];

const services = [
  { id: 'svc-1', title: 'Haircut', price: 1200, duration: 45, category: 'Hair' },
  { id: 'svc-2', title: 'Hair Color', price: 2800, duration: 90, category: 'Color' },
  { id: 'svc-3', title: 'Facial', price: 1800, duration: 60, category: 'Skin' },
  { id: 'svc-4', title: 'Beard Trim', price: 800, duration: 30, category: 'Grooming' },
  { id: 'svc-5', title: 'Keratin Treatment', price: 3500, duration: 120, category: 'Hair' },
  { id: 'svc-6', title: 'Bridal Makeup', price: 5200, duration: 150, category: 'Special Event' },
  { id: 'svc-7', title: 'Hair Spa', price: 1600, duration: 60, category: 'Hair Care' },
  { id: 'svc-8', title: 'Manicure', price: 900, duration: 45, category: 'Nails' },
  { id: 'svc-9', title: 'Pedicure', price: 1100, duration: 50, category: 'Nails' },
  { id: 'svc-10', title: 'Threading', price: 250, duration: 20, category: 'Grooming' },
  { id: 'svc-11', title: 'Waxing', price: 1400, duration: 60, category: 'Skin' },
  { id: 'svc-12', title: 'Party Makeup', price: 2800, duration: 90, category: 'Makeup' },
  { id: 'svc-13', title: 'French Crop', price: 999, duration: 45, category: 'Hair' },
  { id: 'svc-14', title: 'Beard Fade', price: 700, duration: 30, category: 'Grooming' },
  { id: 'svc-15', title: 'Hair Botox', price: 4200, duration: 120, category: 'Hair Care' },
  { id: 'svc-16', title: 'Scalp Treatment', price: 1800, duration: 60, category: 'Hair Care' },
  { id: 'svc-17', title: 'Hair Extensions', price: 6500, duration: 180, category: 'Hair' },
  { id: 'svc-18', title: 'Cleanup', price: 700, duration: 30, category: 'Skin' },
  { id: 'svc-19', title: 'Luxury Facial', price: 2500, duration: 75, category: 'Skin' },
  { id: 'svc-20', title: 'Saree Draping', price: 1200, duration: 30, category: 'Special Event' },
  { id: 'svc-21', title: 'Mehndi Design', price: 2200, duration: 90, category: 'Special Event' },
];

const slots = [
  { id: 'slot-1', day: 'Monday', time: '10:00', status: 'Open' },
  { id: 'slot-2', day: 'Tuesday', time: '12:00', status: 'Booked' },
  { id: 'slot-3', day: 'Wednesday', time: '17:00', status: 'Open' },
  { id: 'slot-4', day: 'Thursday', time: '18:00', status: 'Open' },
  { id: 'slot-5', day: 'Saturday', time: '17:00', status: 'Open' },
  { id: 'slot-6', day: 'Saturday', time: '18:00', status: 'Open' },
  { id: 'slot-7', day: 'Sunday', time: '11:00', status: 'Open' },
  { id: 'slot-8', day: 'Sunday', time: '15:00', status: 'Booked' },
];

const appointments = [
  { id: 'appt-1', client: 'Deepesh', service: 'Haircut', time: '2026-09-15 10:00', staff: 'Sameer', status: 'Pending' },
  { id: 'appt-2', client: 'Riya', service: 'Hair Color', time: '2026-09-16 12:00', staff: 'Aisha', status: 'Confirmed' },
  { id: 'appt-3', client: 'Aman', service: 'Facial', time: '2026-09-17 15:00', staff: 'Neha', status: 'Pending' },
  { id: 'appt-4', client: 'Sonia', service: 'Beard Trim', time: '2026-09-18 18:00', staff: 'Rohan', status: 'Confirmed' },
  { id: 'appt-5', client: 'Mehul', service: 'Haircut', time: '2026-09-19 17:00', staff: 'Sameer', status: 'Pending' },
  { id: 'appt-6', client: 'Arjun', service: 'Keratin Treatment', time: '2026-09-20 11:00', staff: 'Sameer', status: 'Confirmed' },
  { id: 'appt-7', client: 'Priya', service: 'Hair Color', time: '2026-09-21 13:30', staff: 'Aisha', status: 'Pending' },
  { id: 'appt-8', client: 'Naina', service: 'Facial', time: '2026-09-22 16:00', staff: 'Neha', status: 'Confirmed' },
];

const bookings = [
  { id: 'booking-1', client: 'Aman', service: 'Haircut', date: '2026-09-10', status: 'Completed' },
  { id: 'booking-2', client: 'Riya', service: 'Hair Color', date: '2026-09-11', status: 'Completed' },
  { id: 'booking-3', client: 'Deepesh', service: 'Haircut', date: '2026-09-12', status: 'Completed' },
  { id: 'booking-4', client: 'Sonia', service: 'Facial', date: '2026-09-13', status: 'Completed' },
  { id: 'booking-5', client: 'Mehul', service: 'Haircut', date: '2026-09-14', status: 'Pending' },
  { id: 'booking-6', client: 'Aisha', service: 'Keratin Treatment', date: '2026-09-15', status: 'Pending' },
  { id: 'booking-7', client: 'Neha', service: 'Hair Color', date: '2026-09-15', status: 'Pending' },
  { id: 'booking-8', client: 'Rohan', service: 'Beard Trim', date: '2026-09-16', status: 'Completed' },
  { id: 'booking-9', client: 'Arjun', service: 'Keratin Treatment', date: '2026-09-08', status: 'Completed' },
  { id: 'booking-10', client: 'Priya', service: 'Hair Color', date: '2026-09-09', status: 'Completed' },
  { id: 'booking-11', client: 'Naina', service: 'Facial', date: '2026-09-06', status: 'Completed' },
  { id: 'booking-12', client: 'Vikram', service: 'Haircut', date: '2026-09-03', status: 'Completed' },
];

const users = [
  { id: 'user-1', name: 'Admin User', email: 'admin@glowstudio.com', password: 'admin123', role: 'admin', phone: '+919800000001', salonIds: [demoSalonId], activeSalonId: demoSalonId },
  { id: 'user-2', name: 'Deepesh', email: 'deepesh@gmail.com', password: 'user123', role: 'customer', phone: '+919800000002' },
  { id: 'user-3', name: 'Riya', email: 'riya@gmail.com', password: 'user123', role: 'customer', phone: '+919800000003' },
  { id: 'user-4', name: 'Aman', email: 'aman@gmail.com', password: 'user123', role: 'customer', phone: '+919800000004' },
  { id: 'user-5', name: 'Sonia', email: 'sonia@gmail.com', password: 'user123', role: 'customer', phone: '+919800000005' },
  { id: 'user-6', name: 'Mehul', email: 'mehul@gmail.com', password: 'user123', role: 'customer', phone: '+919800000006' },
  { id: 'user-7', name: 'Arjun', email: 'arjun@gmail.com', password: 'user123', role: 'customer', phone: '+919800000007' },
  { id: 'user-8', name: 'Priya', email: 'priya@gmail.com', password: 'user123', role: 'customer', phone: '+919800000008' },
  { id: 'user-9', name: 'Naina', email: 'naina@gmail.com', password: 'user123', role: 'customer', phone: '+919800000009' },
  { id: 'user-10', name: 'Vikram', email: 'vikram@gmail.com', password: 'user123', role: 'customer', phone: '+919800000010' },
];

const seedData = {
  users: await Promise.all(users.map(async (user) => ({
    ...user,
    password: await bcrypt.hash(user.password, 10),
  }))),
  salons,
  staff: staff.map(withSalon),
  services: services.map(withSalon),
  slots: slots.map(withSalon),
  appointments: appointments.map(withSalon),
  bookings: bookings.map((item) => withSalon({ ...item, salonName: 'Glow Studio' })),
};

async function main() {
  await fs.writeFile(dbPath, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log('Seed data written to', dbPath);
  console.log(`Inserted ${users.length} users, ${staff.length} staff, ${services.length} services, ${slots.length} slots, ${appointments.length} appointments, ${bookings.length} bookings.`);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
