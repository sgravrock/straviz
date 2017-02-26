#!/usr/bin/env python

import cgi
form = cgi.FieldStorage()
print "Content-type: text/plain"
print
for k in form:
	print k, "=>", form[k]
