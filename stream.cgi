#!/usr/bin/env python3

import cgi
import configparser
import re
import http.client

def getconfig():
	config = configparser.ConfigParser()
	config.read("straviz.ini")
	return config

def stream_path(stream_name, activity_id, access_token):
	return "/api/v3/activities/%s/streams/%s?access_token=%s&resource_state=3" % (activity_id, stream_name, access_token)

def hide_access_token(url):
	return re.sub('access_token=[^&]*', 'access_token=[redacted]', url)

def require_field(form, key):
	if key in form:
		return form[key].value
	else:
		print("Status: 400 Bad Request")
		print("Content-type: text/plain")
		print()
		print("Missing required '" + key + "' parameter")
		exit()

form = cgi.FieldStorage()
activity_id = require_field(form, "activity")
stream_name = require_field(form, "stream")
access_token = getconfig().get('straviz', 'access_token')
conn = http.client.HTTPSConnection("www.strava.com")
path = stream_path(stream_name, activity_id, access_token)
conn.request("GET", path)
response = conn.getresponse()

if response.status != 200:
	print("Status: 500 Internal Server Error")
	print("Content-type: text/plain")
	print()
	path = hide_access_token(path)
	print("Received a %d response for %s" % (response.status, path))
	exit()


print("Content-type: application/json")
print()
print(response.read().decode('utf-8'))
