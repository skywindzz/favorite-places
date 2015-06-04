var email = require('emailjs');
var q = require('q');

var server  = email.server.connect({
   user:    "cahlan@devmounta.in", 
   password:"hithere", 
   host:    "smtp.mandrillapp.com",
   port:    587
});

module.exports = {
	send: function(to, from, subject, text) {
		var deferred = q.defer();
		server.send({
			text: text,
			from: from,
			to: to,
			subject: subject
		}, function(err, message) {
			if (err) {
				deferred.reject(err);
			}
			deferred.resolve(message);
		});
		return deferred.promise;
	}
};