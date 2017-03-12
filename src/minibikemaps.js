(function () {
	require("es6-promise").polyfill(); // for phantomjs

	window.App = function (loader, mapRegion, elevationSelector, speedSelector) {
		this._loader = loader;
		this._mapRegion = mapRegion;
		this._elevationSelector = elevationSelector;
		this._speedSelector = speedSelector;
	};

	App.prototype.start = function (activityId) {
		var that = this;
		var isThumbnail = window.location.search.indexOf("view=thumbnail") !== -1;

		if (isThumbnail) {
			document.body.classList.add("thumbnail");
		}

		return that._loader("fetchmerge.cgi?activity=" + activityId)
			.catch(function (error) {
				that._mapRegion.classList.add("error");
				that._mapRegion.innerText = "Could not load " + url + ".";
				return Promise.reject(error);
			})
			.then(function (json) {
				var track = readStreams(JSON.parse(json));
				that.showMap(track, isThumbnail, function() {
					document.body.classList.add("loaded");
				});
				that.showElevationGraph(track);
				that.showSpeedGraph(track);
			})
			.catch(function (error) {
				console.error(error);
				return Promise.reject(error);
			});
	};

	App.prototype.showMap = function (track, isThumbnail, onload) {
		var center = {
			lat: 47.598,
			lng: -122.33
		};
		this._map = new Map(this._mapRegion, center, isThumbnail);
		this._map.fitBounds(track.bounds());
		this._map.showLine(track.points);

		if (onload) {
			this._map.onIdle(onload);
		}
	};

	App.prototype.showElevationGraph = function (track) {
		MG.data_graphic({
			data: track.points,
			height: 150,
			full_width: true,
			area: false,
			left: 100,
			target: this._elevationSelector,
			x_accessor: "distance",
			x_label: "Distance (miles)",
			y_accessor: "elevation",
			interpolate: "monotone",
			linked: true,
			linked_format: "%Y-%m-%d-%H-%M-%S",
			mouseover: this.graphMouseover.bind(this),
			mouseout: this.graphMouseout.bind(this)
		});
	};

	App.prototype.showSpeedGraph = function (track) {
		MG.data_graphic({
			data: track.points,
			height: 150,
			full_width: true,
			area: false,
			left: 100,
			target: this._speedSelector,
			x_accessor: "distance",
			x_label: "Distance (miles)",
			y_accessor: "speed",
			interpolate: "monotone",
			linked: true,
			linked_format: "%Y-%m-%d-%H-%M-%S",
			mouseover: this.graphMouseover.bind(this),
			mouseout: this.graphMouseout.bind(this)
		});
	};

	App.prototype.graphMouseover = function (point, i) {
		this._map.showMarker(point);
	};

	App.prototype.graphMouseout = function (point, i) {
		this._map.hideMarker();
	};

	window.Map = function (parentEl, center, isThumbnail) {
		this._map = new google.maps.Map(parentEl, {
			disableDefaultUI: isThumbnail,
			center: center,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			zoom: 1
		});
	};

	Map.prototype.showLine = function (points) {
		var path = points.map(function (point) {
			return new google.maps.LatLng(point.lat, point.lon);
		});

		var line = new google.maps.Polyline({
			path: path,
			geodesic: true,
			strokeColor: "#0000FF",
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		line.setMap(this._map);
	};

	Map.prototype.fitBounds = function (bounds) {
		this._map.fitBounds(new google.maps.LatLngBounds(
			new google.maps.LatLng(bounds.minLat, bounds.minLon),
			new google.maps.LatLng(bounds.maxLat, bounds.maxLon)
		));
	};

	Map.prototype.showMarker = function (point) {
		var position = new google.maps.LatLng(point.lat, point.lon);

		if (this._marker) {
			this._marker.setPosition(position);
		} else {
			this._marker = new google.maps.Marker({
				map: this._map,
				position: position
			});
		}
	};

	Map.prototype.hideMarker = function (point) {
		this._marker.setMap(null);
		this._marker = null;
	};

	Map.prototype.onIdle = function(callback) {
		google.maps.event.addListenerOnce(this._map, 'idle', callback);
	};

	window.loadUrl = function (url) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.onload = function () {
				if (xhr.status === 200) {
					resolve(xhr.responseText);
				} else {
					reject("Unable to load " + url + ": " + xhr.status + " " + xhr.statusText);
				}
			};

			xhr.onerror = function () {
				reject("Unable to load " + url);
			};

			xhr.open("get", url);
			xhr.send();
		});
	};

	window.Track = function (points) {
		this.points = points;
	};

	Track.prototype.bounds = function () {
		var result = {
			minLat: 180,
			minLon: 180,
			maxLat: -180,
			maxLon: -180
		};

		this.points.forEach(function (point) {
			result.minLat = Math.min(result.minLat, point.lat);
			result.minLon = Math.min(result.minLon, point.lon);
			result.maxLat = Math.max(result.maxLat, point.lat);
			result.maxLon = Math.max(result.maxLon, point.lon);
		});

		return result;
	};

	var milesBetweenPoints = function (p1, p2) {
		// http://www.johndcook.com/python_longitude_latitude.html
		var distanceOnUnitSphere = function (lat1, lon1, lat2, lon2) {
			// Convert latitude and longitude to spherical coordinates in radians.
			var degreesToRadians = Math.PI / 180.0;
		
			// phi = 90 - latitude
			var phi1 = (90.0 - lat1) * degreesToRadians;
			var phi2 = (90.0 - lat2) * degreesToRadians;
				
			// theta = longitude
			var theta1 = lon1 * degreesToRadians;
			var theta2 = lon2 * degreesToRadians;
				
			// Compute spherical distance from spherical coordinates.
			// For two locations in spherical coordinates 
			// (1, theta, phi) and (1, theta, phi)
			// cosine( arc length ) = 
			//	sin phi sin phi' cos(theta-theta') + cos phi cos phi'
			// distance = rho * arc length
			
			var cos = Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) + 
				   Math.cos(phi1) * Math.cos(phi2);
			// Remember to multiply arc by the radius of the earth to get length.
			return Math.acos(cos);
		};
		
		var meanEarthRadiusInMiles = 3959;
		return distanceOnUnitSphere(p1.lat, p1.lon, p2.lat, p2.lon) * meanEarthRadiusInMiles;
	};
	

	var calculateDistances = function (points) {
		var i, total = 0;
		points[0].distance = 0;

		for (i = 1; i < points.length; i++) {
			total += milesBetweenPoints(points[i - 1], points[i]);
			// Round to two decimal places for display
			points[i].distance = Math.round(total * 100) / 100;
		}
	};

	var previousSpeedPoint = function (points, start) {
		var i;

		for (i = start - 1; i >= 0; i--) {
			if (points[i].distance < points[start].distance) {
				return points[i];
			}
		}

		return points[start - 1];
	};

	var calculateSpeed = function (points) {
		var KalmanFilter = require("kalmanjs").default;
		var filter = new KalmanFilter({ R: 0.05, Q: 3});
		var i, hours, prev, rawSpeed;
		points[0].speed = filter.filter(0);

		for (i = 1; i < points.length; i++) {
			prev = previousSpeedPoint(points, i);
			hours = (points[i].time - prev.time) / (60 * 60);
			rawSpeed = (points[i].distance - prev.distance) / hours;
			points[i].speed = filter.filter(rawSpeed);
		}
	};

	window.readStreams = function (streams) {
		var points = [];

		for (i = 0; i < streams.time.length; i++) {
			points.push({
				lat: streams.latlng[i][0],
				lon: streams.latlng[i][1],
				elevation: streams.altitude[i],
				time: streams.time[i]
			});
		}

		calculateDistances(points);
		calculateSpeed(points);

		return new Track(points);
	};
}());
