from datetime import datetime
import json

def index():
	# retrieving informatino
	testers = db(db.testers).select(orderby=db.testers.name)
	conditions = db(db.conditions).select(orderby=db.conditions.name)
	current_session = __get_current_session()
	all_sessions = db(db.sessions).select(orderby=~db.sessions.start_time)
	# returning data
	return dict(testers=testers, conditions=conditions, current_session=current_session, all_sessions=all_sessions)

def new_session():
	# closing previous session
	__end_session()
	# retrieving data
	subject_id = request.vars['subject_id']
	tester = request.vars['tester']
	condition = request.vars['condition']
	# adding new row
	db.sessions.insert(
		subject_id=subject_id, 
		tester_name=tester, 
		condition_name=condition,
		start_time=datetime.today()
	)
	__back_to_index()

def end_session():
	# ending session
	__end_session()
	# redirecting back to index session control page
	__back_to_index()

def current_session():
	current = __get_current_session()
	return_json = None
	if current:
		return_json = json.dumps({
			'subject_id' : current['subject_id'],
			'tester_name' : current['tester_name'],
			'condition_name' : current['condition_name']
		})
	return json.dumps(return_json)

''' START: Private auxiliary functions '''

def __back_to_index():
	redirect(URL('index'))

def __get_current_session():
	return db(db.sessions.end_time == None).select().last()

def __end_session():
	current_session = __get_current_session()
	if current_session:
		current_session.update_record(
			end_time=datetime.today()
		)