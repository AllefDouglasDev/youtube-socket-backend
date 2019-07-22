const mongoose = require('mongoose');
/** Conectando com o banco yt */
mongoose.connect('mongodb://localhost/yt');

const Room = new mongoose.Schema({
    level: String,
    password: String,
    link: String,
    deleted: Number,
    name: String,
    videoId: String
});

/** Criando esquema não relacional */
const ytSchema = new mongoose.Schema({
    name:String,
    login: String,
    password: String,
    remember_token: String,
    room: [Room]
    },{ collection: 'vrt' }
);

module.exports = { Mongoose: mongoose, YtSchema: ytSchema }