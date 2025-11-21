const router = require('express').Router();

// Placeholder for future routes
const propertyRoutes = require('./propertyRoutes');
const leadRoutes = require('./leadRoutes');
const authRoutes = require('./authRoutes');
const ownerRoutes = require('./ownerRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const dealRoutes = require('./dealRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/properties', propertyRoutes);
router.use('/owners', ownerRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/deals', dealRoutes);
router.use('/stats', statsRoutes);

router.get('/status', (req, res) => {
    res.json({ status: 'API is functional', timestamp: new Date() });
});

module.exports = router;
