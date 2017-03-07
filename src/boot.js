(function () {
	var map = document.getElementById("map");
	var match = location.search.match(/(^\?|&)activity=([0-9]+)$/);

	if (match) {
		new App(loadUrl, map, "#elevation-plot", "#speed-plot").start(match[2]);
	} else {
		alert("Missing activity parameter");
	}
}());
