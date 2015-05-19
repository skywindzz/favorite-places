var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: String,
	email: String,
	favorite_places: [{type: Schema.Types.ObjectId, ref: 'Place'}]//referenced model
});

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