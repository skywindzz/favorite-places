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
	}).otherwise({
		redirectTo: '/places'
	});
});