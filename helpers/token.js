const jwt = require('jsonwebtoken');

exports.generateToken = (payload,expired) => {
    return jwt.sign(payload, process.env.SECRET, {
        expiresIn: expired
    })
}