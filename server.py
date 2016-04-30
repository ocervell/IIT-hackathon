from __future__ import print_function  # In python 2.7
from geopy.distance import vincenty
from geopy.distance import great_circle
from flask import Flask, render_template, request
from math import radians, cos, sin, asin, sqrt
from googlemaps import googlemaps
import json
import logging
import sys
import csv
import pprint
import math

DEBUG = 'INFO'
gmaps = googlemaps.Client("AIzaSyDqlY2dyOTrvcYWBtvsibdsetN14fJcnL4")
app = Flask(__name__)
pp = pprint.PrettyPrinter(indent=2)
globalLong = -87.628858
globalLat = 41.883734

# Get csv data
crime_csv = 'datasets/crimefinal.csv'
hos_csv = 'datasets/hosfinal.csv'
libraries_csv = 'datasets/librariesfinal.csv'
school_csv = 'datasets/schoolfinal.csv'
parks_csv = 'datasets/parksfinal.csv'
csv_paths = [crime_csv, hos_csv, libraries_csv, school_csv, parks_csv]

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
    global globalLat, globalLong
    address = request.form['address']
    response = gmaps.geocode(address)
    logging.info(response)
    coordinates = response[0]['geometry']['location']
    globalLat = coordinates['lat']
    globalLong = coordinates['lng']
    logging.info("Route: /address | Address: %s | Coordinates: %s" % (address, coordinates))
    return json.dumps(coordinates)


def haversine(lat1, lon1, lat2, lon2):
    p = 0.017453292519943295
    a = 0.5 - cos((lat2 - lat1) * p) / 2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2
    return 12742 * asin(sqrt(a))


def qof(_sch, _lib, _prk, _hsp, _crime):
    global globalqof
    _sch = (_sch/(4*math.pi))/0.4774
    _lib = (_lib/(4*math.pi))/0.159
    _prk = (_prk/(4*math.pi))/0.636
    _hsp = (_hsp/(4*math.pi))/0.079
    _crime = (_crime/(4*math.pi))/.9
    _qof = (5*((2*_sch)+_lib))+((_prk*10)/3)+((5*_hsp)/3)-(10*_crime)
    globalqof = _qof


@app.route('/ret_qof', methods=['POST'])
def ret_qof():
    global globalqof
    l = {'qof': globalqof}
    return json.dumps(l)


@app.route('/get_csv_values', methods=['POST'])
def get_csv_values():
    global globalLat, globalLong
    # From the circle center latitute, longitude and the circle radius,
    # get the points from each csv that are inside the circle
    max_lat = request.json['lat']
    lng = request.json['lng']
    radius = request.json['radius']
    markers = []
    for path in csv_paths:
        rows = read_csv(path)
        for row in rows:
            # Check if inside the circle
            dis = haversine(
                lon1=float(row['lng']),
                lat1=float(row['lat']),
                lon2=globalLong,
                lat2=globalLat)
            if dis < 1:
                markers.append({
                    'path': path.split('/')[-1],
                    'name': row['name'],
                    'lat': row['lat'],
                    'lng': row['lng']
                })

    pp.pprint(markers)

    _prk, _crime, _lib, _hos, _sch = 0, 0, 0, 0, 0
    for mark in markers:
        if mark['path'] == 'parksfinal.csv':
            _prk += 1
        elif mark['path'] == 'crimefinal.csv':
            _crime += 1
        elif mark['path'] == 'hosfinal.csv':
            _hos += 1
        elif mark['path'] == 'librariesfinal.csv':
            _lib += 1
        elif mark['path'] == 'schoolfinal.csv':
            _sch += 1

    print(_crime, _hos, _lib, _crime, _prk, _sch)
    qof(_crime=_crime, _hsp=_hos, _lib=_lib, _prk=_prk, _sch=_sch)

    return json.dumps(markers)

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
