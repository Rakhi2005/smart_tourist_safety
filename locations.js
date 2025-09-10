const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const locationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  address: Joi.string().min(5).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  locationType: Joi.string().valid('beach', 'mountain', 'city', 'monument', 'park', 'other').required(),
  safetyLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
  description: Joi.string().optional()
});

// Get all locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, safetyLevel, search } = req.query;

    let query = 'SELECT * FROM locations WHERE is_active = TRUE';
    const queryParams = [];

    if (type) {
      query += ' AND location_type = ?';
      queryParams.push(type);
    }

    if (safetyLevel) {
      query += ' AND safety_level = ?';
      queryParams.push(safetyLevel);
    }

    if (search) {
      query += ' AND (name LIKE ? OR address LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const [locations] = await pool.execute(query, queryParams);

    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single location
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [locations] = await pool.execute(
      'SELECT * FROM locations WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ location: locations[0] });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new location (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { error, value } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, address, latitude, longitude, locationType, safetyLevel, description } = value;

    const [result] = await pool.execute(`
      INSERT INTO locations (name, address, latitude, longitude, location_type, safety_level, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, address, latitude, longitude, locationType, safetyLevel, description]);

    res.status(201).json({
      message: 'Location created successfully',
      locationId: result.insertId
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update location (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = locationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, address, latitude, longitude, locationType, safetyLevel, description } = value;

    await pool.execute(`
      UPDATE locations 
      SET name = ?, address = ?, latitude = ?, longitude = ?, location_type = ?, safety_level = ?, description = ?
      WHERE id = ?
    `, [name, address, latitude, longitude, locationType, safetyLevel, description, id]);

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete location (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    await pool.execute(
      'UPDATE locations SET is_active = FALSE WHERE id = ?',
      [id]
    );

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get location statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [locationStats] = await pool.execute(`
      SELECT 
        l.id,
        l.name,
        l.location_type,
        l.safety_level,
        COUNT(i.id) as incident_count,
        AVG(CASE WHEN i.severity = 'critical' THEN 4
                 WHEN i.severity = 'high' THEN 3
                 WHEN i.severity = 'medium' THEN 2
                 WHEN i.severity = 'low' THEN 1
                 ELSE 0 END) as avg_severity
      FROM locations l
      LEFT JOIN incidents i ON l.id = i.location_id
      WHERE l.is_active = TRUE
      GROUP BY l.id, l.name, l.location_type, l.safety_level
      ORDER BY incident_count DESC
    `);

    const [typeStats] = await pool.execute(`
      SELECT 
        location_type,
        COUNT(*) as count,
        AVG(CASE WHEN safety_level = 'high' THEN 3
                 WHEN safety_level = 'medium' THEN 2
                 WHEN safety_level = 'low' THEN 1
                 ELSE 0 END) as avg_safety_level
      FROM locations
      WHERE is_active = TRUE
      GROUP BY location_type
    `);

    res.json({
      locationStats,
      typeStats
    });
  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
