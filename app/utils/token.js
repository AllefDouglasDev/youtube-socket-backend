const jwt = require('jsonwebtoken');

const key = 'my_secret_key';

/** Verifica se o token é valido */
function verifyToken(token, callback) 
{
    jwt.verify(token, key, (err, data) => {
        if (err) {
            callback(false);
        } else {
            callback(data);
        }
    })
}

/** Retorna um jwt */
function createToken(data) 
{
    // Espirar token em 24h: { expiresIn: '1440m' }
    return jwt.sign({ data }, key);
}

const app = { verifyToken, createToken }

module.exports = app