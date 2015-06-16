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

			Meteor.call('LoginProcedure', username, passwordHash, false, function(error, response) {
				if (error){
					if (error.error === 400){
						alert('we have got a problem!');
					}
				}else if (response[0] === 200) {
					spinner.spin(false);
					Meteor.loginWithToken(response[1], function(err){
						if(err){
							console.log(err);
						}
					});
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

			var target = document.body;
			var spinner = new Spinner().spin(target);

			Meteor.call('LoginProcedure', username, passwordHash, true, function(error, response) {
				if (error){
					if (error.error === 400){
						alert('we have got a problem!');
					}
				}else if (response[0] === 200) {
					spinner.spin(false);
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

	Template.auths.helpers({
		auths: function() {
			return Auths.find({username: Meteor.user().username}); // ДЫРИЩЕ
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