const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getSettings, updateSettings } = require('../controllers/platformSettingsController');

const router = express.Router();

router.get('/', getSettings);

router.put('/', auth, roleCheck('admin'), updateSettings);

module.exports = router;
