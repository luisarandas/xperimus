import os, json, boto3, uuid
from botocore.client import Config 
from botocore.exceptions import ClientError
from boto3.s3.transfer import S3Transfer
#from boto3.s3.connection import S3Connection

from time import localtime, strftime
from flask import Flask, render_template, request, redirect, url_for, flash, current_app
from flask_login import (
    LoginManager,
    login_user,
    current_user,
    login_required,
    logout_user,
)
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from passlib.hash import pbkdf2_sha256

#from wtform_fields import *
#from models import *
#from main import *

import numpy as np

# ~ heroku git:remote -a <name> // git push heroku master [on env]
# ~ heroku ps:scale web=1

# Check entrances => psql postgres://eajdbtaoaffwhp:c9e4b7ffa763731fffdd0af7ccd9c9888d78d1c29f1664d582d1a885e99779fa@ec2-54-217-243-19.eu-west-1.compute.amazonaws.com:5432/d8eaj48551fat3
# \dt - \d name - if not CREATE TABLE _tablenamevar_( -

# Configure app
app = Flask(__name__)
app.secret_key = "replace later"  # os.environ.get("SECRET")

# Initialize Flask-SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
ROOMS = ["1", "2", "3", "4"]

desktop = os.path.join(os.path.join(os.path.expanduser('~')), 'Desktop') 
#desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop') Windows

login = LoginManager(app)
login.init_app(app)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.route("/", methods=["GET", "POST"])
def index():

    #reg_form = RegistrationForm()

    # Update database if validation success

    #if reg_form.validate_on_submit():
        #username = reg_form.username.data
        #password = reg_form.password.data

        # Hash password
        #hashed_pswd = pbkdf2_sha256.hash(password)

        # Add user to DB
        #user = User(username=username, password=hashed_pswd)
        #db.session.add(user)
        #db.session.commit()

        #flash("Registered Succesfully. Please Login.", "success")
        #return redirect(url_for("login"))
    #print("yes: {}".format(request.headers))
    return render_template("index.html")#, form=reg_form)


### testing amazon
################################ boto3 is working
print(desktop)
'''
AWS_ACCESS_KEY = str(os.getenv("AWS_ACCESS_KEY"))
AWS_SECRET_ACCESS_KEY = str(os.getenv("AWS_SECRET_ACCESS_KEY"))
S3_BUCKET_NAME = str(os.getenv("S3_BUCKET_NAME"))


str(os.getenv("APP_SECRET_KEY"))

s3 = boto3.resource(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    config=Config(signature_version='s3v4')
)

objectname_string = '/k.png'
s3.Bucket(S3_BUCKET_NAME).download_file('teste.png', desktop+objectname_string)

ACCESS_KEY_ID = ''
ACCESS_SECRET_KEY = ''
BUCKET_NAME = ''

#data = open('teste.png', 'rb')
s3 = boto3.resource(
    's3',
    aws_access_key_id=ACCESS_KEY_ID,
    aws_secret_access_key=ACCESS_SECRET_KEY,
    config=Config(signature_version='s3v4')
)
#s3.Bucket(BUCKET_NAME).put_object(Key='teste.png', Body=data)
objectname_string = '/k.png'
s3.Bucket(BUCKET_NAME).download_file('teste.png', desktop+objectname_string)
#s3.Bucket(BUCKET_NAME).put_object(Key='novapasta/test.png', Body=data)

#for my_bucket_contents in s3.Bucket(BUCKET_NAME).objects.all():
#    print(my_bucket_contents)

#print(desktop)
'''

@socketio.on('connect')                                                         
def connect():    
    emit('message', request.sid)

@socketio.on('my-event')                                                         
def newmsg(data):   
    print(data)                                                               
    socketio.emit('message', {'heldslo': "Helldso"})    

##### Buffers - MOVE TO DOWN CTEX

@socketio.on('new-buffer')                                                         
def _bufferdata(data):   
    socketio.emit('new-buffer', data, broadcast=True, include_self=False)    
    #emit('my response', data, broadcast=True)

@socketio.on('buffer-qual')
def __bufferdata(data):
    socketio.emit('buffer-qual', data, broadcast=True, include_self=False) 

@socketio.on('play-buffer')
def __bufferdata(data):
    socketio.emit('buffer-play', data, broadcast=True, include_self=False) 

@socketio.on('struct-buffer-obj')
def metabuffer(data):
    socketio.emit('struct-buffer-obj', data, broadcast=True, include_self=False) 

@socketio.on('play-on-detect-file')
def __bufferdata(data):
    socketio.emit('play-on-detected-file', data, broadcast=True, include_self=False) 

@socketio.on('play-on-detect-worklet')
def __bufferdata(data):
    socketio.emit('play-on-detected-worklet', data, broadcast=True, include_self=False) 

#@socketio.on('play-on-region')
#def __bufferdata(data):
#    socketio.emit('play-on-regions', data, broadcast=True, include_self=False) 


###############################################################################################

#####  THE MASTER

@socketio.on('sttera-emitter-send')
def sttera_emitter_send(data):
    socketio.emit('sttera-receiver-receive', data, broadcast=True, include_self=False)

@socketio.on('sttera-emitter-ping')
def sttera_emitter_ping(data):
    for val in data:
        socketio.emit('sttera-ping-receive', "this", val)

@socketio.on('sttera-emitter-user-pool')
def sttera_emitter_ping(data):
    socketio.emit('sttera-user-pool-receive', "this", data)



#####  THE CLIENT

@socketio.on('sttera-mobile-send')
def sttera_mobile_send(data):
    print(data)
    socketio.emit('sttera-frommobile', data, broadcast=True, include_self=False)

###############################################################################################

    

if __name__ == "__main__":
    # Will always execute
    #app.run()
    socketio.run(app, debug=True) #No need with heroku

# WSGI interface for backend
# check short polling

# server handler for HTTP requests
# https://gist.github.com/dsmilkov/1b6046fd6132d7408d5257b0976f7864
