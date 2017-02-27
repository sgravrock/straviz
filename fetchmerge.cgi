#!/usr/bin/env python3


import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), "lib"))
import grequests
import json
import cgi

def getconfig():
	with open("straviz.json") as f:
		return json.load(f)

def stream_url(stream_name, activity_id, access_token):
	return "https://www.strava.com/api/v3/activities/%s/streams/%s?access_token=%s&resource_state=3" % (activity_id, stream_name, access_token)

def merge(responses):
	result = {}
	for r in responses:
		parsed = r.json()
		for stream in parsed:
			result[stream['type']] = parsed
	return result

form = cgi.FieldStorage()

if "activity" not in form:
	print("Status: 400 Bad Request")
	print("Content-type: text/plain")
	print()
	print("Missing required 'activity' parameter")
	exit()

activity_id = form["activity"].value
access_token = getconfig()['access_token']
urls = [stream_url(s, activity_id, access_token)
	for s in ["time", "latlng", "velocity_smooth", "altitude"]]
requests = (grequests.get(u) for u in urls)
# TODO: attach an error handler as well to handle cases where the response
# will be None
responses = grequests.map(requests)

for i in range(0, len(responses)):
	if responses[i].status_code != 200:
		print("Status: 500 Internal Server Error")
		print("Content-type: text/plain")
		print()
		print("Received a %d response for %s" % (responses[i].status_code, urls[i]))
		exit()

result = merge(responses)

print("Content-type: application/json")
print()
json.dump(result, sys.stdout)
