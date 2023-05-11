import { asyncError } from '../middlewares/errorMiddleware.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { instance } from '../server.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import crypto from 'crypto';

export const placeOrder = asyncError(
    async(req, res, next) => {

        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            itemPrice,
            taxPrice,
            shippingCharges,
            totalAmount
        } = req.body;
    
        const user = req.user._id;
    
        const orderOptions = {
            shippingInfo,
            orderItems,
            paymentMethod,
            itemPrice,
            taxPrice,
            shippingCharges,
            totalAmount,
            user
        }
    
        await Order.create(orderOptions)
        res.status(201).json({
            success: true,
            message: 'Order created successfully via cash on delivery'
        })
    }
)

export const placeOrderOnline = asyncError(
    async(req, res, next) => {

        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            itemPrice,
            taxPrice,
            shippingCharges,
            totalAmount
        } = req.body;
    
        const user = req.user._id;
    
        const orderOptions = {
            shippingInfo,
            orderItems,
            paymentMethod,
            itemPrice,
            taxPrice,
            shippingCharges,
            totalAmount,
            user
        }

        const option ={
            amount: Number(totalAmount)*100,
            currency: "INR"
        };
        const order = await instance.orders.create(option);
    
        res.status(201).json({
            success: true,
            order,
            orderOptions
        })
    }
)

export const paymentVerification = asyncError(async (req, res, next) =>{
    const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature,
        orderOptions
     } = req.body;

     const body = razorpay_order_id + "|" + razorpay_payment_id;
     const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body)
        .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;
        if(isAuthentic) {
            const payment = await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            })

            await Order.create({
                ...orderOptions,
                paidAt: new Date(Date.now()),
                paymentInfo: payment._id
            })

            res.status(201).json({
                success: true,
                message: `Order created successfully.. payment id: ${payment._id}`
            })
        }else{
            return next(new ErrorHandler("payment failed", 400))
        }
})

export const getMyOrders = asyncError(async (req, res, next) =>{
    const orderlist = await Order.find({
        user: req.user._id
    }).populate("user", "name")
    res.status(200).json({
        success: true,
        orderlist
    })
})

export const getOrderDetails = asyncError(
    async (req, res, next) => {
        const order = await Order.findById({_id: req.params.id}).populate("user", "name")
        if(!order) { 
            return next(new ErrorHandler("invalid order id", 404))
        }

        res.status(200).json({
            success: true,
            order
        })
    }
)

export const getAdminOrders = asyncError(async (req, res, next) =>{
    const orderlist = await Order.find({}).populate("user", "name")
    res.status(200).json({
        success: true,
        orderlist
    })
})

export const processOrder = asyncError(async (req, res, next) =>{
    const order = await Order.findById({_id: req.params.id}).populate("user", "name")
        if(!order) { 
            return next(new ErrorHandler("invalid order id", 404))
        }

        if(order.orderStatus === "preparing") order.orderStatus = "shipped";
        else if(order.orderStatus === "shipped"){
            order.orderStatus = "delivered";
            order.deliveredAt= new Date(Date.now())
        }else if(order.orderStatus === "delivered"){
            return next(new ErrorHandler("Food already delivered", 400))
        }
        await order.save();
    res.status(200).json({
        success: true,
        message: "Status updated successfully"
    })
})