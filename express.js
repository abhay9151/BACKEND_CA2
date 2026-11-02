require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const feedbackRouter = require('./routes/feedbackRouter')
app.use(express.json())
const PORT = process.env.PORT || 5000
app.get('/', (req, res) => {
    res.send("Student Feedback API is running")
})
app.use('/api/feedback',feedbackRouter)
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})
app.use((err, req, res, next) => {
    res.status(400).json({ message: "Invalid JSON in request body" })
})
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connected")
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch((err)=>{
    console.log({message: err})
})
