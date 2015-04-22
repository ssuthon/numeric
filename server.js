var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('underscore');

var players = {};

app.use(express.static('public'));

app.get('/', function(req, res){
	res.redirect('/game.html');
});

app.get('/start', function(req, res){
	nextTurn();
	res.send({result: 'ok'})
});

app.get('/stop', function(req, res){
	io.to('game').emit('client:stop');
	res.send({result: 'ok'})
});

app.get('/players', function(req, res){
	var _p;	//format players
	res.send(_p);
})

io.on('connection', function (socket) {
	var playerName = "";
	socket.on('game:join', function(data){
		socket.join("game");
		playerName = data.playerName;
		players[playerName] = 0;

		io.sockets.emit('console:player');
	})

	socket.on('game:answer', function(data){
		if(currentAnswer != -1 && data.answer == currentAnswer && players[playerName]){
			players[playerName] ++;
		}
	})
});

var currentAnswer = -1;

function nextTurn(){
	var a = qRand();
	var b = qRand();
	currentAnswer = a + b;
	io.to('game').emit('client:question', {a: a, b: b});
}

function qRand(){
	return Math.floor(Math.random() * 100);
}

server.listen(80);