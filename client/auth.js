if (Meteor.isClient) {
	Template.loginForm.events({
		'submit #loginForm': function(e, t){
			e.preventDefault();

			var uname = t.find('#loginForm-name').value;
			var password = t.find('#loginForm-password').value;

			Meteor.loginWithPassword(uname, password, function(err){
				if(err) {
					alert(err);
				}
			})
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