import os
import urllib2

# __path = os.path.join(request.folder, "static", "logs", "log.txt")
# Adrin changed the log file name from .txt to .csv throughout this file
__path = os.path.join(request.folder, "static", "logs", "log.csv")

def index():
	return dict()

def download():
	f = open(__path, "r")
	response.stream(__path, request=request, attachment=True, filename="log.csv")
	f.close();
	#redirect(URL('static', 'logs/log.csv'))

def erase():
	f = open(__path, "w")
	f.close();
	return "Logs erased..."

def log():
	data = urllib2.unquote(request.vars.data).decode('string-escape')
	if data:
		f = open(__path, "a+")
		f.write(data)
		f.close()
		return data
	else:
		return "No data was sent"