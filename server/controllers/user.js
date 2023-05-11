import { asyncError } from '../middlewares/errorMiddleware.js';
import { User } from '../models/User.js'
import { Order } from '../models/Order.js'
export const myProfile = (req, res, next) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
}

export const logout = (req, res, next) => {
    req.session.destroy((err) =>{
        if(err) return next(err);

        res.clearCookie("connect.sid",{
            secure: process.env.NODE_ENV === "development" ? false : true,
            httpOnly: process.env.NODE_ENV === "development" ? false : true,
            sameSite: process.env.NODE_ENV === "development" ? false : true,
        });
        res.status(200).json({
            message: "Logged Out"
        })
    })
}

export const getAdminUser = asyncError(async(req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        success: true,
        users
    })
})

export const getAdminStats = asyncError(async(req, res, next) => {
    const userCount = await User.countDocuments();
    console.log(userCount)
    const orders = await Order.find({});

    const preparingOrder = orders.filter(i => i.orderStatus === "preparing");
    const shippedOrder = orders.filter(i => i.orderStatus === "shipped");
    const deliveredOrder = orders.filter(i => i.orderStatus === "delivered");

    let totalIncome = 0;
    orders.forEach((i) => {
        totalIncome += i.totalAmount
    })
    res.status(200).json({
        success: true,
        userCount,
        ordersCount:{
            total: orders.length,
            preparing: preparingOrder.length,
            shipped: shippedOrder.length,
            delivered: deliveredOrder.length
        },
        totalIncome
    })
})