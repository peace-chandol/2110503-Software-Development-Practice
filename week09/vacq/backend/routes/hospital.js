const express = require('express')
const router = express.Router()
const {getHospitals, getHospital, createHospital, updateHospital, deleteHospital} = require('../controllers/hospitals')
const appointmentsRouter = require('./appointments')

const { protect, authorize } = require('../middleware/auth')

router.use('/:hospitalId/appointments', appointmentsRouter)

router.route('/')
    .get(getHospitals)
    .post(protect, authorize('admin'), createHospital)

router.route('/:id')
    .get(getHospital)
    .put(protect, authorize('admin'),updateHospital)
    .delete(protect, authorize('admin'),deleteHospital)

module.exports = router