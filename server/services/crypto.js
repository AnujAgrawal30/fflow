if(!process.env.CRYPTO_SERVICE_SECRET)
    throw new Error('A CRYPTO_SERVICE_SECRET must be defined in .env');

const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = process.env.CRYPTO_SERVICE_SECRET;
const iv = crypto.randomBytes(16);

const encrypt = (text) => {

    if(!text)
        return "";

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return iv.toString('hex') + "|" +encrypted.toString('hex');

};

const decrypt = (rawString) => {

    if(!rawString)
        return "";

    const hash = {
        iv: (rawString.split("|"))[0],
        content: (rawString.split("|"))[1]
    };

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encrypt,
    decrypt
};