describe("Map", function () {
	"use strict";
	var map, mapRegion;

	beforeEach(function () {
		mapRegion = document.createElement("div");
		map = new Map(mapRegion, { lat: 47.5, lng: -122.3 }, false);
	});

	it("should create a Google Maps instance", function () {
		var gmap = map._map;
		expect(gmap.parent).toBe(mapRegion);
		expect(gmap.config).toEqual({
			center: { lat: 47.5, lng: -122.3 },
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			zoom:1,
			disableDefaultUI: false
		});
	});

	describe("showLine", function () {
		beforeEach(function () {
			map.showLine([
				{ lat: 47.62, lon: -122.351 },
				{ lat: 47.598, lon: -122.33 }
			]);
		});

		it("should draw the line on the map", function () {
			var config = map._map.latestLine.config;
			expect(config.path.length).toEqual(2);
			expect(config.path[0].lat()).toBeCloseTo(47.62, 4);
			expect(config.path[0].lng()).toBeCloseTo(-122.351, 4);
			expect(config.path[1].lat()).toBeCloseTo(47.598, 4);
			expect(config.path[1].lng()).toBeCloseTo(-122.33, 4);
		});
	});

	describe("fitBounds", function () {
		beforeEach(function () {
			map.fitBounds({
				minLat: 47.598,
				minLon: -122.33,
				maxLat: 47.62,
				maxLon: -122.351
			});
		});

		it("should call the underlying map's fitBounds with a LatLngBounds object", function () {
			var bounds = map._map.bounds;
			expect(bounds.constructor).toBe(google.maps.LatLngBounds);
			expect(bounds.getSouthWest().lat()).toBeCloseTo(47.598, 4);
			expect(bounds.getSouthWest().lng()).toBeCloseTo(-122.33, 4);
			expect(bounds.getNorthEast().lat()).toBeCloseTo(47.62, 4);
			expect(bounds.getNorthEast().lng()).toBeCloseTo(-122.351, 4);
		});
	});
});
