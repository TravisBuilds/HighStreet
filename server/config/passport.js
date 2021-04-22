const GoogleStrategy = require('passport-instagram').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL: '/auth/instagram/callback/'
    },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            const newUser = {
                instagramId: profile.id,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value

            }
            try {
                let user = await User.findOne({ instagramId: profile.id })
                if (user) {
                    done(null, user)
                } else {
                    user = await User.create(newUser)
                    done(null, user)
                }
            } catch (err) {
                console.error(err)
            }

        }

    ))
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}