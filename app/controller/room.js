const jwt = require('jsonwebtoken');
const token = require('../utils/token');
const db = require('../db');

/** Modelo do banco de dados */
const Vrt = db.Mongoose.model('vrt', db.YtSchema, 'vrt');

/** Cadastra uma sala */
const store = (req, res) => {
    let room = req.body.room;
    // Para usuários não cadastrados
    if (room.isLogged == false) {
        new Vrt({
            name: room.userName,
            login: '',
            password: '',
            remember_token: '',
            room: {
                level: "public",
                password: "",
                link: room.link,
                deleted: 0,
                name: room.roomName,
                videoId: ""
            }
        }).save().then((record) => res.status(200).json({ success: true }))
                 .catch((record) => res.status(500).json({ error: "server_error" }));
    } else { 
        // Para usuários cadastrados
        var decoded = jwt.decode(room.token);
        
        let newRoom = {
                        level: room.level,
                        password: room.roomPass,
                        link: room.link,
                        deleted: 0,
                        name: room.roomName,
                        videoId: ""
                    };

        Vrt.findOne({ _id: decoded.data.id }).then((record) => {
            if (null != record) {
                record.room.push(newRoom);
                record.save().then((response) => res.status(200).json({ success: true }))
                             .catch((response) => res.status(500).json({ error: "server_error" }));
            } else {
                return res.status(404).json({ success: false, error: "user_not_found" });                
            }
        });
    }
}

/** Busca todas as salas do usuário que não esteja deletada */
const show = (req, res) => {
    token.verifyToken(req.token, (data) => {
        if( data ) {
            var decoded = jwt.decode(req.token);

            Vrt.find({ _id: decoded.data.id, "room.deleted": 0 }, { room: 1 }).then(record => {
                if (0 < record.length) {
                    let r = record[0].room;
                    let rooms = [];
                    r.forEach(data => {
                        if (data.deleted === 0) rooms.push(data);
                    });

                    return res.status(200).json({ success: true, room: rooms });                
                } else {
                    return res.status(404).json({ success: false, error: "room_not_found" });
                }
            });
        } else {
            return res.status(404).json({ success: false, status: "invalid_token" });
        }
    }); 
}

/** Busca todas as salas do usuário que não esteja deletada */
const showById = (req, res) => {
    token.verifyToken(req.token, (data) => {
        if( data ) {
            var decoded = jwt.decode(req.token);
            Vrt.find({ _id: decoded.data.id, "room._id": req.params.id }, { room: 1 })
            .then(record => {
                if (0 < record.length) {
                    let r = record[0].room;
                    let room = [];
                    r.forEach(data => {
                        if (data._id.toString() === req.params.id.toString()) room.push(data);
                    });
                    if (0 < room.length) return res.status(200).json({ success: true, room: room });
                    
                    return res.status(404).json({ success: false, error: "room_not_found" });                
                } else {
                    return res.status(404).json({ success: false, error: "room_not_found" });
                }
            })
            .catch(err => {
                return res.status(404).json({ success: false, error: "room_not_found" });
            });
        } else {
            return res.status(404).json({ success: false, status: "invalid_token" });
        }
    }); 
}

/** Atualiza uma sala */
const update = (req, res) => {
    token.verifyToken(req.token, (data) => {
        if( data ) {
            var decoded = jwt.decode(req.token);
            
            let room = req.body.room;

            if (undefined == room) return res.status(404).json({ success: false, error: "room_not_provided" }); 

            let newRoom = {
                "room.$.level": room.level,
                "room.$.password": room.password,
                "room.$.link": room.link,
                "room.$.deleted": 0,
                "room.$.name": room.name,
            };

            Vrt.findOneAndUpdate({ _id: decoded.data.id, "room._id": req.params.id }, { $set: newRoom })
            .then(record =>  res.status(200).json({ success: true }))
            .catch(record => res.status(404).json({ success: false, error: "room_not_found" }));
        } else {
            return res.status(404).json({ success: false, error: "invalid_token" });        
        }
    }); 
}

/** Altera o campo deleted de uma sala para 1, que significa deletado */
const updateVideoId = (req, res) => {
    let videoId = req.body.videoId;
    Vrt.findOneAndUpdate({ "room.link": req.params.link }, { $set: { "room.$.videoId": videoId } })
    .then(record => res.status(200).json({ success: true }))
    .catch(record => res.status(404).json({ success: false, error: "room_not_found" }));
}

/** Altera o campo deleted de uma sala para 1, que significa deletado */
const deleteRoom = (req, res) => {
    token.verifyToken(req.token, (data) => {
        if( data ) {
            var decoded = jwt.decode(req.token);
            Vrt.findOneAndUpdate({ _id: decoded.data.id, "room._id": req.params.id }, { $set: { "room.$.deleted": 1 } })
            .then(record => res.status(200).json({ success: true, status: record }))
            .catch(record => res.status(404).json({ success: false, error: "room_not_found" }));
        } else {
            return res.status(200).json({ success: false, error: "invalid_token" });        
        }
    }); 
}

/** Verifica se o usuário passado é o dono da sala */
const userOwnner = (req, res) => {
    token.verifyToken(req.token, (data) => {
        if( data ) {
            var decoded = jwt.decode(req.token);
            Vrt.findOne({ _id: decoded.data.id, "room.link": req.params.link }, { room: 1 }).lean().exec(function (e, data) {
                if (null != data) {
                    return res.status(200).json({ success: true, status: "ok" });
                } else {
                    return res.status(200).json({ success: false, status: "user_not_ownner" });
                }
            });
        } else {
            res.sendStatus(403);
        }
    }); 
    
}

/** Verifica se a senha da sala é válida */
const verifyPass = (req, res) =>{
    Vrt.findOne({ "room.link": req.body.link }, { room: 1 }).lean().exec(function (e, data) {
        if (null != data) {
            data.room.forEach(r => {
                if (r.link == req.body.link ) {
                    if (r.password == req.body.password) {
                        return res.status(200).json({ success: true, status: "ok" });
                    } else {
                        return res.status(401).json({ success: false, status: "401", error: "invalid_password" });
                    }
                }
            });
        } 
    });
}

/** Retorna uma sala pelo link passado pra ela */
const getRoomByLink = (req, res) => {
    Vrt.findOne({ "room.link": req.params.link }, { room: 1 }).lean().exec(function (e, data) {
        if (null != data) {
            data.room.forEach(r => {
                if (r.link == req.params.link) {
                    let resRoom = {
                        level: r.level,
                        link: r.link,
                        name: r.name,
                        videoId: r.videoId
                    };

                    return res.status(200).json({ success: true, status: "ok", room: resRoom });
                }
            });
        } else {
            return res.status(404).json({ success: false, status: "error", error: "room_not_found" });
        }
    });
}

/** Valida se o nome da sala enviada já existe */
const getValidRoomName = (req, res) => {
    let randomLink = null;
    while (randomLink == null) {
        randomLink = randomRoomLink(10);
        isRoomLinkValid(randomLink, (link) => {
            randomLink = link;
            if (null != link) {
                res.status(200).json({ success: true, status: "ok", roomLink: randomLink });
            }
        });
    }
}

/** Retorna se o link passado já existe no banco */
const isRoomLinkValid = function(roomLink, callback) {
    Vrt.find({ "room.link":  roomLink  }).lean().exec(function (e, data) {
        if (0 != data.length) {
            callback(null);
        } else {
            callback(roomLink);
        }
    });
}

/** Cria um link randomicamente */
const randomRoomLink = function(len) {
    let passwd = ''
    do {
        passwd += Math.random().toString(30).substr(2)
    } while (passwd.length < len)

    passwd = passwd.substr(0, len)

    return passwd
}

const RoomController = {    store,
                            show, 
                            showById, 
                            getValidRoomName, 
                            getRoomByLink, 
                            verifyPass, 
                            userOwnner,
                            update,
                            updateVideoId,
                            deleteRoom 
                        };

module.exports = RoomController;