import os
import sys
import time
import socket
import json
import config
#import gluon.contrib.simplejson as json
from gluon.contrib.websocket_messaging import websocket_send
from xmlrpclib import ServerProxy

#server = ServerProxy('http://127.0.0.1:8000/testGeogebraApp/default/call/xmlrpc')
filename = os.path.join(request.folder, 'static', 'geointerface.html')

__current_user_name = config.TORNADO_USER
__current_ip = config.TORNADO_IP
__socket_port = config.TORNADO_PORT
__key = config.TORNADO_KEY
__socket_group_name = config.TORNADO_GROUP

# -*- coding: utf-8 -*-
### required - do no delete
def user(): return dict(form=auth())
def download(): return response.download(request,db)

def call():
    session.forget()
    return service()
### end requires

def index():
    session.problemNum = 1
    ##currProblem = B("Problem: ") + db(db.problemBank.id == session.problemNum).select()[0].text
    currProblem = db(db.problemBank.id == session.problemNum).select()[0].text
    
    
    chooseProcedure = SQLFORM.factory(Field('name', requires=IS_IN_DB(db, 'procedures.name', '%(name)s')))
    chooseProcedure.append(INPUT(_type="button",_value='Add Procedure', _onclick=chooseProcedure.REDIRECT_JS % URL('createNewProcedure'))) 
    chooseProcedure.append(INPUT(_type="button",_value='Delete Procedure', _onclick=chooseProcedure.REDIRECT_JS % URL('deleteProcedure'))) 
    ##chooseProcedure = SQLFORM.factory(Field('Procedure_Name', requires=IS_IN_DB(db, 'procedures.name')))
    chooseProcedure.vars.name = session.procedureLoaded

    if chooseProcedure.process(formname='chooseProc_form', keepvalues=True).accepted:
        session.procedureLoaded = chooseProcedure.vars.name


    chooseProcedure.attributes['_id'] = 'myform'
    chooseProcedure.element('select').attributes['_id'] = 'mycombo'
    submit = chooseProcedure.element('input',_type='submit')
    submit['_style'] = 'display:none;'

    viableSteps = db(db.procedures.name == session.procedureLoaded).select()
    sL = list()
    stepsLoaded = list()
    stepForms = list()   
    
    form = FORM("")
    form.append(INPUT(_type="button",_value='+', _onclick=form.REDIRECT_JS % URL('addStep', args=[0]))) 
    form.append(INPUT(_type="button",_value='-', _onclick=form.REDIRECT_JS % URL('deleteStep', args=[0]))) 
        ##form.add_button('submit', URL('createNewProcedure'))
    stepForms.append(form)
    stepsLoaded.append(stepForms[0])
    
    if len(viableSteps) > 0 and viableSteps[0].steps != None:        
        sL = viableSteps[0].steps
        for item in sL:                       
            currIndex = len(stepForms)
            form = FORM(item)
            form.append(INPUT(_type="button",_value='+', _onclick=form.REDIRECT_JS % URL('addStep', args=[currIndex]))) 
            form.append(INPUT(_type="button",_value='-', _onclick=form.REDIRECT_JS % URL('deleteStep', args=[currIndex]))) 
            ##form.add_button('submit', URL('createNewProcedure'))
            stepForms.append(form)
            stepsLoaded.append(stepForms[currIndex])
        ##stepsLoaded = OL(*sL)
    else:
        stepsLoaded = "blank"

    if session.currentStep:
        currStep = "Current Step: " + session.currentStep
    else:
        currStep = "Current Step: None"
        
    return dict(problem=B(currProblem), interface=chooseProcedure, steps=OL(stepsLoaded), currentStep=currStep)
    #return dict(problem=currProblem, interface=XML(open(filename).read()))

def addStep():
    index = int(request.args(0))
    viableSteps = db(db.procedures.name == session.procedureLoaded).select()
    sL = list()
    if len(viableSteps) > 0 and viableSteps[0].steps != None:
        sL = viableSteps[0].steps
    if session.currentStep:
        sL.insert(index, session.currentStep)
        db.procedures.update_or_insert(db.procedures.name == session.procedureLoaded, name=session.procedureLoaded, steps=sL)
    else:
        session.flash = 'There is no current step to add!'
    redirect(URL('index'))

def deleteStep():
    index = int(request.args(0))
    viableSteps = db(db.procedures.name == session.procedureLoaded).select()
    sL = list()
    if len(viableSteps) > 0 and viableSteps[0].steps != None:
        sL = viableSteps[0].steps
        sL.pop(index)
        db.procedures.update_or_insert(db.procedures.name == session.procedureLoaded, name=session.procedureLoaded, steps=sL)
        redirect(URL('index'))


def error():
    return dict()

def createNewProcedure():
    currProblem = db(db.problemBank.id == session.problemNum)
    cp2 = "Problem: " + currProblem.select()[0].text

    form = addProc()
    
    ## the error processing needs checked
    return dict(problem=cp2, interface=XML(open(filename).read()), form=form)

def deleteProcedure():
    db(db.procedures.name == session.procedureLoaded).delete()
    session.procedureLoaded = db(db.procedures.id > 0).select()[0].name
    redirect(URL('index'))

def updateCurrentStep():
    # TODO send trigger as parameter
    #step_json = db(db.currState.name=='menuOptions').select()[0].value
    #curr_trigger = json.loads(step_json)['trigger']
    curr_trigger = request.vars.trigger;
    callback = request.vars.callback;
    query = None
    if curr_trigger == 'all':
        query = db(db.procedures.origin == 'basic')
    else:
        query = db((db.procedures.trigger == curr_trigger) & (db.procedures.origin == 'basic')) #remove second condition when adding user generated procedures
    procedures = query.select() 
    procedures_names = create_javascript_procedure_array(procedures)
    return "%s(%s);" % (callback, procedures_names)

def executeEvent():
    request_object = request.vars.procedure_parameters
    websocket_send('http://' + __current_ip + ':' + __socket_port, request_object, 'mykey', 'applet')
    
    # return_val = server.executeEvent(request_object)
    # return "console.dir('server returned ' + '" + return_val + "');"

def executeSteps():
    steps = request.vars.steps
    websocket_send('http://' + __current_ip + ':' + __socket_port, steps, 'mykey', 'applet')

    # return_val = server.executeSteps(steps)
    # return "console.dir('server returned ' + '" + return_val + "');"

def pollForOptions():
    s = db(db.currState.name=='menuOptions')
    val2 = s.select()[0].value
    return val2
    ##return session.currentTrigger

def problems():
    pass

def resetState():
    db.currState.update_or_insert(db.currState.name=='menuOptions', name='menuOptions', value="")
    session.currentStep = None
    ##session.currentTrigger = None
    return 0

########################
## REMOTE PROCEDURE CALLS

## load options is called to save the trigger in the database
## TODO Remove this functions
@service.xmlrpc
def loadOptions(data):
    ''' DEPRECATED '''
    db.currState.update_or_insert(db.currState.name=='menuOptions', name='menuOptions', value=data)
    s2 = db(db.currState.name=='menuOptions')
    val = s2.select()[0].value
    # notifying interface
    websocket_send('http://' + __current_ip + ':' + __socket_port, data, 'mykey', __socket_group_name)
    return val


#########################
## MODEL MANIPULATIONS

##
def addProc():
    form = SQLFORM(db.procedures)
    if form.accepts(request, formname=None, onvalidation=process_procedure):
        #session.procedureLoaded = form.vars.name ##why is this not a database?
        return 'successCreateNewProcedure("%s");' % form.vars.name
    elif form.errors:
        return 'errorCreateNewProcedure(%s);' % create_json_representation(form.errors.items())
    
def removeProc():
    proc_name = request.vars.current_procedure
    db(db.procedures.name == proc_name).delete() 
    return 'successDeleteProcedure("%s")' % proc_name
    
def testProc():
    # What is supposed to be done here?
    return 0

#############

def addStepToProc():
    return 0
    
def removeStepFromProc():
    return 0

## updates the current step by getting users to specify which step they want the robot to perform
def updateCurrent():
    ## loads the current options from the database
    currJSON = db(db.currState.name=='menuOptions').select()[0].value
    currTrigger = json.loads(currJSON)['origin']
    possibleOptions = db(db.procedures.trigger==currTrigger, db.procedures.origin == 'basic').select()
    listOfNames = list()
    instantiatedActions = dict() ## a list of instantiated actions
    
    ## cycles through each option & assumes only one parameter for now
    for row in possibleOptions:
        if len(row.parameters) == 0:
            formattedStr = row.label
        else:
            if json.loads(currJSON).get(row.parameters[0]):
                currParameter = json.loads(currJSON)[row.parameters[0]]
            else: 
                currParameter = None
            parameterName = row.parameters[0]
            if (currParameter != None):
                formattedStr = row.label % {row.parameters[0] : currParameter}
            else:
                formattedStr = row.label % {row.parameters[0] : '______'}
        listOfNames.append(formattedStr)
        ##instantiatedActions.append(formattedStr : 
    
    
    ## allows students to choose action and optional parameter
    form = SQLFORM.factory(Field('name', requires=IS_IN_SET(listOfNames), label="Choose action"),
        Field('optionalParam', label="Parameter"))

    ## process the form
    if form.process(formname='step_form').accepted:
        ## update the current step
        selectedAction = form.vars.name
        enteredParameter = form.vars.optionalParam
        session.currentStep = {'action' : selectedAction, 'op' : enteredParameter} ## this is currently imperfect
        
        ## execute the step in the interface
        
        
        ##temporarily commenting this out
        ##for item in processedOptions:
        ##    if item['name'] == selectedAction:
        ##        selected = item
        ##session.currentStep = json.dumps(item)
        ##session.currentStep = item['name']
        ##executeEvent(session.currentStep)
        
        redirect(URL('index'))
    elif form.errors:
        response.flash = 'Form has errors'
    return form
    
#############

def printState():
    return 0
    
def testModel():
    return 0
    
##def resetState():
##    return 0

## database method to populate the basic actions in the database
def populateBasicActions():
    db.procedures.update_or_insert(db.procedures.name == 'moveDistance', 
        name = 'moveDistance', parameters=['distance'], displayLabel = 'Move', label = 'Move {0}', steps = None, trigger = 'robot', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'turnAngle', 
        name = 'Turn Angle', parameters=['angle'], displayLabel = 'Turn', label = 'Turn {0}', steps = None, trigger = 'robot', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'moveTo', 
        name = 'moveTo', parameters=['pointName'], displayLabel = 'Move to Point', label = 'Move to {0}', steps = None, trigger = 'point', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'turnTo', 
        name = 'turnTo', parameters=['pointName'], displayLabel = 'Turn to Point', label = 'Turn to {0}', steps = None, trigger = 'point', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'plotPoint', 
        name = 'plotPoint', parameters=[], displayLabel = 'Plot Point', label = 'Plot point', steps = None, trigger = 'robot', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'drawLineTo', 
        name = 'drawLineTo', parameters=['pointName', 'pointName2'], displayLabel = 'Draw Line Between Points', label = 'Draw line from {0} to {1}', steps = None, trigger = 'point', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'turnCardinal',
        name = 'turnCardinal', parameters=['direction'], displayLabel = 'Turn in a Direction', label = 'Turn {0}', steps = None, trigger = 'robot', origin = 'basic')
    db.procedures.update_or_insert(db.procedures.name == 'computeValue', 
        name = 'computeValue', parameters=['formula'], displayLabel = 'Compute Value', label = 'Compute value of {0}', steps = None, trigger = 'playingField', origin = 'basic')

'''
Controller for the mobile version of the application
'''
def mobile():
    # Obtaining user created procedures
    user_procedures = db(db.procedures.origin == __current_user_name).select()
    # Obtaining basic procedures
    basic_procedures = db(db.procedures.origin == 'basic').select()
    basic_proceduresJSON = "{"
    basic_proceduresJSON += ",".join([stringifyProcedure(p) for p in basic_procedures])
    basic_proceduresJSON += "}"
    # Obtaining problem and setting in session
    problems = db(db.problemBank).select() # TODO retrieve correct problem
    problem_text = problems[0].text
    current_problem = 0
    if session.problemNum:
        current_problem = session.problemNum
    else:
        session.problemNum = current_problem
    problemsJSON = "["
    problemsJSON += ",".join([stringifyProblem(p, "Default") for p in problems])
    problemsJSON += "]"
    # Returning values
    return dict(user_procedures=user_procedures, basic_procedures=basic_proceduresJSON, problems=problemsJSON, current_problem=current_problem, 
                ip=__current_ip, port=__socket_port, group_name=__socket_group_name)

def update_current_problem():
    session.problemNum = request.vars.index
    data = request.vars.data
    websocket_send('http://' + __current_ip + ':' + __socket_port, data, 'mykey', "applet")

def check_solution():
    #current_problem = db(db.problemBank.id == session.problemNum).select()[0]
    #currentProblemJSON = stringifyProblem(current_problem, "check")
    #return dict(problems=currentProblemJSON)
    session.problemNum = request.vars.index
    #data = currentProblemJSON
    data = request.vars.data
    websocket_send('http://' + __current_ip + ':' + __socket_port, data, 'mykey', "applet")

def lock_applet():
    session.problemNum = request.vars.index
    data = request.vars.data
    websocket_send('http://' + __current_ip + ':' + __socket_port, data, 'mykey', "applet")

def move_to_problem():
    session.problemNum = request.vars.index
    data = reques.vars.data
    websocket_send('http://' + __current_ip + ':' + __socket_port, data, 'mykey', "applet")

def move_to_next_problem():
    if session.problemNum:
        session.problemNum += 1
    else:
        session.problemNum = 0
    return alert()

def stringifyProcedure(procedure):
    json = '"'
    json += procedure.name
    json += '": {"label":"'
    json += procedure.label
    json += '",'
    json += '"parameters":['
    json += ",".join(['"' + p + '"' for p in procedure.parameters])
    json += '],'
    json += '"steps":['
    json += ",".join(['"' + s + '"' for s in procedure.steps])
    json += '],'
    json += '"trigger":"'
    json += procedure.trigger
    json += '",'
    json += '"origin":"'
    json += procedure.origin
    json += '"'
    json += '}'
    return json

def stringifyProblem(problem, message_type):
    json = '{"id":'
    json += str(problem.id)
    json += ','
    json += '"name":"'
    json += problem.name
    json += '",'
    json += '"type":"'
    json += problem.type
    json += '",'
    json += '"text":"'
    json += problem.text
    json += '",'
    json += '"prompts":['
    json += ",".join('"' + p + '"' for p in problem.prompts) if problem.prompts != None else ""
    json += '],'
    json += '"points":['
    json += ",".join(problem.points)
    json += '],'
    json += '"lines":['
    json += ",".join(problem.lines)
    json += '],'
    
    # Need to be careful of operator precedence, we had some problems when the ternary expression was NOT placed in brackets. I guess the "+" operator
    # has higher precedence than the ternary.
    json += '"solution":' + (problem.solution if problem.solution != None else "{}")
    
    json += ', "problemType":' + '"' + (problem.problemType if problem.problemType != None else "Default") + '"'
    
    json += ', "type":' + '"' + (message_type if message_type != None else '"Default"') + '"' + "}"
    #json += "}"

    return json
    
def get_procedure_steps():
    procedure_name = request.vars.name
    procedure = db(db.procedures.name == procedure_name).select()
    if len(procedure) > 0:
        str = "["
        str += ",".join(procedure[0].steps)
        str += "]"
        return str
    return "[]"

def update_procedure_steps():
    '''This method updates a procedure's steps'''
    procedure_name = request.vars.name
    procedure_steps = request.vars.steps
    db.procedures.update_or_insert(db.procedures.name == procedure_name, steps = procedure_steps)

'''
AUX FUNCTIONS
'''
def create_json_representation(form_errors):
    '''
    Creates a JSON representation of a dictionary of form
    errors, With the formula label_name:error_message
    '''
    str = "{"
    str += ",".join(["'" + k + "'" + ":" + "'" + v + "'" for k, v in form_errors])
    str += "}"
    return str

def create_javascript_procedure_array(object_list):
    array = "["
    array += ",".join(["{name:'" + item.name + "', displayLabel:'" + item.displayLabel + "', parameters: [" + ",".join(["'" + p + "'" for p in item.parameters]) + "]}" for item in object_list])
    array += "]"
    return array

def process_procedure(form):
    # TODO validate for repeated param names
    # TODO create label
    form.vars.parameters = form.vars.parameters.split(',') # parameters are received as CSV string. Separating them.
    form.vars.label = form.vars.name # TEMP using name as a label
    form.vars.origin = __current_user_name # TEMP setting current username

def test_message():
    websocket_send('http://' + __current_ip + ':' + __socket_port,'Hello from Web Sockets! Bye-bye polling!','mykey', __socket_group_name)
    return sys.version_info.__str__()

def test():
    return dict(helloworld="helloworld")

def adrin():
    return "adrin"