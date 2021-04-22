const express = require('express')
const router = express.Router()
const passport = require('passport')





//@desc Auth with Inmstagra
//@route GET /auth/instagram
// router.get('/instagram', passport.authenticate('instagram', {scope:['profile']}));
router.get('/instagram', passport.authenticate('instagram', {scope: ['profile']}));



//@desc instagram auth callback
//@route GET /auth/instagram/callback
router.get('/instagram/callback', passport.authenticate('google', {failureRedirect:'/'}), (req,res)=> {
    res.redirect('/profile')
});


//@desc instagram auth logout
//@route GET /auth/logout
router.get('/logout', (req,res)=> {
    user = {};
    console.log("logging out ");
    res.redirect('/')

});

module.exports = router