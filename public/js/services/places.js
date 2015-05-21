angular.module('FavoritePlaces').service('PlacesService', function($http, $q) {

	this.getPlaces = function(skip) {
		var deferred = $q.defer();

		var url = '/api/places';

		if (!skip) {
			skip = 0;
		}
		url += '?skip='+skip;

		$http({
			method: 'GET',
			url: url
		}).then(function(response) {
			deferred.resolve(response.data);
		});
		return deferred.promise;
	};

	this.addPlace = function(place) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: '/api/places',
			data: place
		}).then(function(response) {
			deferred.resolve(response.data);
		});
		return deferred.promise;
	};
});