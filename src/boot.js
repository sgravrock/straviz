(function () {
	var map = document.getElementById("map");
	var match = location.search.match(/^\?activity=([0-9]+)$/);

	if (match) {
		new App(loadUrl, map, "#plot").start(match[1]);
	} else {
		alert("Missing activity parameter");
	}
}());
