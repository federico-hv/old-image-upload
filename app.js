var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var socketio = require('socket.io'); //PARA SOCKET IO
var http = require('http'); //PARA SOCKET IO



var mongo = require('mongodb');
var monk = require('monk');
var db = monk('ec2-54-67-40-47.us-west-1.compute.amazonaws.com:28017/prueba80');


var routes = require('./routes/index');
var people = require('./routes/people');
var images = require('./routes/images');
var querys = require('./routes/querys');
var clientLoader = require('./routes/clientLoader');
var accountRecovery = require('./routes/accountRecovery');
var passwordChange = require('./routes/passwordChange');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));


//Log de la ip del solicitante

app.use(function (req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('Client IP:', ip);
  next();
});


app.use(function(req,res,next){
    req.db = db;
    next();
    //console.log("USER AGENT ----------> "+req.headers['user-agent']);
});

var imgDir = (__dirname+'/images/originals');


app.use(multipart({
    uploadDir: imgDir
}));


app.use('/', routes);
app.use('/people', people);
app.use('/images', images);
app.use('/querys', querys);
app.use('/clientLoader', clientLoader);
app.use('/accountRecovery', accountRecovery);
app.use('/passwordChange', passwordChange);





/**LINEAS DE SOCKET IO **/

var server = http.Server(app);
var io = socketio.listen(server);
var port = process.env.PORT || 3000;

server.listen(port, function(){
  console.log("Express server listening on port " + port);
});


//New versions: io.on('connection')

//Old versions: io.sockets.on('connection')

io.on('connection', function (socket) {
  console.log(("se ha conectado un usuario con socket.io").toUpperCase());
    socket.emit('connected');
    
    socket.on('disconnect',function(){
        console.log('Se desconectó un usuario!!!');
    });

    socket.on('refresh', function(){
        console.log('SE EMITIÓ UN REFRESH!!!');
        socket.broadcast.emit('update');
    });

    socket.on('nuevaPersona',function(data){
        console.log('SE SUMO UNA PERSONA');
        socket.broadcast.emit('newAppend',data);
    });

    socket.on('eliminarPersona',function(id){
        //console.log('EL ID DE LA PERSONA A ELIMINAR ES: '+id);
        socket.broadcast.emit('deletePerson',id);
    });

    socket.on('actualizarPersona',function(data){
        //console.log('EL ID DE LA PERSONA A ELIMINAR ES: '+id);
        socket.broadcast.emit('updatePerson',data);
    });

});


exports.sumarPersona = function(data){
    io.sockets.emit('newAppend',data);
};







// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
/**
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
**/


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    var e = new Error('The requested resource is not available through this URL.');
    res.render('error', {
        message: '',
        error: {status:'',stack:e,link:'http://approveit.biz'}
    });
});


module.exports = app;




