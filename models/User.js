var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var q = require('q');

var userSchema = new Schema({
	name: String,
	email: { type: String, unique: true },
	twitter: { 
		id:  { type: String, unique: true },
		token: String,
		tokenSecret: String
	},
	password: String,
	favorite_places: [{type: Schema.Types.ObjectId, ref: 'Place'}]//referenced model
});

//pre('save') is mongoose middleware that runs before every user is created
userSchema.pre('save', function(next) {
	var user = this;
	//take password and encrypt it
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, function(err, hash) {
			console.log(hash);
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.verifyPassword = function(password) {
	var deferred = q.defer();
	var user = this;
	bcrypt.compare(password, user.password, function(err, res) {
		if (err) {
			deferred.resolve(false);
		}
		deferred.resolve(true);
	});
	return deferred.promise;
};

module.exports = mongoose.model('User', userSchema);

// In an embedded world, this creates two separate places
// {
// 	name: 'Cahlan Sharp',
// 	email: 'cahlan@gmail.com',
// 	favorite_places: [
// 		{
// 			name: 'Los Angeles',
// 			address: '555 Buena Vista Dr',
// 			state: 'CA',
// 			city: 'Los Angeles',
// 			zip: '90210'
// 		}
// 	]
// }

// {
// 	name: 'Barbara Liau',
// 	email: 'barbara@gmail.com',
// 	favorite_places: [
// 		{
// 			name: 'Los Angeles',
// 			address: '555 Buena Vista Dr',
// 			state: 'CA',
// 			city: 'Los Angeles',
// 			zip: '90210'
// 		}
// 	]
// }


//In a referenced world, the two users point to the same instance of Place (in a separate collection)
// {
// 	name: 'Cahlan Sharp',
// 	email: 'cahlan@gmail.com',
// 	favorite_places: [
// 		{_id: 'abc123'}
// 	]
// }

// {
// 	name: 'Barbara Liau',
// 	email: 'barbara@gmail.com',
// 	favorite_places: [
// 		{_id: 'abc123'}
// 	]
// }


// {
// 	_id: 'abc123',
// 	name: 'Los Angeles',
// 	address: '555 Buena Vista Dr',
// 	state: 'CA',
// 	city: 'Los Angeles',
// 	zip: '90210'
// }