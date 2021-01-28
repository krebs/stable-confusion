#!/usr/bin/env node
/*!
 * app.js is the server component of Mediengewitter
 *
 * @author pfleidi
 * @author makefu
 *
 */

var Express = require('express');
var Log4js = require('log4js');
var Fs = require('fs');
var Ws = require('./lib/websocket.js');
var PORT = 8080;
var LOGFILE = __dirname + '/logs/Mediengewitter.log';
var logger = Log4js.getLogger('Mediengewitter');

/* 
 * set up the application
 */
var app = module.exports = Express();




app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(Express.bodyParser());
app.use(Express.cookieParser());
app.use(Express.methodOverride());
app.use(Express.session({'secret': 'aidsballs'}));
app.use(app.router);
app.use(Express.static(__dirname + '/public'));

app.use(Express.errorHandler({
    dumpExceptions: true,
    showStack: true 
  }));
logger.setLevel('DEBUG');
var server =require('http').createServer(app)
Ws.createWebsocketServer(server, logger);
logger.info('Mediengewitter server listening on port: ' + PORT);
server.listen(PORT)

/* Process Logging */

process.on('SIGINT', function () {
    logger.info('Got SIGINT. Exiting ...');
    process.exit(0);
  });

process.on('uncaughtException', function (err) {
    logger.fatal('RUNTIME ERROR! :' + err.stack);
  });
