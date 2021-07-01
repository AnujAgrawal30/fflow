require('dotenv').config();
require('./server/utils/i18n');

const tagLabel = 'Initialization routine';

const express                   = require('express');
const mongoose                  = require('mongoose');
const cors                      = require('cors');
const compression               = require('compression');
const bodyParser                = require('body-parser');
const helmet                    = require('helmet');
const { RateLimiterMongo }      = require('rate-limiter-flexible');
const path                      = require('path');
const agenda                    = require('./server/services/agenda');
const Agendash                  = require('agendash');

const Rapyd = require('./server/services/rapyd');

global.api = {
    config: require('./server/config')
};

global.rapydClient = new Rapyd(process.env.RAPYD_CLIENT_PUBLIC, process.env.RAPYD_CLIENT_SECRET, process.env.ENV);

global.utilities = require('@growishpay/service-utilities');
global.utilities.githubHookExpress.init(process.env.GITHUB_HOOK_SECRET, ()=> process.exit());

utilities.notifier.init(process.env.ENV, process.env.SLACK_BOT_HOOK);

const dbConn = require('./server/utils/db');


dbConn
    .then(async db => {

        utilities.logger.info(`Successfully connected to MongoDB cluster.`, {tagLabel, env: process.env.ENV});
        await startAPIServer(db);
        return db;

    })
    .catch(error => {

        if (error && error.message && error.message.code === 'ETIMEDOUT') {

            utilities.logger.info('Attempting to re-establish database connection.', {tagLabel});
            mongoose.connect(process.env.DB_SERVER);

        } else {

            utilities.logger.error('Error while attempting to connect to database.', {error});
            if (process.env.ENV !== 'DEVELOPING')
                process.exit();

            utilities.logger.debug('Process exit avoided in DEVELOPING environment');

        }

    });

const rateLimiter           = require('./server/middlewares/rate-limiter');
const apiMiddleware         = require('./server/middlewares/api');
const maintenanceMiddleware = require('./server/middlewares/maintenance');
const agendaAuthMiddleware  = require('./server/middlewares/agenda-web-auth');

const app = express();

app.set('views', path.join(__dirname, 'public/app'));
app.set('view engine', 'html');
app.engine('html',require('ejs').renderFile);

app.disable('x-powered-by');

app.use(cors());
app.options('*', cors());

app.use(require('morgan')("combined", {"stream": utilities.logger.stream}));


app.use(
    "/worker/",
    agendaAuthMiddleware,
    Agendash(agenda, {title: `GW-V2-WORKER (${process.env.ENV.substring(0, 3)})`})
);

app.use(compression());
app.use(helmet());
app.use(bodyParser.json({limit: '5mb'}));


if (process.env.ENV === 'DEVELOPING') {

    app.post('/hooks/github', utilities.githubHookExpress.controller);
    utilities.logger.info("Webhook for Github available on /hooks/github", {tagLabel});

}

app.get('/app/edit-flow/:id', (req, res) => {
    res.render('edit-flow.html', { id: req.params.id });
});



app.use('/app', express.static('./public/app'));

//Sets API helper response functions like, resolve, forbidden, etc. and the chains continues next().
app.use(apiMiddleware);

//Checks if the API is in maintenance mode, if true, blocks the chain and returns a maintenance message. If is false: next().
app.use(maintenanceMiddleware);

app.get('/favicon.ico', (req, res) => res.status(204));


async function startAPIServer(db) {


    const globalRateLimiter = new RateLimiterMongo({
        storeClient: db.connection,
        keyPrefix: 'rateLimitsGlobal',
        points: 10, // 10 requests
        duration: 1, // per 1 second by IP
    });

    app.use(rateLimiter.getMiddleware(globalRateLimiter));

    await require('./server/routes')(app);

    app.use(function (error, req, res, next) {

        if (error) {

            utilities.logger.error("API ERROR NOT HANDLED", {error});
            res.status(400).json({code: 400, data: {} });

        }

        next();

    });

    app.listen(process.env.SERVER_PORT, async () => {

        utilities.logger.info('API server running.', {tagLabel, port: process.env.SERVER_PORT});

        await agenda.start();
        utilities.logger.info('Agenda loaded', {tagLabel});

        utilities.state.increment('restarts');
        utilities.state.set('APILastBootDate', new Date());



        if(process && typeof process.send === 'function') process.send('ready');

        if (process.env.ENABLE_RESTART_NOTIFICATION === 'true')
            utilities.notifier.send('API server running!', {env: process.env.ENV}, 'low');

    });

}