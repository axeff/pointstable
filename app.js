var express = require('express.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var md5 = require('MD5');
var app = require('express.io')();
var bodyParser = require('body-parser')
var Mpg = require('mpg123')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
/*
var MongoClient = require('mongoose');
MongoClient.connect('mongodb://localhost/test');
var db = MongoClient.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

    console.log('YAY, Mongo connected');

});
*/

var routes = require('./routes/index');
var users = require('./routes/input');
var teams = require('./routes/teams');

app.http().io();

app.listen(3000);

/*
var teamsSchema = MongoClient.Schema({
    name: String,
    points: Number
});

var Team = MongoClient.model('Team', teamsSchema);


Team.find(function (err, teams) {
    if (err) return console.error(err);
    console.log(teams)
})

*/
var pointsStore = {};

var registeredInputs = [], registeredViewers = {};

app.io.route('registerInput', function(req){

    req.id = registeredInputs.length + 1;
    registeredInputs.push(req);
    var sendViewersToInputs = {};
    for (var i in registeredViewers) {
        sendViewersToInputs[md5(registeredViewers[i].handshake.address.address)] = {ip:registeredViewers[i].handshake.address.address};
    }
    req.io.emit('registeredViewers', sendViewersToInputs);
});

app.io.route('registerViewer', function(req){

    req.id = md5(req.handshake.address.address);
    registeredViewers[req.id] = req;
    var sendViewersToInputs = {};
    for (var hash in registeredViewers) {
        sendViewersToInputs[hash] = {ip:registeredViewers[hash].handshake.address.address};
    }

    for (var i in registeredInputs) {
        registeredInputs[i].io.emit('registeredViewers', sendViewersToInputs);
    }

});

app.io.route('unregisterViewer', function(req){
    delete(registeredViewers[md5(req.handshake.address.address)])
});

app.io.route('mirrorView', function(req){
    if (req.data.message.broadcast == true) {
        app.io.broadcast('mirror', req.data);
    } else {
        registeredViewers[req.data.message.id].io.emit('mirror', req.data);
    }
});

// Setup the points route, and emit broadcast.
app.io.route('names', function(req) {
    for (var key in req.data.message) {
        pointsStore[key] = req.data.message[key];
    }
    app.io.broadcast('game', {message:pointsStore});
});
app.io.route('goals', function(req) {
    for (var key in req.data.message) {
        if (typeof pointsStore['points' + key] == 'undefined'){
            pointsStore['points' + key] = 0;
        }
        pointsStore['points' + key] = eval(pointsStore['points' + key] + req.data.message[key]);
    }
    app.io.broadcast('game', {message:pointsStore});
});

// Setup the ready route, and emit talk event.
app.io.route('ready', function(req) {
    req.io.emit('game', {message: pointsStore});
});

app.io.route('time', function(req) {
    app.io.broadcast('time', req.data);

    if (req.data.message.mirrorPush) {
        app.io.broadcast('mirror', {message: {force: false}});
    }
});

//play buzz sound
app.io.route('buzzer', function(req) {
    var player = new Mpg().play('/home/pi/buzzer.mp3');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/input', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
