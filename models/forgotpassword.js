const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    active: {
        type: Boolean,
        required: true
    },
    expiresby: {
        type: Date,
        required: true
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Forgotpassword', forgotPasswordSchema);

