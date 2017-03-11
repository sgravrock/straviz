To set up:

1. Install node.js dependencies:
$ npm install

2. Set up the Python environment. This works well for development:

	$ python3 -m venv venv
	$ source venv/bin/activate

For deployment under a real web server (nginx, apache, whatever), do this.
(Won't work with homebrew's python3):

	$ pip3 install -r requirements.txt -t lib

3. Copy EXAMPLE-straviz.ini to straviz.ini.

4. Obtain a Strava access token and store it in straviz.ini.

5. Obtain a Google Maps API key and store it in maps-apikey.

6. Build everything: $ ./build

7. Run the Jasmine tests by opening test/SpecRunner.html in a browser.

8. Run the dev server: $ ./devserver

9. Visit http://localhost:8000/cgi-bin/fetchmerge.cgi?activity=<an activity ID>

10. To deploy via SCP, set deploy_dest in straviz.ini and run this: $ ./deploy
