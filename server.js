'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const socketEvents = require('./app/routes/socket');
const config = require('./app/utils/config');

class Server 
{
    constructor() 
    {
        this.port = process.env.PORT || 8081;
        this.host = 'localhost';

        this.app = express();
        this.http = http.Server(this.app);
        this.socket = socketIo(this.http);
    }

    /** Configurando sistema */
    appConfig() 
    {
        this.app.use(bodyParser.json());

        new config(this.app);
    }

    /** Incluindo os eventos de socket */
    includeSocket() 
    {
        new socketEvents(this.app, this.socket).socketEvents();
    }

    /** Função facade */
    appExecute() 
    {
        this.appConfig();
        this.includeSocket();

        this.http.listen(this.port, this.host, () => {
            console.log(`Listening on http://${ this.host }:${ this.port }`);
        })
    }
}

const app = new Server();
app.appExecute();