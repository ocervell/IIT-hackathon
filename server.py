from __future__ import print_function  # In python 2.7
from flask import Flask, render_template, request
from googlemaps import googlemaps
import json
import logging
import sys
import csv
import pprint
DEBUG = 'INFO'
gmaps = googlemaps.Client("AIzaSyDqlY2dyOTrvcYWBtvsibdsetN14fJcnL4")
app = Flask(__name__)
pp = pprint.PrettyPrinter(indent=2)

# Get csv data
crime_csv = 'datasets/crimefinal.csv'
hos_csv = 'datasets/hosfinal.csv'
libraries_csv = 'datasets/librariesfinal.csv'
school_csv = 'datasets/schoolfinal.csv'

csv_paths = [crime_csv, hos_csv, libraries_csv, school_csv]

###########
# HELPERS #
###########


def read_csv(filepath):
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f, fieldnames=['name', 'lat', 'lng'])
        return list(reader)


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
    logging.info("Route: /")
    return render_template('index.html')


@app.route('/address', methods=['POST'])
def convert_address():
    address = request.form['address']
    response = gmaps.geocode(address)
    logging.info(response)
    coordinates = response[0]['geometry']['location']
    logging.info("Route: /address | Address: %s | Coordinates: %s" % (address, coordinates))
    return json.dumps(coordinates)


@app.route('/get_csv_values', methods=['POST'])
def get_csv_values():
    # From the circle center latitute, longitude and the circle radius,
    # get the points from each csv that are inside the circle
    max_lat = request.json['lat']
    lng = request.json['lng']
    radius = request.json['radius']
    markers = []
    for path in csv_paths:
        rows = read_csv(path)
        for row in row:
            # Check if inside the circle
            markers.append({
                'path': path.split('/')[-1]
                'name': row['name'],
                'lat': row['lat'],
                'lng': row['lng']})
    pp.pprint(markers)
    return json.dumps(markers)

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
