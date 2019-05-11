To set up:

1. Install node.js dependencies:
$ npm install

2. Copy EXAMPLE-straviz.ini to straviz.ini.

3. Obtain a Strava access token and store it in straviz.ini.

4. Obtain a Google Maps API key and store it in straviz.ini

5. Build everything: $ ./build

6. Run the Jasmine tests by opening test/SpecRunner.html in a browser.

7. Run the dev server: $ ./devserver

8. Visit http://localhost:8000/<an activity ID>/

9. To deploy via SCP, set deploy_dest in straviz.ini and run this: $ ./deploy
