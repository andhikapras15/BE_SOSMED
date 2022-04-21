const crypto = require('crypto')

module.exports = (pasword) => {
    let hashing = crypto 
        .createHmac('sha256', 'yukbisayuk')
        .update(password)
        .digest('hex')
    return hashing
}