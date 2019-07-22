const app = require('express').Router()
const jwt = require('jsonwebtoken');
const socket = require('./socket');

const UserController = require('../controller/user');
const AuthController = require('../controller/auth');
const RoomController = require('../controller/room');

app.get('/', (req, res) => {
    res.send("Enjoy the silence...");
})

/** Realiza login no sistema e retorna o token */
app.post('/auth/login', AuthController.login)
/** Link protegido com token */
app.get('/protected', ensureToken, UserController.protected)
/** Verifica o token */
app.get('/auth/token', ensureToken, AuthController.verifyToken)
/** Cadastra um usuário */
app.post('/user', UserController.store)
/** Busca um usuário pelo id */
app.get('/user/:id', UserController.show)
/** Atualiza um usuário pelo id */
app.put('/user/:id', UserController.update)
/** Cria uma nova sala */
app.post('/room', RoomController.store)
/** Retorna todas as salas do usuário não deletadas*/
app.get('/room', ensureToken, RoomController.show)
/** Retorna a sala pelo Id */
app.get('/room/id/:id', ensureToken, RoomController.showById)
/** Atualiza uma sala */
app.put('/room/:id', ensureToken, RoomController.update)
/** Atualiza o videoId de uma sala */
app.put('/room/videoId/:link', RoomController.updateVideoId)
/** Deleta uma sala */
app.delete('/room/:id', ensureToken, RoomController.deleteRoom)
/** Pega um link válido para uma nova sala */
app.get('/room/link/new', RoomController.getValidRoomName)
/** Pega as informações de uma sala pelo link informado */
app.get('/room/link/:link', RoomController.getRoomByLink)
/** Verifica se a senha da sala está correta */
app.post('/room/auth', RoomController.verifyPass)
/** Verifica se se o usuário é o dono da sala */
app.get('/room/ownner/:link', ensureToken, RoomController.userOwnner)


/** Pega o token no header e passa pra frente */
function ensureToken (req, res, next)
{
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        if (!bearerToken ) {
            res.status(403).json({ error: 'token_not_provider' });
        } else {
            req.token = bearerToken;
            next();
        }
    } else {
        res.status(403).json({ error: 'token_not_provider' });
    }
}

module.exports = app;




