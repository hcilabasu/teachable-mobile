import os
import urllib2

__path = os.path.join(request.folder, "static", "logs", "log.txt")

def index():
	return dict()

def download():
	f = open(__path, "r")
	response.stream(__path, request=request, attachment=True, filename="log.txt")
	f.close();
	#redirect(URL('static', 'logs/log.txt'))

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