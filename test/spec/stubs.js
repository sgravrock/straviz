(function () {
	window.google = {
		maps: {
			Map: function (parent, config) {
				this.parent = parent;
				this.config = config;
				this.listeners = {};

				this.fitBounds = function (bounds) {
					this.bounds = bounds;
				};

				google.maps.latestMap = this;
			},
			Polyline: function (config) {
				this.config = config;
				this.setMap = function (map) {
					map.latestLine = this;
				};
			},
			LatLng: function (lat, lng) {
				this.lat = function () { return lat; };
				this.lng = function () { return lng; };
			},
			LatLngBounds: function (sw, ne) {
				this.getSouthWest = function () { return sw; };
				this.getNorthEast = function () { return ne; };
			},
			Marker: function (config) {
				this.position = config.position;
				this.map = config.map;
				this.setPosition = function (position) {
					this.position = position;
				};
				this.setMap = function (map) {
					this.map = map;
				};
				google.maps.latestMarker = this;
			},
			MapTypeId: {
				TERRAIN: "TERRAIN"
			},
			event: {
				addListenerOnce: function(map, event, listener) {
					map.listeners[event] = listener;
				}
			}
		}
	};

	window.MG = {
		data_graphic: function (config) {
			this.configs.push(config);
		},
		configs: []
	};
}());
