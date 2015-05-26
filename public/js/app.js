var app = angular.module('FavoritePlaces', ['ngRoute']);

app.config(function($routeProvider) {
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
	}).when('/login', {
		templateUrl: '/templates/login.html',
		controller: 'LoginCtrl'
	}).otherwise({
		redirectTo: '/places'
	});
});