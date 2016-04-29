from __future__ import print_function  # In python 2.7
from flask import Flask, render_template, request
from googlemaps import googlemaps
import json
import logging
import sys
DEBUG = 'INFO'
gmaps = googlemaps.Client("AIzaSyDqlY2dyOTrvcYWBtvsibdsetN14fJcnL4")
app = Flask(__name__)

###########
# HELPERS #
###########


def log_config(log_level):
    # check how your script can write to /var/log since there are some permission issues
    logging.basicConfig(
            stream=sys.stdout,
            level=log_level,
            format='%(asctime)s | %(levelname)s | %(filename)s | %(lineno)s | %(message)s'
    )
log_config(DEBUG)


##########
# ROUTES #
##########

@app.route('/', methods=['GET', 'POST'])
def index():
    logging.info("Route: index")
    return render_template('index.html')


@app.route('/address', methods=['POST'])
def convert_address():
    logging.info("Route: convert_address")
    address = request.form['address']
    j = gmaps.geocode(address)[0]['geometry']['location']
    logging.info("Address: %s | Coordinates: %s" % (address, j))
    return json.dumps(j)


if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
