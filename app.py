import os
from time import localtime, strftime
from flask import Flask, render_template, redirect, url_for, flash
from flask_login import (
    LoginManager,
    login_user,
    current_user,
    login_required,
    logout_user,
)
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from passlib.hash import pbkdf2_sha256

from wtform_fields import *
from models import *
from main import *

# from flask_yarn import Yarn 

# python3 -m venv local_python_environment
# source local_py_env/bin/activate
# For (current machine env) pip install -r requirements.txt
# Get all dependencies pip3 freeze > requirements.txt

# ~ heroku git:remote -a <name> // git push heroku master [on env]
# ~ heroku ps:scale web=1

# Check entrances => psql postgres://eajdbtaoaffwhp:c9e4b7ffa763731fffdd0af7ccd9c9888d78d1c29f1664d582d1a885e99779fa@ec2-54-217-243-19.eu-west-1.compute.amazonaws.com:5432/d8eaj48551fat3
# \dt - \d name - if not CREATE TABLE _tablenamevar_( -

# Make the allocation part in rooms and then try webassembly
# Turn connection to secure, continue with python bindings
# Play music, and open microphone
# NOW CHECK LOGS, PROPERTIES AND SERVER SIDE W CHILL
# https://github.com/sicklincoln/MMLL/tree/master/Examples

# If you want to execute your function without generating a request to the server, then your function must be defined in JavaScript. Otherwise, you need to fire an HTTP request.

# Test flask deep learning - machine listening in JS and visualizations
# https://www.html5rocks.com/en/tutorials/audio/scheduling/
# https://www.youtube.com/watch?v=mrExsjcvF4o
# https://github.com/jnmaloney/WebGui

# Configure app
app = Flask(__name__)
app.secret_key = "replace later"  # os.environ.get("SECRET")

# Configure database
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgres://eajdbtaoaffwhp:c9e4b7ffa763731fffdd0af7ccd9c9888d78d1c29f1664d582d1a885e99779fa@ec2-54-217-243-19.eu-west-1.compute.amazonaws.com:5432/d8eaj48551fat3"
# os.environ.get("DATABASE_URL")
db = SQLAlchemy(app)

# Initialize Flask-SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
ROOMS = ["lounge", "news", "games", "coding"]
# Yarn(app)

# Configure flask login
login = LoginManager(app)
login.init_app(app)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


@app.route("/", methods=["GET", "POST"])
def index():

    reg_form = RegistrationForm()

    # Update database if validation success

    if reg_form.validate_on_submit():
        username = reg_form.username.data
        password = reg_form.password.data

        # Hash password
        hashed_pswd = pbkdf2_sha256.hash(password)

        # Add user to DB
        user = User(username=username, password=hashed_pswd)
        db.session.add(user)
        db.session.commit()

        flash("Registered Succesfully. Please Login.", "success")
        return redirect(url_for("login"))

    # return "<html><body><h1>Hello World</h1></body></html>"
    return render_template("index.html", form=reg_form)


@app.route("/login", methods=["GET", "POST"])
def login():

    login_form = LoginForm()

    # Allow user to login if validation success

    if login_form.validate_on_submit():
        user_object = User.query.filter_by(username=login_form.username.data).first()
        login_user(user_object)
        return redirect(url_for("chat"))

    return render_template("login.html", form=login_form)


@app.route("/chat", methods=["GET", "POST"])
# @login_required
def chat():
    # if not current_user.is_authenticated:
    #    flash("Please login.", "danger")
    #    return redirect(url_for("login"))

    return render_template(
        "chat.html", username=current_user.username, rooms=ROOMS
    )  # "Chat with me"


@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    flash("You have logged our successfully", "success")
    return redirect(url_for("login"))


################################ Testing

# Background process happening without any refreshing
# Now only printing
@app.route('/background_process')
def background_process_test():
    print("Hello")
    return "nothing"

# Open Microphone with other func


################################ Testing


@socketio.on("message")
def message(data):

    print(f"\n\n{data}\n\n")
    send(
        {
            "msg": data["msg"],
            "username": data["username"],
            "time_stamp": strftime("%b-%d %I:%M%p", localtime()),
        },
        room=data["room"],
    )
    # check python time API
    # emit("some-event", "this is a custom event message")


@socketio.on("join")
def join(data):
    join_room(data["room"])
    send(
        {"msg": data["username"] + " has joined the " + data["room"] + " room."},
        room=data["room"],
    )


@socketio.on("leave")
def leave(data):
    leave_room(data["room"])
    send(
        {"msg": data["username"] + " has left the " + data["room"] + " room."},
        room=data["room"],
    )


print("Xperimus Server Console Print.")

if __name__ == "__main__":
    # Will always execute
    app.run()
    # socketio.run(app, debug=True) No need with heroku

# WSGI interface for backend
# check short polling
