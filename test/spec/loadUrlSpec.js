describe("loadUrl", function () {
	"use strict";
	var xhr, promise;

	beforeEach(function () {
		xhr = {
			open: jasmine.createSpy("open"),
			send: jasmine.createSpy("send")
		};

		spyOn(window, "XMLHttpRequest").and.returnValue(xhr);
		promise = loadUrl("somefile.xml");
	});

	it("should return an unresolved promise", function (done) {
		var handler = jasmine.createSpy("handler");
		promise.then(handler, handler);
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				expect(handler).not.toHaveBeenCalled();
				resolve();
			});
		});
	});

	it("should get the requested URL", function () {
		expect(xhr.open).toHaveBeenCalledWith("get", "somefile.xml");
		expect(xhr.send).toHaveBeenCalled();
	});

	describe("When the response is a valid XML file", function () {
		beforeEach(function () {
			xhr.status = 200;
			xhr.responseXML = {};
			xhr.onload();
		});

		it("should resolve the promise to the response XML", function () {
			return promise.then(function (result) {
				expect(result).toBe(xhr.responseXML);
			});
		});
	});

	describe("When the request fails", function () {
		beforeEach(function () {
			xhr.onerror();
		});

		it("should reject the promise", function () {
			return promise.then(function () {
				throw "Unexpected success";
			}, function () {
				// Expected.
			});
		});
	});

	describe("When the request succeeds with a non-200 response", function () {
		beforeEach(function () {
			xhr.status = 404;
			xhr.onload();
		});

		it("should reject the promise", function () {
			return promise.then(function () {
				throw "Unexpected success";
			}, function () {
				// Expected.
			});
		});
	});

});

