describe("App", function () {
	"use strict";
	var subject, loader, loadDeferred, mapRegion, eleSelector, speedSelector,
			startPromise, map, eleRoot, speedRoot;

	var Deferred = function () {
		this.promise = new Promise(function (resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
	};

	beforeEach(function () {
		loadDeferred = new Deferred();
		loader = jasmine.createSpy("loader").and.returnValue(loadDeferred.promise);
		mapRegion = document.createElement("div");
		eleSelector = "#ele-graph";
		eleRoot = document.createElement("div");
		eleRoot.id = "ele-graph";
		document.body.appendChild(eleRoot);
		speedSelector = "#speed-graph";
		speedRoot = document.createElement("div");
		speedRoot.id = "speed-graph";
		document.body.appendChild(speedRoot);
		subject = new App(loader, mapRegion, eleSelector, speedSelector);
		startPromise = subject.start("12345");
	});

	afterEach(function () {
		document.body.removeChild(eleRoot);
		document.body.removeChild(speedRoot);
	});

	it("should load the specified activity", function () {
		expect(loader).toHaveBeenCalled();
		expect(loader.calls.argsFor(0)[0]).toMatch(/cgi-bin\/fetchmerge.cgi\?activity=12345/);
	});

	describe("When the request succeeds", function () {
		beforeEach(function () {
			var response = {
				time: [205, 625],
				latlng: [[47.62, -122.351], [47.598, -122.33]],
				altitude: [15.1, 8.2]
			};
			loadDeferred.resolve(JSON.stringify(response));
			return startPromise;
		});

		it("should show a map in the supplied region", function () {
			var map = google.maps.latestMap;
			expect(Map).toBeTruthy();
			expect(map.parent).toBe(mapRegion);
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
			expect(config.target).toEqual("#ele-graph");
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
			expect(config.target).toEqual("#speed-graph");
			expect(config.x_accessor).toEqual("distance");
			expect(config.y_accessor).toEqual("speed");
			expect(config.data.length).toEqual(2);
			expect(config.data[0].distance).toEqual(0);
			expect(config.data[0].speed).toEqual(0);
			expect(config.data[1].distance).toBeCloseTo(1.81, 2);
			expect(config.data[1].speed).toBeCloseTo(7.82, 2);
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

	describe("When the request fails", function () {
		beforeEach(function () {
			loadDeferred.reject();
			return startPromise.then(function () {
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
