#!/usr/bin/env python3

import sys
import os
import cgi
import configparser

sys.path.insert(0, os.path.join(os.getcwd(), "lib"))
import pystache

def param_error():
	print("Status: 400 Bad Request")
	print("Content-type: text/plain")
	print()
	print("Missing required 'activity' parameter")
	exit()

def maps_apikey():
	config = configparser.ConfigParser()
	config.read("straviz.ini")
	return config.get("straviz", "maps_apikey")

form = cgi.FieldStorage()
try:
	activity_id = int(form['activity'].value)
except KeyError:
	param_error()
except ValueError:
	param_error()

thumbnail = 'thumbs/%d.png' % activity_id
if not os.path.exists(thumbnail):
	thumbnail = False

with open("index.tmpl") as f:
	output = pystache.render(f.read(), {
		'MAPS_APIKEY': maps_apikey(),
		'ACTIVITY_ID': activity_id,
		'thumbnail': thumbnail
	})
	print("Content-type: text/html")
	print()
	print(output)
