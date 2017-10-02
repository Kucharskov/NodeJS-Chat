//Handler: eventHandler.js
const storage = require('../utils/storage');
const chat = require('../utils/chat');
const antyspam = require('../utils/antyspam');
const ipguard = require('../utils/ipguard')
const UserSystem = storage.createUser("System", "danger");

const eventHandler = function(io) {
	io.sockets.on('connection', function(socket) {
		console.log('Connected: Socket ' + socket.id + 'connected!');
		socket.emit('message', chat.createMsg(UserSystem, 'Witaj na czacie. Pamiętaj o zachowaniu kultury!', false));
		socket.emit('init');
				
		if(ipguard.addIP(socket.handshake.headers['x-real-ip'])) {
			storage.addUser(socket.id);
			antyspam.addAutor(socket.id);
		} else {
			socket.emit('message', chat.createMsg(UserSystem, 'Wykryto zbyt wiele połączeń z Twojego adresu IP!', false));
			ipguard.removeIP(socket.handshake.headers['x-real-ip']);
			socket.disconnect();
		}
		
		io.sockets.emit('get users', storage.countAll(), storage.getUsers());
				
		//Disconnect
		socket.on('disconnect', function(data) {
			console.log('Disconnected: Socket ' + socket.id + 'disconnected!');
			
			const user = storage.findUser(socket.id);
			if(user.logged) io.sockets.emit('message', chat.createMsg(UserSystem, 'Użytkownik <strong class="text-' + user.color + '">' + user.username + '</strong> pożegnał się z nami!', false));
			
			storage.removeUser(socket.id);
			antyspam.removeAutor(socket.id);
			ipguard.removeIP(socket.handshake.headers['x-real-ip']);
			
			io.sockets.emit('get users', storage.countAll(), storage.getUsers());
		});

		//User set
		socket.on('set user', function(username, callback) {
			if(!(callback instanceof Function)) return;
			if(storage.setUsername(socket.id, chat.escapeText(username))) {
				callback(true);
				
				const user = storage.findUser(socket.id);
				io.sockets.emit('get users', storage.countAll(), storage.getUsers());
				io.sockets.emit('message', chat.createMsg(UserSystem, 'Dołączył do nas użytkownik <strong class="text-' + user.color + '">' + user.username + '</strong>!', false));
			} else socket.emit('usererror');
		});

		//Send Message
		socket.on('send message', function(message) {
			const user = storage.findUser(socket.id);
			message = message.trim();
			if(message != "") {
				if(!antyspam.test(socket.id, message)) socket.emit('message', chat.createMsg(UserSystem, 'Nie powtarzaj się oraz nie rozsyłaj SPAMu!', false));
				else if(user.logged) io.sockets.emit('message', chat.createMsg(storage.findUser(socket.id), message, true));
			}
		});
	});
}

module.exports = eventHandler;