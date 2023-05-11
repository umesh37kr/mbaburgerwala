import app from './app.js';
import { connectDB } from './config/database.js'
import Razorpay from 'razorpay'

connectDB()
const PORT = process.env.PORT

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
})

app.get('/', (req, res) => {
    res.send("working")
})
app.listen(PORT, () =>{
    console.log(`server is listening on port ${PORT} in ${process.env.NODE_ENV} Mode`)
})