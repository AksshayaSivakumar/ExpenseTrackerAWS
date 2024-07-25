const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'secretkey');
        console.log('userId>>>>>', decoded.userId);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        console.log(req.user);
        next();
        
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

module.exports = {
    authenticate
};