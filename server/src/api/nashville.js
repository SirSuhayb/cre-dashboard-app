const express = require('express');
const axios = require('axios');
const router = express.Router();

// Building Permits
router.get('/permits', async (req, res) => {
  try {
    const { data } = await axios.get('https://data.nashville.gov/resource/kqff-rxj8.json?$limit=50');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch building permits' });
  }
});

// Property Tax Records
router.get('/tax', async (req, res) => {
  try {
    const { data } = await axios.get('https://data.nashville.gov/resource/3h5w-q8b7.json?$limit=50');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property tax records' });
  }
});

// Business Licenses
router.get('/licenses', async (req, res) => {
  try {
    const { data } = await axios.get('https://data.nashville.gov/resource/ybyb-xgn8.json?$limit=50');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch business licenses' });
  }
});

// Service Requests
router.get('/service-requests', async (req, res) => {
  try {
    const { data } = await axios.get('https://data.nashville.gov/resource/7qhx-rexh.json?$limit=50');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

module.exports = router; 