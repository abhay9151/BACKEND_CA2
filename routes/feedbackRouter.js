const router = require('express').Router()
const mongoose = require('mongoose')
const Feedback = require('../model/feedbackModel')
router.post('/', async (req, res) => {
    const { studentName, courseName, message, rating } = req.body || {}
    try {
        if (!studentName || !courseName || !message || rating === undefined) {
            return res.status(400).json({
                message: "studentName, courseName, message and rating are required"
            })
        }
        const ratingNumber = Number(rating)
        if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({
                message: "rating must be a number between 1 and 5"
            })
        }
    const feedback = new Feedback({
            studentName,
            courseName,
            message,
            rating: ratingNumber
        })
        await feedback.save()

        res.status(201).json({ message:"Feedback submitted successfully", feedback })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
})
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    try {
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                message: "page and limit must be greater than 0"
            })
        }
        const skip = (page - 1) * limit
        const feedbacks = await Feedback.find().skip(skip).limit(limit)
        const totalRecords = await Feedback.countDocuments()
        res.json({
            currentPage: page,
            limit: limit,
            totalRecords: totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            feedbacks
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})
router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const { status } = req.body || {}
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid feedback id" })
        }
        if (!status) {
            return res.status(400).json({ message: "status is required" })
        }
        if (status !== 'Pending' && status !== 'Reviewed') {
            return res.status(400).json({
                message: "status must be Pending or Reviewed"
            })
        }
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        )
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" })
        }

        res.json({ message: "Status updated", feedback })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router
