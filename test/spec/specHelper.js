(function () {
	"use strict";
	window.specHelper = {
		wrapGpx: function (contents) {
			var xmlText = '<?xml version="1.0" encoding="UTF-8"?> ' +
				'<gpx version="1.1" ' +
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
				'xmlns="http://www.topografix.com/GPX/1/1" ' +
				'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" ' +
				'xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">' +
				contents +
				'</gpx>';
	
			// This might not be portable.
			var doc = new DOMParser().parseFromString(xmlText, "text/xml");
			var error = doc.querySelector("parsererror");
			
			if (error) {
				throw new Error(error.textContent);
			}

			// trkpt elements in read GPX documents always have elevation, but it's a hassle
			// and a distraction to include them in all of our specs.
			Array.prototype.forEach.call(doc.querySelectorAll("trkpt"), function (trkpt) {
				var ele = trkpt.querySelector("ele");
				var txt;

				if (!ele) {
					ele = doc.createElement("ele");
					txt = doc.createTextNode("0");
					ele.appendChild(txt);
					trkpt.appendChild(ele);
				}
			});

			return doc;
		}
	};

	// Allow async specs to return promises rather than calling a done callback
	var depromisify = function (func) {
		return function (done) {
			var maybePromise = func();

			if (maybePromise && typeof maybePromise.then === "function") {
				maybePromise.then(done, done.fail.bind(done));
			} else {
				done();
			} // else assume that the test called the done function
		};
	};

	["it", "fit"].forEach(function (funcName) {
		var realFunc = window[funcName];

		window[funcName] = function(title, func) {
			realFunc(title, depromisify(func));
		};
	});

	var realBeforeEach = beforeEach;
	window.beforeEach = function (func) {
		realBeforeEach(depromisify(func));
	};

	beforeEach(function () {
		MG.configs = [];
	});
}());
