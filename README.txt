To set up, either:

$ python3 -m venv venv
$ source venv/bin/activate

or (necessary for CGI, but might not work on OS X):

$ pip3 install -r requirements.txt -t lib

Then obtain a Strava access token and store it in straviz.json, like so:

{
	"access_token": "your access token goes here"
}
