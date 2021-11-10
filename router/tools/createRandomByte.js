let crypto  = require('crypto');
let format = require('biguint-format');

exports.createRandomBytes = (num)=>{
    let randomBytes = crypto.randomBytes(num);
    const hexValue = format(randomBytes,'hex')
    return hexValue;
}
