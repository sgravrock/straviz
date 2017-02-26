describe("readGpx", function () {
	"use strict";

	it("should read the points from a simple GPX file", function () {
		var input = specHelper.wrapGpx('<trk>' +
			'<trkseg><trkpt /><trkpt /><trkpt /></trkseg>' +
			'</trk>');
		var track = readGpx(input);
		expect(track.points.length).toEqual(3);
	});

	it("should provide latitude and longitude", function () {
		var input = specHelper.wrapGpx('<trk><trkseg>' +
			'<trkpt lat="38.008537000" lon="-122.495045000"></trkpt>' +
			'</trkseg></trk>');
		var point = readGpx(input).points[0];
		expect(point.lat).toEqual(38.008537);
		expect(point.lon).toEqual(-122.495045);
	});

	it("should provide elevation", function () {
		var input = specHelper.wrapGpx('<trk><trkseg>' +
			'<trkpt><ele>8.1</ele></trkpt>' +
			'</trkseg></trk>');
		var point = readGpx(input).points[0];
		expect(point.elevation).toEqual(8.1);
	});

	it("should calculate bounds", function () {
		var input = specHelper.wrapGpx('<trk><trkseg>' +
			'<trkpt lat="38.008537000" lon="-122.495045000"></trkpt>' +
			'<trkpt lat="38.008530000" lon="-122.495070000"></trkpt>' +
			'</trkseg></trk>');
		var track = readGpx(input);
		expect(track.bounds()).toEqual({
			minLat: 38.00853,
			minLon: -122.49507,
			maxLat: 38.008537,
			maxLon: -122.495045
		});
	});

	it("should calculate cumulative distance to 1/100 mile", function () {
		var input = specHelper.wrapGpx('<trk><trkseg>' +
			'<trkpt lat="47.62" lon="-122.351"></trkpt>' +
			'<trkpt lat="47.598" lon="-122.33"></trkpt>' +
			'<trkpt lat="47.88" lon="-122.13"></trkpt>' +
			'</trkseg></trk>');
		var points = readGpx(input).points;
		expect(points[0].distance).toEqual(0);
		expect(points[1].distance).toEqual(1.81);
		expect(points[2].distance).toEqual(23.4);
	});

	it("should calculate speed", function () {
		var input = specHelper.wrapGpx('<trk><trkseg>' +
			'<trkpt lat="47.62" lon="-122.351"><time>2015-03-28T00:49:11Z</time></trkpt>' +
			'<trkpt lat="47.598" lon="-122.33"><time>2015-03-28T00:56:11Z</time></trkpt>' +
			'</trkseg></trk>');
		var points = readGpx(input).points;
		expect(points[0].speed).toEqual(0);
		expect(points[1].speed).toBeCloseTo(7.82, 2);
	});

	it("should not calculate a 0 speed when points coincide", function () {
		var input = specHelper.wrapGpx('<trk><trkseg>' +
			'<trkpt lat="47.62" lon="-122.351"><time>2015-03-28T00:49:11Z</time></trkpt>' +
			'<trkpt lat="47.598" lon="-122.33"><time>2015-03-28T00:56:11Z</time></trkpt>' +
			'<trkpt lat="47.598" lon="-122.33"><time>2015-03-28T00:56:15Z</time></trkpt>' +
			'</trkseg></trk>');
		var points = readGpx(input).points;
		expect(points[2].speed).toBeCloseTo(10.41, 2);
	});
});
