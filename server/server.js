if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});

	var authToken = function(){
		var token = Accounts._generateStampedLoginToken();
		return [
			token,
			Accounts._hashStampedToken(token)
		];
	};

	var saveAuthToken = function(userId){
		return Meteor.wrapAsync(function(userId, tokens, callback){
			Meteor.users.update(userId, {
				$push: {
					'services.resume.loginTokens': tokens[1]
				}
			}, function(error){
				if (error){
					callback(new Meteor.Error(500, 'Couldnt save login token into user profile'));
				}else{
					callback && callback(null, [200,tokens[0].token]);
				}
			});
		})(userId, authToken());
	};

	Meteor.publish('auths', function(){
		return Auths.find()
	});
}

Meteor.methods({
	'LoginProcedure': function(username, passwordHash, isCordova){


		var user = Meteor.users.findOne({
			'$or': [
				{
					'username': username
				},
				{
					'emails.address': username
				}
			]
		});

		if (!user)
			throw new Meteor.Error(404, 'User no found');

		var optionPassword = {digest: passwordHash, algorithm: 'sha-256'};
		var checkPassword = Accounts._checkPassword(user, optionPassword);
		if (checkPassword.error)
			throw new Meteor.Error(403,'Password incorrect');

		if(isCordova) {
			return saveAuthToken(user._id);
		}
		else {
			var time = new Date();
			//time.setSeconds(time.getSeconds() - 90);
			Auths.remove({createdAt: {$lt: time}});

			Auths.insert({
				username: username,
				createdAt: new Date()
			});

			return saveAuthToken(user._id);
		}
	}
});