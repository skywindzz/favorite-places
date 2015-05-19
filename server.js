var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');

var Place = require('./models/Place');
var User = require('./models/User');


mongoose.connect('mongodb://localhost/favorite-places');


var app = express();
app.use(bodyParser.json());

app.post('/api/users', function(req, res) {
	var user = new User(req.body);
	user.save(function(err, new_user) {
		if (err) {
			console.log("can't create user", err);
		}
		res.json(new_user);
	});
});

app.post('/api/users/:userId/favorite_places', function(req, res) {
	//grab the place
	Place.findOne({ _id: req.body._id }).exec().then(function(place) {
		if (!place) {
			return res.status(404).end();
		}
		//update the user with the favorite_place
		User.findOne({ _id: req.params.userId }).exec().then(function(user) {
			user.favorite_places.push(place);
			user.save(function(err) {
				if (err) {
					console.log("can't add place to user");
				}
				return res.json(user);
			});
		});
	});
});

app.get('/api/users', function(req, res) {
	User
	.find()
	.populate('favorite_places')
	.exec().then(function(users) {
		return res.json(users);
	});
});

app.delete('/api/users/:userId', function(req, res) {
	User.remove({ _id: req.params.userId }, function(err) {
		if (err) {
			console.log("can't delete user", err);
		}
		res.status(200).end();
	});
});

app.post('/api/places', function(req, res) {
	var place = new Place(req.body);
	place.save(function(err, new_place) {
		if (err) {
			console.log("can't create place", err);
		}
		res.json(new_place);
	});
});

app.get('/api/places', function(req, res) {
	Place.find().exec().then(function(places) {
		return res.json(places);
	});
});

app.put('/api/places/:placeId', function(req, res) {
	Place.update(req.body, function(err) {
		if (err) {
			console.log("can't update place", err);
		}
		return res.json(req.body);
	});
});

app.delete('/api/places/:placeId', function(req, res) {
	Place.remove({ _id: req.params.placeId }, function(err) {
		if (err) {
			console.log("can't delete place", err);
		}
		res.status(200).end();
	});
});

app.listen(8080);