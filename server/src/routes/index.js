const router = require('express').Router();

const authRoutes = require('./authRoutes');
const leadRoutes = require('./leadRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const dealRoutes = require('./dealRoutes');
const propertyRoutes = require('./propertyRoutes');
const ownerRoutes = require('./ownerRoutes');
const tenantRoutes = require('./tenantRoutes');
const contractRoutes = require('./contractRoutes');
const inspectionRoutes = require('./inspectionRoutes');
const uploadRoutes = require('./uploadRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/deals', dealRoutes);
router.use('/properties', propertyRoutes);
router.use('/owners', ownerRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/upload', uploadRoutes);
router.use('/stats', statsRoutes);

router.get('/status', (req, res) => {
    res.json({ status: 'API is functional', timestamp: new Date() });
});

module.exports = router;
