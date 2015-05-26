var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var Place = require('./models/Place');
var User = require('./models/User');

passport.use(new LocalStrategy({
	usernameField: 'email'
}, function(email, password, done) {
	//define how we match user credentials to db values
	User.findOne({ email: email }, function(err, user){
		if (!user) {
			done(new Error("This user does not exist :)"));
		}
		user.verifyPassword(password).then(function(doesMatch) {
			if (doesMatch) {
				done(null, user);
			}
			else {
				done(new Error("Please verify your password and try again :)"));
			}
		});
	});
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

mongoose.connect('mongodb://localhost/favorite-places');


var app = express();
app.use(session({secret: 'fav places are awesome'}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());

app.post('/api/users', function(req, res) {
	User.findOne({ email: req.body.email }).exec().then(function(user) {
		//if we found a user, it's a duplicate
		if (user) {
			return res.status(400).json({message: "User with this email already exists :)"});
		}
		//if the user's password is too short ...
		if (req.body.password.length <= 2) {
			return res.status(400).json({message: "Your password must be longer than two characters :)"});
		}
		//otherwise, create the user
		var user = new User(req.body);
		user.save(function(err, new_user) {
			if (err) {
				console.log("can't create user", err);
			}
			res.json(new_user);
		});
	})
});

app.post('/api/users/auth', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
	return res.json({message: "you logged in"});
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
	Place
	.find()
	.sort('state')
	.limit(10)
	.skip(req.query.skip || 0)
	.exec().then(function(places) {
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