describe("loadUrl", function () {
	"use strict";
	var xhr, promise;

	beforeEach(function () {
		xhr = {
			open: jasmine.createSpy("open"),
			send: jasmine.createSpy("send")
		};

		spyOn(window, "XMLHttpRequest").and.returnValue(xhr);
		promise = MBM.loadUrl("someurl");
	});

	it("returns an unresolved promise", function (done) {
		var handler = jasmine.createSpy("handler");
		promise.then(handler, handler);
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				expect(handler).not.toHaveBeenCalled();
				resolve();
			});
		});
	});

	it("gets the requested URL", function () {
		expect(xhr.open).toHaveBeenCalledWith("get", "someurl");
		expect(xhr.send).toHaveBeenCalled();
	});

	describe("When the request succeeds with a 200 response", function () {
		beforeEach(function () {
			xhr.status = 200;
			xhr.responseText = "the response";
			xhr.onload();
		});

		it("resolves the promise to the response text", function () {
			return promise.then(function (result) {
				expect(result).toEqual("the response");
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

