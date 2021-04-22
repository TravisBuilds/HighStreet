const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema ({
    instagramId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    image: {
        type: String,
       
    },
    createdAt: {
        type: String,
        default: Date.now
    },
    avatarLink: {
        type: String,
        default: ""

    }

})

module.exports = mongoose.model('User', UserSchema);