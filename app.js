require('dotenv').config()
const express             = require('express');
const memoryCache         = require('memory-cache');
const knex                = require('knex');
const socket              = require('socket.io');
const path                = require('path');
const cookieParser        = require('cookie-parser');
const bodyParser          = require('body-parser');
const expressHandlebars   = require('express-handlebars');
const expressValidator    = require('express-validator');
const connectFlash        = require('connect-flash');
const expressSession      = require('express-session');
const passport            = require('passport');
const expressLocal        = require('passport-local');
const mongodb             = require('mongodb');
const mongoose            = require('mongoose');


//mongoose.connect('mongodb://localhost/loginapp',  { useNewUrlParser: true })
mongoose.connect('mongodb://localhost/'+process.env.CURRENT_DATABASE,  { useNewUrlParser: true })

// Routes or Controllers
var routes = require('./routes/index');
var users = require('./routes/users');
var property = require('./routes/property');
var apis = require('./routes/apis');

// Initialise Express.js
var app = express();

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Set static folder
// app.use(express.static(path.join(__dirname + '/assets', 'public')));
app.use('/assets', express.static('./public'));
app.use('/uploads', express.static('./uploads'));

// Sessions
app.use(expressSession({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Express Validator MiddleWare
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(connectFlash());

//Global variables for flash
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users.router);
app.use('/property', property);
app.use('/apis', apis);
app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { layout: false, url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

var cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__'+req.originalUrl || req.url
        let cacheBody = memoryCache.get(key)
        if(cacheBody) {

            console.log('========================')
            console.log('========NO CACHE========')
            console.log('========================')

            res.send(cacheBody)
            return
        } else {
            console.log('========================')
            console.log('========CACHE========')
            console.log('========================')
            res.send = (body) => {
                memoryCache.put(key, body, duration * 1000)
                res.sendResponse(body)
            }
            next()
        }
    }
}

// Set port
app.set('port', (process.env.PORT || 3000));
// socket.on('disconnect', function(){});

var server = app.listen(app.get('port'), function () {
    console.log('Server started listening on port# ' + app.get('port'));
});

var io = socket(server);

var userCount = 0;

io.on('connection', function (socket) {
    userCount++;
    io.sockets.emit('userCount', userCount);

    socket.on('chat', function (data) {
        io.sockets.emit('chat', data);
    });

    socket.on('addProperty', function (data) {
        io.sockets.emit('addProperty', data);
    });

    socket.on('disconnect', function () {
        userCount--;
        io.sockets.emit('userCount', userCount);
    });
});