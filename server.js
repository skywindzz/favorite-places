var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var fs = require('fs');
var multer = require('multer');
//https://github.com/aws/aws-sdk-js
var aws = require('aws-sdk');

aws.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: 'us-west-1'
});

var EmailService = require('./EmailService');

var Place = require('./models/Place');
var User = require('./models/User');

var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/favorite-places';

mongoose.connect(uristring);

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

passport.use(new TwitterStrategy({
	consumerKey: 'qgT3gYCqZCTbyL5EVzcOMVL8R',
	consumerSecret: 'Qkp6wOagy4pnC87kjBlwEAbFQstLrlFADvpitZ4tYNdc9UjE7G',
	callbackUrl: 'http://localhost:8080/api/auth/twitter/callback'
}, function(token, tokenSecret, profile, done) {
	console.log(profile);
	User.findOne({ 'twitter.id': profile.id }, function(err, user){
		if (!user) {
			var user = new User();
			user.name = profile.displayName;
			user.twitter.id = profile.id;
			user.twitter.token = token;
			user.twitter.tokenSecret = tokenSecret;
			user.save(function(err, new_user) {
				if (!err) {
					return done(null, new_user);
				}
				done(err);
				console.log("can't create user", err);
			});
		}
		//check to see if token/tokenSecret have changed and save if necessary
		done(null, user);
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

var requireAuth = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).end();
	}
	console.log(req.user);
	next();
};

// if we stored "is_admin" on the user model, we could also limit access to endpoints for admin only
// var requireAdmin = function(req, res, next) {
// 	if (!req.user.is_admin) {
// 		return res.status(401).end();
// 	}
// 	next();
// }

var app = express();
app.use(session({secret: 'fav places are awesome', cookie: { maxAge: 60000 }}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(multer({ dest: './tmp/'}));

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
				return res.status(500).end();
			}

			//alert admin that we have a new user
			EmailService.send("Cahlan Sharp <cahlan@gmail.com>", "Cahlan Sharp <cahlan@devmounta.in>", "New user registered!", "A new user registered on the favorite-places app.\n\n"+
					"name: \n"+new_user.name+"\n"+
					"email: \n"+new_user.email);

			//send confirmation email to user
			EmailService.send(new_user.name+" <"+new_user.email+">", "Cahlan Sharp <cahlan@devmounta.in>", "Thanks for signing up!", "Thanks for signing up for my app.");
			
			return res.json(new_user);
		});
	})
});

app.post('/api/users/auth', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
	return res.json({message: "you logged in"});
});

app.get('/api/auth/twitter', passport.authenticate('twitter'));
app.get('/api/auth/twitter/callback', passport.authenticate('twitter', { 
	failureRedirect: '/#login', 
	successRedirect: '/#places' 
}));

app.get('/api/auth/logout', function(req, res) {
	req.logout();
	return res.redirect('/#login');
});

app.post('/api/users/me/favorite_places', requireAuth, function(req, res) {
	//grab the place
	Place.findOne({ _id: req.body._id }).exec().then(function(place) {
		if (!place) {
			return res.status(404).end();
		}
		//update the user with the favorite_place
		User.findOne({ _id: req.user._id }).exec().then(function(user) {
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

app.post('/api/users/me/profile_picture', requireAuth, function(req, res) {
	var file = req.files.photo;

	var s3_filename = req.user._id+'.'+file.extension;
	var s3_bucket_name = 'favorite-places-cahlan';
	var s3bucket = new aws.S3();

	fs.readFile(file.path, function(err, file_buffer) {
		var params =  {
			Bucket: s3_bucket_name, //folder name in amazon
			Key: s3_filename, //filename in amazon
			Body: file_buffer,
			ACL: 'public-read',
			ContentType: file.mimetype
		};
		s3bucket.putObject(params, function(s3_err, response) {
			console.log(response);
			User.findOneAndUpdate({_id: req.user._id}, {profile_picture: s3_bucket_name+'/'+s3_filename}, function() {
				return res.status(200).end();
			});
		});
	});


	//below if you want to save on your machine/server
	//var public_path = '/img/profiles/'+req.user._id+'.'+file.extension;
	// fs.rename(file.path, './public'+public_path, function() {
	// 	User.findOneAndUpdate({_id: req.user._id}, {profile_picture: public_path}, function() {
	// 		return res.status(200).end();
	// 	});
	// });
});

app.get('/api/users/me', requireAuth, function(req, res) {
	User
	.findOne({_id: req.user.id})
	.populate('favorite_places')
	.exec().then(function(user) {
		return res.json(user);
	});
});

app.get('/api/users', requireAuth, function(req, res) {
	User
	.find()
	.populate('favorite_places')
	.exec().then(function(users) {
		return res.json(users);
	});
});

app.delete('/api/users/:userId', requireAuth, function(req, res) {
	User.remove({ _id: req.params.userId }, function(err) {
		if (err) {
			console.log("can't delete user", err);
		}
		res.status(200).end();
	});
});

app.post('/api/places', requireAuth, function(req, res) {
	var place = new Place(req.body);
	place.save(function(err, new_place) {
		if (err) {
			console.log("can't create place", err);
		}
		res.json(new_place);
	});
});

app.get('/api/places', requireAuth, function(req, res) {
	Place
	.find()
	.sort('state')
	.limit(10)
	.skip(req.query.skip || 0)
	.exec().then(function(places) {
		return res.json(places);
	});
});

app.put('/api/places/:placeId', requireAuth, function(req, res) {
	Place.update(req.body, function(err) {
		if (err) {
			console.log("can't update place", err);
		}
		return res.json(req.body);
	});
});

app.delete('/api/places/:placeId', requireAuth, function(req, res) {
	Place.remove({ _id: req.params.placeId }, function(err) {
		if (err) {
			console.log("can't delete place", err);
		}
		res.status(200).end();
	});
});

app.listen(process.env.PORT || 8080);