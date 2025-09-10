const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const simpleIncidentSchema = Joi.object({
  category: Joi.string().valid('theft', 'accident', 'medical', 'lost_person', 'natural_disaster', 'other').required(),
  description: Joi.string().min(10).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  photoBase64: Joi.string().base64().optional(),
  photoType: Joi.string().valid('image/jpeg','image/png').optional(),
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = simpleIncidentSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { category, description, latitude = null, longitude = null, photoBase64, photoType } = value;

    const [result] = await pool.execute(
      `INSERT INTO incidents (title, description, incident_type, severity, reporter_id, latitude, longitude)
       VALUES (?, ?, ?, 'low', ?, ?, ?)`,
      [category.toUpperCase(), description, category, req.user.id, latitude, longitude]
    );

    const incidentId = result.insertId;

    if (photoBase64) {
      try {
        const fileName = `incident_${incidentId}.${photoType === 'image/png' ? 'png' : 'jpg'}`;
        const filePath = `inline:${fileName}`; // not saving to disk in this minimal implementation
        const fileSize = Buffer.byteLength(photoBase64, 'base64');
        await pool.execute(
          `INSERT INTO incident_attachments (incident_id, file_name, file_path, file_type, file_size, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [incidentId, fileName, filePath, photoType || 'image/jpeg', fileSize, req.user.id]
        );
      } catch (e) {
        console.warn('Photo not saved, continuing without attachment:', e.message);
      }
    }

    res.status(201).json({ message: 'Incident reported successfully', incidentId });
  } catch (err) {
    console.error('Simple incident error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
