const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const incidentSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).required(),
  incidentType: Joi.string().valid('theft', 'accident', 'medical', 'lost_person', 'natural_disaster', 'other').required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  locationId: Joi.number().integer().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional()
});

const updateIncidentSchema = Joi.object({
  status: Joi.string().valid('reported', 'investigating', 'resolved', 'closed').optional(),
  assignedOfficerId: Joi.number().integer().optional(),
  description: Joi.string().min(10).optional()
});

// Get all incidents (with filtering and pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, severity, type, locationId } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offsetNum = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        i.*,
        l.name as location_name,
        CONCAT(u.first_name, ' ', u.last_name) as reporter_name,
        CONCAT(o.first_name, ' ', o.last_name) as assigned_officer_name
      FROM incidents i
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN users u ON i.reporter_id = u.id
      LEFT JOIN users o ON i.assigned_officer_id = o.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (status) {
      query += ' AND i.status = ?';
      queryParams.push(status);
    }

    if (severity) {
      query += ' AND i.severity = ?';
      queryParams.push(severity);
    }

    if (type) {
      query += ' AND i.incident_type = ?';
      queryParams.push(type);
    }

    if (locationId) {
      query += ' AND i.location_id = ?';
      queryParams.push(locationId);
    }

    // If user is not admin, show their incidents OR globally resolved incidents
    if (req.user.role === 'user') {
      query += ' AND (i.reporter_id = ? OR i.status = \'resolved\')';
      queryParams.push(req.user.id);
    }

    query += ` ORDER BY i.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const [incidents] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM incidents i WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND i.status = ?';
      countParams.push(status);
    }

    if (severity) {
      countQuery += ' AND i.severity = ?';
      countParams.push(severity);
    }

    if (type) {
      countQuery += ' AND i.incident_type = ?';
      countParams.push(type);
    }

    if (locationId) {
      countQuery += ' AND i.location_id = ?';
      countParams.push(locationId);
    }

    if (req.user.role === 'user') {
      countQuery += ' AND (i.reporter_id = ? OR i.status = \'resolved\')';
      countParams.push(req.user.id);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      incidents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single incident
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [incidents] = await pool.execute(`
      SELECT 
        i.*,
        l.name as location_name,
        l.address as location_address,
        CONCAT(u.first_name, ' ', u.last_name) as reporter_name,
        u.email as reporter_email,
        CONCAT(o.first_name, ' ', o.last_name) as assigned_officer_name,
        o.email as assigned_officer_email
      FROM incidents i
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN users u ON i.reporter_id = u.id
      LEFT JOIN users o ON i.assigned_officer_id = o.id
      WHERE i.id = ?
    `, [id]);

    if (incidents.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const incident = incidents[0];

    // Check permissions
    if (req.user.role === 'user' && incident.reporter_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ incident });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new incident
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = incidentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, incidentType, severity, locationId, latitude, longitude } = value;

    const [result] = await pool.execute(`
      INSERT INTO incidents (title, description, incident_type, severity, location_id, reporter_id, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, incidentType, severity, locationId, req.user.id, latitude, longitude]);

    res.status(201).json({
      message: 'Incident reported successfully',
      incidentId: result.insertId
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update incident (admin/safety officer only)
router.put('/:id', authenticateToken, requireRole(['admin', 'safety_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateIncidentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updateFields = [];
    const updateValues = [];

    if (value.status) {
      updateFields.push('status = ?');
      updateValues.push(value.status);
      
      if (value.status === 'resolved' || value.status === 'closed') {
        updateFields.push('resolved_at = NOW()');
      }
    }

    if (value.assignedOfficerId) {
      updateFields.push('assigned_officer_id = ?');
      updateValues.push(value.assignedOfficerId);
    }

    if (value.description) {
      updateFields.push('description = ?');
      updateValues.push(value.description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE incidents SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Incident updated successfully' });
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get incident statistics
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'safety_officer']), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'reported' THEN 1 ELSE 0 END) as reported,
        SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM incidents
    `);

    const [typeStats] = await pool.execute(`
      SELECT 
        incident_type,
        COUNT(*) as count
      FROM incidents
      GROUP BY incident_type
      ORDER BY count DESC
    `);

    const [recentIncidents] = await pool.execute(`
      SELECT 
        i.*,
        l.name as location_name,
        CONCAT(u.first_name, ' ', u.last_name) as reporter_name
      FROM incidents i
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN users u ON i.reporter_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    res.json({
      overview: stats[0],
      typeBreakdown: typeStats,
      recentIncidents
    });
  } catch (error) {
    console.error('Get incident stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
