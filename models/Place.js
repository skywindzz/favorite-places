var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var placeSchema = new Schema({
	name: String,
	address: String,
	city: String,
	state: String,
	zip: String
});

module.exports = mongoose.model('Place', placeSchema);