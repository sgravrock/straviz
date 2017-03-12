describe("readStreams", function () {
	"use strict";

	it("converts streams to points", function() {
		var input = {
			time: [205, 625],
			latlng: [[47.62, -122.351], [47.598, -122.33]],
			velocity_smooth: [6.3, 6.9],
			altitude: [15.1, 8.2]
		};
		var track = MBM.readStreams(input);
		expect(track.points.length).toEqual(2);
		expect(track.points[0].lat).toEqual(47.62);
		expect(track.points[0].lon).toEqual(-122.351);
		expect(track.points[0].elevation).toEqual(15.1);
		expect(track.points[0].time).toEqual(205);
		expect(track.points[0].MPH).toBeCloseTo(14.09, 2);
		expect(track.points[1].lat).toEqual(47.598);
		expect(track.points[1].lon).toEqual(-122.33);
		expect(track.points[1].elevation).toEqual(8.2);
		expect(track.points[1].time).toEqual(625);
		expect(track.points[1].MPH).toBeCloseTo(15.43, 2);
	});

	it("calculates bounds", function () {
		var input = {
			time: [0, 1],
			altitude: [0, 0],
			velocity_smooth: [0, 1],
			latlng: [
				[38.008537000, -122.495045000],
				[38.008530000, -122.495070000]
			],
		};
		var track = MBM.readStreams(input);
		expect(track.bounds()).toEqual({
			minLat: 38.00853,
			minLon: -122.49507,
			maxLat: 38.008537,
			maxLon: -122.495045
		});
	});

	it("calculates cumulative distance to 1/100 mile", function () {
		var input = {
			time: [0, 1, 2],
			altitude: [0, 0, 0],
			velocity_smooth: [0, 1],
			latlng: [
				[47.62, -122.351],
				[47.598, -122.33],
				[47.88, -122.13]
			]
		};
		var points = MBM.readStreams(input).points;
		expect(points[0].distance).toEqual(0);
		expect(points[1].distance).toEqual(1.81);
		expect(points[2].distance).toEqual(23.4);
	});
});
