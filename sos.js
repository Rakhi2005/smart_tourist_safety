const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const sosSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  location: Joi.string().max(255).optional(),
});

// Send SOS - authenticated users (tourists)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = sosSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { latitude, longitude, location } = value;

    const [result] = await pool.execute(
      `INSERT INTO sos_alerts (tourist_id, latitude, longitude, location, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [req.user.id, latitude, longitude, location || null]
    );

    res.status(201).json({
      message: 'SOS sent successfully',
      sosId: result.insertId,
    });
  } catch (err) {
    console.error('SOS error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List latest SOS alerts
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, u.username, CONCAT(u.first_name, ' ', u.last_name) as tourist_name
       FROM sos_alerts s
       LEFT JOIN users u ON u.id = s.tourist_id
       ORDER BY s.timestamp DESC
       LIMIT 20`
    );
    res.json({ sos: rows });
  } catch (err) {
    console.error('Get SOS latest error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resolve/close SOS (optional: for future)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: 'active' | 'acknowledged' | 'resolved'

    if (!['active', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.execute('UPDATE sos_alerts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'SOS status updated' });
  } catch (err) {
    console.error('Update SOS status error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
