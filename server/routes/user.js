import express from 'express'
import passport from 'passport'
import { myProfile, logout, getAdminUser, getAdminStats } from '../controllers/user.js'
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js'
const router = express.Router()

router.get('/googlelogin', passport.authenticate("google", {
    scope: ['profile']
}))

router.get('/login', passport.authenticate("google",{
    successRedirect: process.env.FRONTED_URL
}),
    (req,res,next) => {
        res.send("logged In")
})

router.get('/me', isAuthenticated, myProfile)
router.get('/logout', logout)

// Admin Routes
router.get('/admin/user', isAuthenticated, authorizeAdmin, getAdminUser)
router.get('/admin/stats', isAuthenticated, authorizeAdmin, getAdminStats)

export default router;