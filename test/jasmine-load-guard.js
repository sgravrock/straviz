(function () {
	var jasmineBoot = window.onload;
	var failed = false;

	window.onerror = function () {
		failed = true;
	};

	window.onload = function () {
		window.onerror = null;

		if (failed) {
			document.body.innerText = "Specs failed to load. Check the console for details.";
		} else {
			jasmineBoot();
		}
	};
}());
