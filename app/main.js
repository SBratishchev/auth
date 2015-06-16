if(Meteor.isCordova) {
	Template.auths.helpers({
		auths: function() {
			return Auths.find({username: Meteor.user().username}); // ДЫРИЩЕ
		}
	});

	Template.auths.events({
		'click .button': function(e, t){
			e.preventDefault();

			window.plugins.touchid.verifyFingerprint(
				'Scan your fingerprint please',
				function() {
					var key = t.find('.button').getAttribute('data-id');
					alert(key);
					Meteor.call('fingerPrintAuth', key);
				},
				function() {alert('not ok')}
			);
		}
	});


}