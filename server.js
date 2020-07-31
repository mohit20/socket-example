var app = require('express')();
var http = require('http');
var fs = require('fs');

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var PORT = process.env.PORT || 8080;
// Loading socket.io
var io = require('socket.io').listen(server);

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const users = {}

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[name] = socket
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', data => {
    if(data.receiver_name in users) 
      socket.broadcast.to(users[data.receiver_name].id).emit('chat-message', { message: data.message, name: getKeyByValue(users,socket) })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', getKeyByValue(users,socket))
    delete users[getKeyByValue(users,socket)]
  })
})

server.listen(PORT, (req, res) => {
    console.log("Server listening on port " + PORT);
});
