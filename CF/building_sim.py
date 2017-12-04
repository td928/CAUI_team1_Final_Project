
# Take user input 
def askforInput():

	return int(sys.argv[1])

# Setup
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
	
	'''
	url = "https://raw.githubusercontent.com/td928/CAUI_team1_Final_Project/master/merged-w-latlon.csv"
	df = pd.read_csv(url)

	# Create a Age feature based on Built Year
	df["age"] = 2017 - df['YearBuilt']

	# Create Average EUI of 2013, 2014, and 2015
	df["avgEUI"] = df[['EUI_2013', 'EUI_2014', 'EUI_2015']].mean(axis=1)

	# Create an Data Frame for only Multifamily Housing with Unique BBL
	total_df = df.dropna()[df.TYPE_2016 == 'Multifamily Housing']
	total_df = total_df.groupby("BBL").max().reset_index()
	'''

	total_df = pd.read_csv("https://raw.githubusercontent.com/td928/CAUI_team1_Final_Project/master/CF/cf_total_df.csv")

	#total_df.to_csv("cf_total_df.csv")

	print("--- Done Getting Data ---")

	return total_df

def findBBL(dist, bbl_dict, num_nb):
    
    '''
    This returns top n most similar BBL of each BBL
    Input: Pair-wise Distance Matrix, n = number of neighbours (max cannot exceed len(dist))
    Output: List of each BBL and its N closest neighbours
    '''
    
    top_BBL = []
    
    for i in range(0, len(dist)):
        # insert BBL into dict as the key
        # find index of closest n BBL
        # extract the details of the closest n BBL
        # create dictionary element of each BBL and its closest neighbours
        building = dist[i]
        
        #[index of most clostest excluding itself, 2nd closest, 3rd closest ...]
        closest_idx = building.argsort()[-len(building):][::-1][-int(num_nb)-1:-1][::-1] 
        
        top_BBL.append({"Self":bbl_dict[i],
                        "Neighbours":[bbl_dict[a] for a in closest_idx]})
        
    return top_BBL

def calAvgEUI(sim_BBL):
    
    '''This Calculates average EUI of all Neighbouring BBL'''
    
    for i in range(0, len(sim_BBL)):
		EUI_array = np.array([sim_BBL[i]['Neighbours'][j]['EUI_2016'] for j in range(0, len(sim_BBL[i]['Neighbours']))])
		sim_BBL[i]["NBAvgEUI"] = EUI_array.mean()
		sim_BBL[i]["NBStdEUI"] = EUI_array.std()
		sim_BBL[i]["NBMinEUI"] = EUI_array.min()
		sim_BBL[i]["NBMaxEUI"] = EUI_array.max()
		sim_BBL[i]["EER"] = sim_BBL[i]['Self']['EUI_2016'] / sim_BBL[i]["NBAvgEUI"]
    
    return sim_BBL


def getSimilarity(total_df, num_nb, features):

	'''
	This returns a list of each BBL and its top N Most Similar Neighbours 
	'''

	# Create a Model DF
	model_df = total_df[features]
	model_df = model_df.set_index("BBL")

	# Normalize DFs
	from sklearn import preprocessing
	min_max_scaler = preprocessing.MinMaxScaler()
	model_df_fixed = min_max_scaler.fit_transform(model_df)

	# Create a Pairwise Distance Matrix
	from sklearn.metrics.pairwise import euclidean_distances
	dist = euclidean_distances(model_df_fixed, model_df_fixed)

	# Convert base dataframe into dictionary
	total_df = total_df.reset_index()
	bbl_dict = total_df.to_dict('index')

	# Find top N Similar Neighbours
	print("--- Finding the {} Most Similar Buildings ---".format(num_nb))
	sim_BBL = findBBL(dist, bbl_dict, num_nb)

	# Calculate Average EER among the most similar buildings
	print("--- Calculating EER Stats of The N Most Similar Buildings ---")
	sim_BBL = calAvgEUI(sim_BBL)

	return sim_BBL


if __name__ == "__main__":

	try:

		# Import
		import numpy as np
		import pandas as pd
		from datetime import datetime
		import sys
		import json

		from sklearn import preprocessing
		from sklearn.cluster import KMeans
		from sklearn.metrics import silhouette_samples, silhouette_score
		from sklearn.mixture import GaussianMixture
		from sklearn.linear_model import LinearRegression

		import pprint as pprint

		# Run the main workflow
		num_nb = askforInput()
		total_df = getData()
		sim_BBL = getSimilarity(total_df, num_nb, ["BBL","floorArea_2016", "Occupancy", "UnitsTotal", "age", "avgEUI"])
		pprint.pprint(sim_BBL[0:3])

		with open("sim_BBL", "w") as fout:
			json.dump(sim_BBL, fout)
			
		del num_nb, total_df, sim_BBL

	except Exception as ex:
		print(ex)
		print("--- Terminating the Program ---")


