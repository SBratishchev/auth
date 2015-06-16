if (Meteor.isClient) {

	Meteor._reload.onMigrate(function() {
		return [false];
	});

	Meteor.subscribe("auths");

	Template.loginForm.events({
		'click #loginForm-web': function(e, t){
			e.preventDefault();

			var username = t.find('#loginForm-name').value;
			var password = t.find('#loginForm-password').value;
			var passwordHash = Package.sha.SHA256(password);

			var target = document.body;
			var spinner = new Spinner().spin(target);
			var session = Meteor.storage.get('two-factor-auth-hash');

			if(!session) {
				session = null;
			}

			Meteor.call('LoginProcedure', username, passwordHash, false, session, function(error, response) {
				if (error){
					if (error.error === 400){
						alert('we have got a problem!');
					}
				} else if (response[0] === 200) {
					spinner.spin(false);
					Meteor.loginWithToken(response[1], function(err){
						if(err){
							console.log(err);
						}
					});
				} else if (response[0] === 403) {
					spinner.spin(false);
					Meteor.storage.set('two-factor-auth-hash', response[1]);
					console.log(response[1]);
				}
			});
		}
	});

	Template.loginForm.events({
		'click #loginForm-mobile': function(e, t){
			e.preventDefault();

			var username = t.find('#loginForm-name').value;
			var password = t.find('#loginForm-password').value;
			var passwordHash = Package.sha.SHA256(password);

			var session = null;

			Meteor.call('LoginProcedure', username, passwordHash, true, session, function(error, response) {
				if (error){
					if (error.error === 400){
						alert('we have got a problem!');
					}
				}else if (response[0] === 200) {
					Meteor.loginWithToken(response[1], function(err){
						if(err){
							console.log(err);
						}
					});
				}
			});
		}
	});

	Template.loginForm.helpers({
		isMobile: function() {
			return Meteor.isCordova;
		}
	});

	Template.logoutForm.events({
		'submit #logoutForm': function(e) {
			e.preventDefault();

			Meteor.logout(function(err) {
				if(err) {
					alert(err);
				}
			})
		}
	});

	Template.logoutForm.helpers({
		isMobile: function() {
			return Meteor.isCordova;
		}
	});

	Template.singupForm.events({
		'submit #singupForm': function (e, t) {
			e.preventDefault();

			Accounts.createUser({
				username: t.find('#singupForm-name').value,
				password: t.find('#singupForm-password').value,
				email: t.find('#singupForm-email').value
			}, function (err) {
				if (err) {
					alert(err);
				}
			})
		}
	});
}