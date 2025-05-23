const Appointment = require('../models/Appointment')
const Hospital = require('../models/Hospital')

exports.getAppointments = async (req, res, next) => {
    let query
    if (req.user.role !== 'admin') {
        query = Appointment.find({ user: req.user.id }).populate({
            path: 'hospital',
            select: 'name province tel'
        })
    } else {
        if (req.params.hospitalId) {
            console.log(req.params.hospitalId)
            query = Appointment.find({ hospital: req.params.hospitalId }).populate({
                path: 'hospital',
                select: 'name province tel'
            })
        } else {
            query = Appointment.find().populate({
                path: 'hospital',
                select: 'name province tel'
            })
        }
    }
    try {
        const appointments = await query
        res.status(200).json({ success: true, count: appointments.length, data: appointments })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Cannot find Appointment' })
    }
}

exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name province tel'
        })

        if (!appointment) {
            return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` })
        }
        res.status(200).json({ success: true, data: appointment })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Cannot find Appointment' })
    }
}

exports.addAppointment = async (req, res, next) => {
    try {
        req.body.hospital = req.params.hospitalId

        const hospital = await Hospital.findById(req.params.hospitalId)

        if (!hospital) {
            return res.status(404).json({ success: false, message: `No hospital with the id of ${req.params.hospitalId}` })
        }
        req.body.user = req.user.id
        const existedAppointment = await Appointment.find({ user: req.user.id })

        if (existedAppointment.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 appointments` })
        }

        const appointment = await Appointment.create(req.body)

        res.status(200).json({ success: true, data: appointment })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Cannot create Appointment' })
    }
}

exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id)

        if (!appointment) {
            return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` })
        }

        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update appointment` })
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({ success: true, data: appointment })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Cannot update Appointment' })
    }
}

exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)

        if (!appointment) {
            return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` })
        }

        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this bootcamp` })
        }

        await appointment.deleteOne()

        res.status(200).json({ success: true, data: {} })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Cannot delete Appointment' })
    }
}