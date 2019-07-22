const routes = require('../routes');

class Config 
{
    constructor(app) 
    {
        // Setting .html as the default template extension
		app.set('view engine', 'html');
 
		// Initializing the ejs template engine
		app.engine('html', require('ejs').renderFile);
 
		// Telling express where it can find the templates
		app.set('views', (__dirname + '/../pages'));

		// Liberando acesso às rotas
		var cors = require('cors');
		app.use(cors());

		// Adicionando as rotas
		app.use('/api', routes)
    }
}

module.exports = Config;