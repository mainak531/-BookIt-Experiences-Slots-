const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const isMockMode = !process.env.DATABASE_URL;
let pool = null;
if (!isMockMode) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

// ----------------------
// Mock Data (when no DB)
// ----------------------
const mockExperiences = [
  { id: 1, title: 'Kayaking', location: 'Udupi', description: 'Curated small-group experience. Certified guide. Safety first with gear included.', price: 999, image: 'https://api.builder.io/api/v1/image/assets/TEMP/37818f7f40e84ebae4a4c830ab15cf0a0a3cd559?width=560', alt_text: 'Kayaking experience in Udupi' },
  { id: 2, title: 'Nandi Hills Sunrise', location: 'Bangalore', description: 'Curated small-group experience. Certified guide. Safety first with gear included.', price: 899, image: 'https://api.builder.io/api/v1/image/assets/TEMP/acf34052028f803682c7b1e9fcb230e6622b7fcd?width=560', alt_text: 'Nandi Hills sunrise experience in Bangalore' },
  { id: 3, title: 'Coffee Trail', location: 'Coorg', description: 'Curated small-group experience. Certified guide. Safety first with gear included.', price: 1299, image: 'https://api.builder.io/api/v1/image/assets/TEMP/87332eb447e8d5eaa451eb6e252fe5381c9184fd?width=560', alt_text: 'Coffee trail experience in Coorg' },
  { id: 4, title: 'Boat Cruise', location: 'Sunderban', description: 'Curated small-group experience. Certified guide. Safety first with gear included.', price: 999, image: 'https://api.builder.io/api/v1/image/assets/TEMP/3780d80296089b1829ac118f8728641a04ff2e25?width=560', alt_text: 'Boat cruise experience in Sunderban' },
  { id: 5, title: 'Bunjee Jumping', location: 'Manali', description: 'Curated small-group experience. Certified guide. Safety first with gear included.', price: 999, image: 'https://api.builder.io/api/v1/image/assets/TEMP/83ca4f52cae954bc6443189328e6b8b36df604e8?width=560', alt_text: 'Bunjee jumping experience in Manali' }
];
const mockPromoCodes = {
  'SAVE10': { code: 'SAVE10', discount_type: 'percent', discount_value: 10, is_active: true },
  'FLAT100': { code: 'FLAT100', discount_type: 'flat', discount_value: 100, is_active: true },
};
const generateMockSlots = (experienceId) => {
  const times = ['07:00 am', '09:00 am', '11:00 am', '1:00 pm'];
  const today = new Date();
  const slots = [];
  for (let d = 0; d < 5; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    const dateStr = dt.toISOString().slice(0, 10); // yyyy-mm-dd
    for (const t of times) {
      slots.push({ id: Number(`${experienceId}${d}${times.indexOf(t)}`), date: dateStr, time: t, slots_left: 5 });
    }
  }
  return slots;
};

// Health checks
app.get('/', (req, res) => {
  res.json({ message: 'Backend running', mode: isMockMode ? 'mock' : 'db' });
});
app.get('/health/db', async (req, res) => {
  if (isMockMode) return res.json({ ok: true, mode: 'mock' });
  try {
    const r = await pool.query('SELECT 1');
    res.json({ ok: true, result: r.rows[0], mode: 'db' });
  } catch (err) {
    console.error('DB health error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 1. GET /experiences - List all experiences
app.get('/experiences', async (req, res) => {
  if (isMockMode) return res.json(mockExperiences);
  try {
    const result = await pool.query('SELECT * FROM experiences ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /experiences error:', err);
    res.status(500).json({ error: 'Failed to fetch experiences', details: err.message });
  }
});

// 2. GET /experiences/:id - Experience details and next 5 days slot availability
app.get('/experiences/:id', async (req, res) => {
  const { id } = req.params;
  if (isMockMode) {
    const exp = mockExperiences.find(e => String(e.id) === String(id));
    if (!exp) return res.status(404).json({ error: 'Experience not found.' });
    const slots = generateMockSlots(exp.id);
    return res.json({ ...exp, slots });
  }
  try {
    const exp = await pool.query('SELECT * FROM experiences WHERE id = $1', [id]);
    if (!exp.rows.length) return res.status(404).json({ error: 'Experience not found.' });
    const slots = await pool.query(
      `SELECT id, date, time, slots_left FROM slots WHERE experience_id = $1 AND date >= current_date AND date < current_date + INTERVAL '5 days' ORDER BY date, time`,
      [id]
    );
    res.json({ ...exp.rows[0], slots: slots.rows });
  } catch (err) {
    console.error('GET /experiences/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch experience', details: err.message });
  }
});

// 3. POST /bookings - Book experience, check availability
app.post('/bookings', async (req, res) => {
  const { experienceId, slotId, fullName, email, quantity, promoCode, price, subtotal, taxes, total } = req.body;
  if (!(experienceId && slotId && fullName && email && quantity && price && subtotal && taxes && total)) {
    return res.status(400).json({ error: 'Missing booking fields.' });
  }
  if (isMockMode) {
    const bookingId = Math.floor(Math.random() * 1000000);
    return res.json({ bookingId, createdAt: new Date().toISOString() });
  }
  try {
    await pool.query('BEGIN');
    const { rows } = await pool.query('SELECT slots_left FROM slots WHERE id = $1 FOR UPDATE', [slotId]);
    if (!rows.length) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid slot.' });
    }
    if (rows[0].slots_left < quantity) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough slots left.' });
    }

    await pool.query('UPDATE slots SET slots_left = slots_left - $1 WHERE id = $2', [quantity, slotId]);
    const booking = await pool.query(
      `INSERT INTO bookings (experience_id, slot_id, full_name, email, quantity, promo_code, price, subtotal, taxes, total) \
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, created_at`,
      [experienceId, slotId, fullName, email, quantity, promoCode, price, subtotal, taxes, total]
    );
    await pool.query('COMMIT');
    res.json({ bookingId: booking.rows[0].id, createdAt: booking.rows[0].created_at });
  } catch (err) {
    console.error('POST /bookings error:', err);
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});

// 4. POST /promo/validate - Validate promo code
app.post('/promo/validate', async (req, res) => {
  const { promoCode } = req.body;
  if (!promoCode) return res.status(400).json({ error: 'Promo code required.' });
  if (isMockMode) {
    const p = mockPromoCodes[promoCode.toUpperCase()];
    if (!p) return res.json({ valid: false, message: 'Invalid promo code.' });
    if (!p.is_active) return res.json({ valid: false, message: 'Promo code inactive.' });
    return res.json({ valid: true, ...p });
  }
  try {
    const promo = await pool.query('SELECT code, discount_type, discount_value, is_active FROM promocodes WHERE code = $1', [promoCode.toUpperCase()]);
    if (!promo.rows.length) return res.json({ valid: false, message: 'Invalid promo code.' });
    if (!promo.rows[0].is_active) return res.json({ valid: false, message: 'Promo code inactive.' });
    res.json({ valid: true, ...promo.rows[0] });
  } catch (err) {
    console.error('POST /promo/validate error:', err);
    res.status(500).json({ error: 'Promo validation failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${isMockMode ? 'MOCK' : 'DB'} mode`);
});
