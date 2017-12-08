import web_building_sim
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/calculate')
def browse():
	form = request.args

	# keys = ['floorArea', 'occupancy', 'units', 'age', 'avgEui']

	form = {k: form[k] for k in form if form[k] not in [None, '']}
	print(list(form.keys()))
	data = web_building_sim.mainFlow(form)

	response = jsonify(data)
	response.headers.add('Access-Control-Allow-Origin', '*')
	return response