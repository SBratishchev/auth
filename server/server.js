if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});

	Meteor.publish('auths', function(){
		return Auths.find()
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

	var validateSession = function (session) {
		if(Auths.findOne({_id: session})) {
			var dateCreate = Auths.findOne({_id: session}).createdAt;
			var curId = Auths.findOne({_id: session})._id;
		}
		else {
			return false;
		}

		var deadTime = new Date();
		deadTime.setSeconds(deadTime.getSeconds() - 120);


		if (deadTime > dateCreate) {
			Auths.remove({_id: curId});
			return false;
		}
		else {
			return true;

		}
	};
}

Meteor.methods({
	'LoginProcedure': function(username, passwordHash, isCordova, session){
		//valid
		if(isCordova) {
			var sessionValid = false;
		}
		else {
			var sessionValid = validateSession(session);
		}

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
			var id = session;
			if(!sessionValid) {
				var time = new Date();
				Auths.remove({createdAt: {$lt: time}});

				id = Auths.insert({
					username: username,
					createdAt: new Date(),
					auth: false
				});
			} else {
				if(Auths.findOne({_id: session}).auth) {
					console.log('second auth done!');
					var curId = Auths.findOne({_id: session})._id;
					Auths.remove({_id: curId});

					return saveAuthToken(user._id);
				}
			}

			return [403, id];
		}
	},
	'fingerPrintAuth': function(sessionKey) {
		if(!Auths.findOne({_id: sessionKey}).auth) {
			Auths.update({_id: sessionKey}, {$set: {auth:true}});
		}
	}
});