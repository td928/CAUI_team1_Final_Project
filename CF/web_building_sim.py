
'''
This is a script for web calls. A visuzliation app can call this by passing in key parameters. 
Sample call: python web_building_sim.py 50000 100 50 70 43

Return: a list of dictionary of top 700 peers and their details in Result folder

'''

# Take user input 
def askforInput():

	floorArea = sys.argv[1]
	Occupancy = sys.argv[2]
	Units = sys.argv[3]
	Age = sys.argv[4]
	AvgEUI = sys.argv[5]

	return [floorArea, AvgEUI, Occupancy, Units, Age, AvgEUI]

def getData():
	
	# Import
	import numpy as np
	import pandas as pd
	from datetime import datetime

	from sklearn import preprocessing
	from sklearn.cluster import KMeans
	from sklearn.metrics import silhouette_samples, silhouette_score
	from sklearn.mixture import GaussianMixture
	from sklearn.linear_model import LinearRegression

	# Ingest and process base data from LL84
	print("--- Ingesting and Processing Data from LL84 ---")
	url = "https://raw.githubusercontent.com/td928/CAUI_team1_Final_Project/master/merged-w-latlon.csv"
	df = pd.read_csv(url)

	# Create a Age feature based on Built Year
	df["age"] = 2017 - df['YearBuilt']

	# Create Average EUI of 2013, 2014, and 2015
	df["avgEUI"] = df[['EUI_2013', 'EUI_2014', 'EUI_2015']].mean(axis=1)

	# Create an Data Frame for only Multifamily Housing with Unique BBL
	total_df = df.dropna()[df.TYPE_2016 == 'Multifamily Housing']
	total_df = total_df.groupby("BBL").max().reset_index()

	print("--- Done Getting Data ---")

	return total_df

def findBBL(dist, bbl_dict, num_nb, input_list):
    
    '''
    This returns top n most similar BBL of each BBL
    Input: Pair-wise Distance Matrix, n = number of neighbours (max cannot exceed len(dist))
    Output: List of each BBL and its N closest neighbours
    '''
        
    for i in range(0, len(dist)):
        # insert BBL into dict as the key
        # find index of closest n BBL
        # extract the details of the closest n BBL
        # create dictionary element of each BBL and its closest neighbours
        building = dist[i]
        
        #[index of most clostest excluding itself, 2nd closest, 3rd closest ...]
        closest_idx = building.argsort()[-len(building):][::-1][-int(num_nb)-1:-1][::-1] 
        
        self_dict = {"floorArea" : input_list[0], 
        			"Occupancy": input_list[1],
        			"UnitsTotal": input_list[2], 
        			"Age": input_list[3],
        			"AvgEUI": input_list[4]}

        top_BBL = {"Self":self_dict,
                    "Neighbours":[bbl_dict[a] for a in closest_idx]}
        
    return top_BBL

def calAvgEUI(sim_BBL):
    
    '''This Calculates average EUI of all Neighbouring BBL'''
    
    EUI_array = np.array([sim_BBL['Neighbours'][i]['EUI_2016'] for i in range(0, len(sim_BBL['Neighbours']))])
    sim_BBL["NBAvgEUI"] = EUI_array.mean()
    sim_BBL["NBStdEUI"] = EUI_array.std()
    sim_BBL["NBMinEUI"] = EUI_array.min()
    sim_BBL["NBMaxEUI"] = EUI_array.max()
    
    return sim_BBL


def getSimilarity(total_df, num_nb, features, input_list):

	'''
	This returns a list of each BBL and its top N Most Similar Neighbours 
	'''

	# Create a Model DF
	model_df = total_df[features]
	model_df = model_df.set_index("BBL")

	# Normalize DFs
	from sklearn import preprocessing
	min_max_scaler = preprocessing.MinMaxScaler()
	input_list_fixed = min_max_scaler.fit_transform(np.array(input_list).reshape(1, -1))
	model_df_fixed = min_max_scaler.fit_transform(model_df)

	# Create a Pairwise Distance Matrix
	from sklearn.metrics.pairwise import euclidean_distances
	dist = euclidean_distances(np.array(input_list_fixed).reshape(1, -1), model_df_fixed)

	# Convert base dataframe into dictionary
	total_df = total_df.reset_index()
	bbl_dict = total_df.to_dict('index')

	# Find top N Similar Neighbours
	print("--- Finding the {} Most Similar Buildings ---".format(num_nb))
	sim_BBL = findBBL(dist, bbl_dict, num_nb, input_list)

	# Calculate Average EER among the most similar buildings
	print("--- Calculating EER Stats of The N Most Similar Buildings ---")
	sim_BBL = calAvgEUI(sim_BBL)

	return sim_BBL

def print_BBL(sim_BBL):

	print("\n")
	print("========= 2016 Stats Summary of 700 Peers ==========")
	print("Averge EUI: {}".format(sim_BBL["NBAvgEUI"]))
	print("STDEV EUI: {}".format(sim_BBL["NBStdEUI"]))
	print("MIN EUI: {}".format(sim_BBL["NBMinEUI"]))
	print("MAX EUI: {}".format(sim_BBL["NBMaxEUI"]))
	print("====================================================")
	print("\n")

	print("========= TOP 5 Buildings out of 700 Peers =========")

	for i in range(0, 4):
		print("Address: {}".format(sim_BBL["Neighbours"][i]["Address"]))
		print("EUI in 2016: {}".format(sim_BBL["Neighbours"][i]["EUI_2016"]))
		print("Avg EUI from 2013-2015: {}".format(sim_BBL["Neighbours"][i]["avgEUI"]))
		print("Floor Area in 2016: {}".format(sim_BBL["Neighbours"][i]["floorArea_2016"]))
		print("Number of Units: {}".format(sim_BBL["Neighbours"][i]["UnitsTotal"]))
		print("Occupancy: {}".format(sim_BBL["Neighbours"][i]["Occupancy"]))
		print("Building Age as of 2017: {}".format(sim_BBL["Neighbours"][i]["age"]))
		print("=======================================================")


def mainFlow():

	# Run the main workflow
	input_list = askforInput()
	total_df = getData()
	sim_BBL = getSimilarity(total_df, 700, ["BBL","floorArea_2016", "EUI_2016", "Occupancy", "UnitsTotal", "age", "avgEUI"], input_list)

	print("--- DONE ---")

	return sim_BBL

if __name__ == "__main__":

	try:
			# Import
		import numpy as np
		import pandas as pd
		from datetime import datetime
		import sys
		import pprint as pprint

		mainFlow()

	except Exception as ex:
		print(ex)
		print("--- Terminating the Program ---")


