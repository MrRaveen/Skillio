# app.py
from flask import Flask
import logging
from app import create_app
app = create_app()
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
if __name__ == '__main__':
    app.run(debug=True,threaded=True)