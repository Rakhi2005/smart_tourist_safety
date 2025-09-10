const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Validation schema for creating safety alerts
const createSafetyAlertSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  message: Joi.string().min(5).required(),
  alertType: Joi.string().valid('weather','traffic','security','medical','general').required(),
  severity: Joi.string().valid('info','warning','danger').required(),
  locationId: Joi.number().integer().allow(null).optional(),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.date().iso().allow(null).optional()
});

const updateSafetyAlertSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  message: Joi.string().min(5).optional(),
  alertType: Joi.string().valid('weather','traffic','security','medical','general').optional(),
  severity: Joi.string().valid('info','warning','danger').optional(),
  locationId: Joi.number().integer().allow(null).optional(),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.date().iso().allow(null).optional()
}).min(1);

// Get latest alerts: recent incidents and SOS alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Always try to return incidents
    const [incidents] = await pool.execute(`
      SELECT i.id, i.title, i.description, i.incident_type, i.severity, i.status, i.created_at,
             l.name as location_name
      FROM incidents i
      LEFT JOIN locations l ON l.id = i.location_id
      ORDER BY i.created_at DESC
      LIMIT 20
    `);

    // Try to return SOS; if sos_alerts is missing, return empty sos list
    let sos = [];
    try {
      const [sosRows] = await pool.execute(`
        SELECT s.id, s.tourist_id, s.latitude, s.longitude, s.location, s.status, s.timestamp,
               CONCAT(u.first_name, ' ', u.last_name) as tourist_name
        FROM sos_alerts s
        LEFT JOIN users u ON u.id = s.tourist_id
        ORDER BY s.timestamp DESC
        LIMIT 20
      `);
      sos = sosRows;
    } catch (sosErr) {
      console.warn('SOS query failed, returning empty sos list:', sosErr.message);
      sos = [];
    }

    res.json({ incidents, sos });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Emergency contacts for Safety Info page
router.get('/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const [contacts] = await pool.execute(`
      SELECT id, name, phone, email, department, location_id
      FROM emergency_contacts
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);

    const [tips] = await pool.execute(`
      SELECT id, title, content, category
      FROM safety_tips
      WHERE is_active = TRUE
      ORDER BY id DESC
      LIMIT 20
    `);

    res.json({ contacts, tips });
  } catch (err) {
    console.error('Get emergency contacts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List safety alerts (with optional filters)
router.get('/safety', authenticateToken, async (req, res) => {
  try {
    const { type, severity, search } = req.query;

    let query = `
      SELECT sa.id, sa.title, sa.message, sa.alert_type, sa.severity, sa.location_id, sa.is_active,
             sa.expires_at, sa.created_at, sa.updated_at, l.name as location_name
      FROM safety_alerts sa
      LEFT JOIN locations l ON l.id = sa.location_id
      WHERE 1=1
    `;
    const params = [];

    if (type) { query += ' AND sa.alert_type = ?'; params.push(type); }
    if (severity) { query += ' AND sa.severity = ?'; params.push(severity); }
    if (search) {
      query += ' AND (sa.title LIKE ? OR sa.message LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY sa.created_at DESC LIMIT 100';

    const [rows] = await pool.execute(query, params);
    res.json({ alerts: rows });
  } catch (err) {
    console.error('List safety alerts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new safety alert (admin or safety_officer)
router.post('/safety', authenticateToken, requireRole(['admin','safety_officer']), async (req, res) => {
  try {
    const { error, value } = createSafetyAlertSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, message, alertType, severity, locationId = null, isActive = true } = value;
    // Normalize expiresAt to MySQL DATETIME if present
    let expiresAt = null;
    if (value.expiresAt) {
      const d = new Date(value.expiresAt);
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        const mysql = `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
        expiresAt = mysql;
      }
    }

    // Validate locationId if provided
    let finalLocationId = locationId;
    if (finalLocationId !== null && finalLocationId !== undefined) {
      const [locRows] = await pool.execute('SELECT id FROM locations WHERE id = ?', [finalLocationId]);
      if (locRows.length === 0) {
        return res.status(400).json({ message: 'Invalid locationId: location does not exist' });
      }
    }

    const [result] = await pool.execute(`
      INSERT INTO safety_alerts (title, message, alert_type, severity, location_id, is_active, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, message, alertType, severity, finalLocationId, isActive, expiresAt, req.user.id]);

    res.status(201).json({ message: 'Safety alert created', id: result.insertId });
  } catch (err) {
    console.error('Create safety alert error:', err);
    // Return a safer, more helpful message
    const hint = err?.code === 'ER_BAD_FIELD_ERROR' || err?.code === 'ER_TRUNCATED_WRONG_VALUE'
      ? 'Invalid field value. Check date/time format and required fields.'
      : 'Internal server error';
    res.status(500).json({ message: hint });
  }
});

// Get single safety alert
router.get('/safety/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT sa.*, l.name as location_name FROM safety_alerts sa
       LEFT JOIN locations l ON l.id = sa.location_id
       WHERE sa.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Alert not found' });
    res.json({ alert: rows[0] });
  } catch (err) {
    console.error('Get safety alert error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update safety alert
router.put('/safety/:id', authenticateToken, requireRole(['admin','safety_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateSafetyAlertSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const fields = [];
    const params = [];
    if (value.title !== undefined) { fields.push('title = ?'); params.push(value.title); }
    if (value.message !== undefined) { fields.push('message = ?'); params.push(value.message); }
    if (value.alertType !== undefined) { fields.push('alert_type = ?'); params.push(value.alertType); }
    if (value.severity !== undefined) { fields.push('severity = ?'); params.push(value.severity); }
    if (value.locationId !== undefined) { fields.push('location_id = ?'); params.push(value.locationId); }
    if (value.isActive !== undefined) { fields.push('is_active = ?'); params.push(value.isActive); }
    if (value.expiresAt !== undefined) { fields.push('expires_at = ?'); params.push(value.expiresAt); }

    if (!fields.length) return res.status(400).json({ message: 'No valid fields to update' });

    params.push(id);
    await pool.execute(`UPDATE safety_alerts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    res.json({ message: 'Safety alert updated' });
  } catch (err) {
    console.error('Update safety alert error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete safety alert
router.delete('/safety/:id', authenticateToken, requireRole(['admin','safety_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM safety_alerts WHERE id = ?', [id]);
    res.json({ message: 'Safety alert deleted' });
  } catch (err) {
    console.error('Delete safety alert error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
