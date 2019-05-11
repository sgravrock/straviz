describe("App", function () {
	"use strict";
	var subject, loader,
			dom, mapRegion, eleRegion, speedRegion;

	beforeEach(function () {
		var dummyPromise = new Promise(function() {});
		loader = jasmine.createSpy("loader").and.returnValue(dummyPromise);

		dom = document.createElement("div");
		dom.innerHTML = '<div id="map"></div><div id="elevation-plot"></div>' +
				'<div id="speed-plot"></div>';
		mapRegion = dom.querySelector("#map");
		eleRegion = dom.querySelector("#elevation-plot");
		speedRegion = dom.querySelector("#speed-plot");
		// metricsgraphics requires the graph roots to be in the page DOM
		document.body.appendChild(dom);
		subject = new MBM.App(loader, dom);
	});

	afterEach(function () {
		document.body.removeChild(dom);
		document.body.classList.remove("loaded");
	});

	it("should load streams for the activity specified in the URL", function () {
		subject.start("?activity=12345");
		expect(loader).toHaveBeenCalledWith(
			"stream.cgi?activity=12345&stream=time"
		);
		expect(loader).toHaveBeenCalledWith(
			"stream.cgi?activity=12345&stream=latlng"
		);
		expect(loader).toHaveBeenCalledWith(
			"stream.cgi?activity=12345&stream=velocity_smooth"
		);
		expect(loader).toHaveBeenCalledWith(
			"stream.cgi?activity=12345&stream=altitude"
		);
	});

	it("should show an error when there is no activity parameter", function () {
		subject.start("");
		expect(dom.textContent).toEqual("Missing required activity parameter.");
	});

	describe("When all stream requests succeed", function () {
		beforeEach(function () {
			loader
				.withArgs(jasmine.stringMatching("stream=time"))
				.and.returnValue(Promise.resolve(JSON.stringify([
					{ type: "distance", data: [1, 2] },
					{ type: "time", data: [205, 625] },
				])));
			loader
				.withArgs(jasmine.stringMatching("stream=latlng"))
				.and.returnValue(Promise.resolve(JSON.stringify([
					{ type: "distance", data: [1, 2] },
					{ type: "latlng", data: [[47.62, -122.351], [47.598, -122.33]] },
				])));
			loader
				.withArgs(jasmine.stringMatching("stream=velocity_smooth"))
				.and.returnValue(Promise.resolve(JSON.stringify([
					{ type: "distance", data: [1, 2] },
					{ type: "velocity_smooth", data: [6.9, 5.3] },
				])));
			loader
				.withArgs(jasmine.stringMatching("stream=altitude"))
				.and.returnValue(Promise.resolve(JSON.stringify([
					{ type: "distance", data: [1, 2] },
					{ type: "altitude", data: [15.1, 8.2] },
				])));
			return subject.start("?activity=12345");
		});

		it("should show a map in the supplied region", function () {
			var map = google.maps.latestMap;
			expect(Map).toBeTruthy();
			expect(map.parent).toBe(mapRegion);
		});

		describe("After the map loads", function() {
			beforeEach(function() {
				google.maps.latestMap.listeners.idle();
			});

			it("sets a class on the root node", function() {
				expect(dom.classList).toContain('loaded');
			});
		});

		it("should show the track on the map", function () {
			var map = google.maps.latestMap;
			var path = map.latestLine.config.path;
			expect(path.length).toEqual(2);
			expect(path[0].lat()).toEqual(47.62);
			expect(path[0].lng()).toEqual(-122.351);
			expect(path[1].lat()).toEqual(47.598);
			expect(path[1].lng()).toEqual(-122.33);
		});

		it("should fit the map to the data's bounds", function () {
			var map = google.maps.latestMap;
			expect(map.bounds.getSouthWest().lat()).toEqual(47.598);
			expect(map.bounds.getSouthWest().lng()).toEqual(-122.351);
			expect(map.bounds.getNorthEast().lat()).toEqual(47.62);
			expect(map.bounds.getNorthEast().lng()).toEqual(-122.33);
		});

		it("should show an elevation plot", function () {
			var config = MG.configs[0];
			expect(config).toBeTruthy("Elevation plot wasn't created");
			expect(config.target).toEqual("#elevation-plot");
			expect(config.x_accessor).toEqual("distance");
			expect(config.y_accessor).toEqual("elevation");
			expect(config.data.length).toEqual(2);
			expect(config.data[0].distance).toEqual(0);
			expect(config.data[0].elevation).toEqual(15.1);
			expect(config.data[1].distance).toBeCloseTo(1.81, 2);
			expect(config.data[1].elevation).toEqual(8.2);
		});

		it("should show a speed plot", function () {
			var config = MG.configs[1];
			expect(config).toBeTruthy("Speed plot wasn't created");
			expect(config.target).toEqual("#speed-plot");
			expect(config.x_accessor).toEqual("distance");
			expect(config.y_accessor).toEqual("MPH");
			expect(config.data.length).toEqual(2);
			expect(config.data[0].distance).toEqual(0);
			expect(config.data[0].MPH).toBeCloseTo(15.43, 2);
			expect(config.data[1].distance).toBeCloseTo(1.81, 2);
			expect(config.data[1].MPH).toBeCloseTo(11.86, 2);
		});

		describe("When the user mouses over either plot", function () {
			beforeEach(function () {
				MG.configs[0].mouseover(MG.configs[0].data[1], 1);
			});

			it("should show a marker on the map", function () {
				var pos = google.maps.latestMarker.position;
				expect(pos.lat()).toEqual(47.598);
				expect(pos.lng()).toEqual(-122.33);
			});

			describe("When the mouse moves to another point", function () {
				var firstMarker;

				beforeEach(function () {
					firstMarker = google.maps.latestMarker;
					MG.configs[0].mouseover(MG.configs[0].data[0], 0);
				});

				it("should move the marker", function () {
					expect(google.maps.latestMarker).toBe(firstMarker);
					var pos = google.maps.latestMarker.position;
					expect(pos.lat()).toEqual(47.62);
					expect(pos.lng()).toEqual(-122.351);
				});
			});

			describe("When the mouse moves out of the plot", function () {
				beforeEach(function () {
					MG.configs[0].mouseout();
				});

				it("should hide the marker", function () {
					expect(google.maps.latestMarker.map).toBe(null);
				});
			});
		});
	});

	describe("When any request fails", function () {
		beforeEach(function () {
			loader
				.withArgs(jasmine.stringMatching("stream=latlng"))
				.and.callFake(function() {
					return Promise.reject(new Error("nope"));
				});
			return subject.start("?activity=12345").then(function () {
				throw "Unexpected success";
			}, function () {
				// Expected
			});
		});

		it("should show an error in the map region", function () {
			expect(mapRegion.className).toEqual("error");
		});
	});
});
