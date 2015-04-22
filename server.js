var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('underscore');

var players = {};
var markedToStop = false;
var seq = 0;

app.use(express.static('public'));

app.get('/', function(req, res){
	res.redirect('/game.html');
});

app.get('/start', function(req, res){
	console.log('started.');
	seq = 0;
	markedToStop = false;
	_.each(players, function(v, k){ players[k] = 0; });
	nextTurn();
	res.send({result: 'ok'});
});

app.get('/stop', function(req, res){
	markedToStop = true;
	res.send({result: 'ok'});
});

app.get('/reset', function(req, res){
	io.sockets.emit('client:reset');	
	players = {};
	res.send({result: 'ok'});
})

app.get('/players', function(req, res){
	var _p = _.map(players, function(v, k){ return {name: k, score: v}});
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
		console.log(playerName +" sent " + JSON.stringify(data));
		if(currentAnswer != -1 && data.answer == currentAnswer && players[playerName] !== 'undefined'){
			players[playerName] ++;
			io.sockets.emit('console:player');

			if(!markedToStop){				
				nextTurn();
			}else{
				io.to('game').emit('client:stop');
			}
		}
	})
});

var currentAnswer = -1;

function nextTurn(){
	seq++;
	var a = qRand();
	var b = qRand();
	currentAnswer = a + b;
	console.log("currentAnswer = " + currentAnswer);
	io.to('game').emit('client:question', {a: a, b: b, seq: seq});
}

function qRand(){
	return Math.floor(Math.random() * 100);
}

server.listen(80);