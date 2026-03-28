const PlatformSettings = require('../models/PlatformSettings');

const getSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
