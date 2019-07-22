const jwt = require('jsonwebtoken');
const token = require('../utils/token');
const db = require('../db');

/** Modelo do banco de dados */
const Vrt = db.Mongoose.model('vrt', db.YtSchema, 'vrt');

/** Função de teste com acesso restrito com token */
const protected = (req, res) => {
    token.verifyToken(req.token, (data) => {
        if( data ) {
            res.json({
                test: 'this is protected',
                data: data
            })
        } else {
            res.sendStatus(403);
        }
    }); 
}

/** Cadastra um usuário */
const store = (req, res) => {
    Vrt.find({ login: req.body.email  }).lean().exec(function (e, data) {
        if (0 != data.length) {
            res.status(409).json({ success: false, error: 'email_already_exists' });
        } else {
            new Vrt({
                name: req.body.name,
                login: req.body.email,
                password: req.body.password,
                remenber_token: ""
            }).save();

            let user = { name: req.body.name, login: req.body.email };

            res.status(200).json({ success: true, status: "ok", user: user });
        }
    });
}

/** Busca um usuário pelo id */
const show = (req, res) => {
    let id = parseInt(req.params.id);

    res.json({ id: id, status: 200 }, 200);
}

/** Atualiza um usuário pelo id */
const update = (req, res) => {
    Vrt.findOneAndUpdate({ _id: req.params.id }, { name: "funciona sempre" }, function (err) {
        if(err) return console.log(err); 
        return res.status(200).json({ success: true });
    });
}

const UserController = { protected, store, show, update };

module.exports = UserController;