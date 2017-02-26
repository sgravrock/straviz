To set up:

1. Install node.js dependencies:
$ npm install

2. Run the Jasmine tests by opening test/SpecRunner.html in a browser.

3. Set up the Python environment. This works well for development:

$ python3 -m venv venv
$ source venv/bin/activate

For deployment under a real web server (nginx, apache, whatever), do this.
(Won't work with homebrew's python3):

$ pip3 install -r requirements.txt -t lib

4. Obtain a Strava access token and store it in straviz.json, like so:

{
	"access_token": "your access token goes here"
}

5. Obtain a Google Maps API key and store it in maps-apikey.
