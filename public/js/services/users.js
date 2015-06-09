angular.module('FavoritePlaces').service('UsersService', function($http, $q) {

	this.me = function() {
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: '/api/users/me'
		}).then(function(res) {
			deferred.resolve(res.data);
		}).catch(function(res) {
			deferred.reject(res.data);
		});
		return deferred.promise;
	};

	this.signup = function(email, password) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: '/api/users',
			data:  {
				email: email,
				password: password
			}
		}).then(function(res) {
			deferred.resolve(res.data);
		}).catch(function(res) {
			deferred.reject(res.data);
		});
		return deferred.promise;
	};

	this.login = function(email, password) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: '/api/users/auth',
			data:  {
				email: email,
				password: password
			}
		}).then(function(res) {
			deferred.resolve(res.data);
		}).catch(function(res) {
			deferred.reject(res.data);
		});
		return deferred.promise;
	};
});