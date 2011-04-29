var httpServer = require('http').createServer(function(req, response){ /* Serve your static files */ })
httpServer.listen(8080);

nowjs = require("now");
everyone = nowjs.initialize(httpServer);
everyone.now.msg = "Hello World!";

// Allows you to type commands into the instance of node while its running.
var repl = require("repl");

queue = [];
players = {};

startGame = function(player1, player2) {  
  player1.opponent = player2;
  player2.opponent = player1;

  console.log("MATCH BETWEEN " + player1.user.clientId + " AND " + player2.user.clientId);
  var startPositions = [ { x: 1, y: 0, z: 1 },
                         { x: 1, y: 0, z: 15 } ];
  player1.now.startGame(startPositions, 0);
  player2.now.startGame(startPositions, 1);
}

findGame = function(player) {
  if (queue.length > 0) {
    var player2 = players[queue.splice(0,1)[0]];
    startGame(player, player2);
  } else {
    queue.push(player.user.clientId);
  }
}

everyone.connected(function() {
  players[this.user.clientId] = this;
  var player = players[this.user.clientId];
  findGame(this);
});

everyone.disconnected(function() {
  queue.remove(this.user.clientId);
  players[this.user.clientId] = null;
});

everyone.now.resetGame = function() {
  var player1 = players[this.user.clientId];
  startGame(player1, player1.opponent);
}

everyone.now.sendMsg = function(msg) {
  var player = players[this.user.clientId];
  if (player.opponent) {
    player.opponent.now.receiveMsg(msg);
  } else {
    player.opponent.now.receiveMsg("You aren't connected to anyone!");
  }
};

// Util for removing element from an array
Array.prototype.remove = function(e) {
  var t, _ref;
  if ((t = this.indexOf(e)) > -1) {
    return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
  }
};

repl.start("> ");