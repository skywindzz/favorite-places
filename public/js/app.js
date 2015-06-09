var app = angular.module('FavoritePlaces', ['ngRoute']);

app.config(function($routeProvider, $httpProvider) {
	$routeProvider.when('/places', {
		templateUrl: '/templates/places.html',
		controller: 'PlacesCtrl',
		resolve: {
			places: function(PlacesService) {
				return PlacesService.getPlaces();
			}
		}
	}).when('/signup', {
		templateUrl: '/templates/signup.html',
		controller: 'SignupCtrl'
	}).when('/profile', {
		templateUrl: '/templates/profile.html',
		controller: 'ProfileCtrl',
		resolve: {
			me: function(UsersService) {
				return UsersService.me();
			}
		}
	}).when('/login', {
		templateUrl: '/templates/login.html',
		controller: 'LoginCtrl'
	}).otherwise({
		redirectTo: '/places'
	});

	$httpProvider.interceptors.push(function($location) {
		return {
			'responseError': function(res) {
				if (res.status === 401) {
					$location.path('/login');
				}
				return res;
			}
		}
	});
});