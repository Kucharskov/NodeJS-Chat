import state from './state';
const socket = io('/admins').connect('https://talk.kucharskov.pl/');

//Logowanie
$('#loginForm').submit(function(e){
	e.preventDefault();
	socket.emit('login', {username: state.domElements.login.val(), password: state.domElements.password.val()}, function(data){
		state.system.isUserLoggedIn = data;
		if(state.system.isUserLoggedIn) {
			$('#loginBody').fadeOut(250, function() {
				$('#adminBody').fadeIn(250);
				socket.emit('get data');
			});
		} else {
			state.domElements.login.addClass('is-invalid');
			state.domElements.password.addClass('is-invalid');
		}
	});
	return false;
});

//Inicjalizacja
socket.on('init', function() {
	state.system.isUserLoggedIn = false;
	state.domElements.login.val('');
	state.domElements.password.val('');
	state.domElements.table.html('');
	$('#loginBody').show();
	$('#adminBody').hide();
});

//Ładowanie danych
socket.on('load data', function(data) {
	if(state.system.isUserLoggedIn) {
		state.domElements.table.html('');
		state.domElements.table.append(data);
		
		//Bindowanie wiadomości
		$('.actions span.badge.send').on('click', function() {
			var id = $(this).parents('tr').attr('data-id');
			var message = prompt('Wiadomość: ');
			if(message) socket.emit('admin messaage', {id: id, message: message});	
		});
		
		//Bindowanie kickowania
		$('.actions span.badge.kick').on('click', function() {
			var id = $(this).parents('tr').attr('data-id');
			socket.emit('kick user', id);
			socket.emit('get data');
		});
	}
});

//Odświeżanie danych
socket.on('refresh data', function() {
	if(state.system.isUserLoggedIn) socket.emit('get data');
});