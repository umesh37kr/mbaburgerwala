import express from 'express';
const router = express.Router();
import { isAuthenticated, authorizeAdmin } from '../middlewares/auth.js';
import { placeOrder, placeOrderOnline, paymentVerification, getMyOrders, getOrderDetails, getAdminOrders, processOrder } from '../controllers/order.js';

router.post("/createorder", isAuthenticated, placeOrder)
router.post("/createorderonline", isAuthenticated, placeOrderOnline)
router.post("/paymentverification", isAuthenticated, paymentVerification)
router.get("/myorder", isAuthenticated, getMyOrders)
router.get("/order/:id", isAuthenticated, getOrderDetails)

// add admin middleware
router.get("/admin/orders", isAuthenticated, authorizeAdmin, getAdminOrders)
router.get("/admin/order/:id", isAuthenticated, authorizeAdmin, processOrder)

export default router;