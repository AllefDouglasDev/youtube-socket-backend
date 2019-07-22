const jwt = require('jsonwebtoken');
const RoomController = require('../controller/room');

'use strict';

class Socket 
{
    constructor(app, socket) 
    {
        this.app = app;
        this.io = socket;
    }

    ensureToken(req, res, next) 
    {
        const bearerHeader = req.headers["authorization"];

        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        } else {
            res.sendStatus(403);
        }
    }

    verifyToken(token, callback) 
    {
        jwt.verify(token, 'my_secret_key', (err, data) => {
            if (err) {
                callback(false);
            } else {
                callback(data);
            }
        })
    }

    socketEvents() 
    {
        let that = this;
        let db = require('../db');
        let Vrt = db.Mongoose.model('vrt', db.YtSchema, 'vrt');
        this.io.on('connection', (socket) => {
            console.log("Conectou");

            socket.on("create-room", (data) => {
                let room = JSON.parse(data);

                socket.join(room.link);
            });

            socket.on("join-room", (data) => {
                let room = JSON.parse(data);

                socket.join(room.roomLink);
                
                if (!room.isLogged) {
                    new Vrt({
                        name: room.userName,
                        login: '',
                        password: '',
                        remember_token: '',
                    }).save();
                } else { /** código para usuário cadastrado */ }
            });

            socket.on("play", (data) => {
                let player = JSON.parse(data);
                socket.broadcast.to(player.room).emit("video", { function: 'play' });
            });

            socket.on("pause", (data) => {
                let player = JSON.parse(data);
                socket.broadcast.to(player.room).emit("video", { function: 'pause' });
            });

            socket.on("time", (data) => {
                let player = JSON.parse(data);
                socket.broadcast.to(player.room).emit("video", { function: 'time', duration: player.duration });
            });

            socket.on("change", (data) => {
                let player = JSON.parse(data);
                socket.broadcast.to(player.room).emit("video", { function: 'change', videoId: player.videoId });
            });

            socket.on('disconnect', () => {
                console.log("Desconectou");

                this.io.emit('exit', this.users);
            });
        });
    }
}

module.exports = Socket;