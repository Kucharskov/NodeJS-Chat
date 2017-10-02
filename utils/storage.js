//Utils: storage.js
const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
const maxNameLen = 15;
let users = [];

function User() {
	this.username = '';
	this.color = colors[Math.floor(Math.random()*colors.length)];
	this.logged = false;
}

User.prototype.setUsername = function (username) {
	let checkname = username.trim().substring(0, maxNameLen);

	for(var user in users)
		if(users[user].username == checkname) return false;

	this.username = checkname;
	this.logged = true;
	return true;
}

User.prototype.setColor = function (color) {
	this.color = color;
}

module.exports = {
	addUser: function(id) {
		users[id] = new User();
	},

	createUser: function(username, color) {
		let user = new User();
		user.username = username;
		user.color = color;
		return user;
	},

	findUser: function(id) {
		if(users[id]) return users[id];
	},

	removeUser: function(id) {
		if(users[id]) delete users[id];
	},

	setUsername: function(id, username) {
		if(users[id]) return users[id].setUsername(username);
	},

	setColor: function(id, color) {
		if(users[id]) users[id].setColor(color);
	},

	countAll: function() {
		let guestCount = 0;
		let usersCount = 0;
		for(var user in users) {
			if(users[user].logged) usersCount++;
			else guestCount++;
		}
		return (guestCount > 0) ? usersCount + ' (' + guestCount + ' gości)' : usersCount;
	},
	
	getUsers: function() {
		let userlist = '';
		for(var user in users) {
			if(users[user].logged) userlist += '<span class="badge badge-' + users[user].color + '">' + users[user].username + '</span> ';
		}
		return (userlist === '') ? '<div class="alert alert-danger m-0" role="alert">Brak zalogowanych użytkowników</div>' : userlist;
	}
};