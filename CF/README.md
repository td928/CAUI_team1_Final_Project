# Overview
These are python scripts of getting peer buildings for different run purposes. 
- building_sim.py: This is for general purpose. It returns N closest building peers, their stats, and EER details for all building in LL84 dataset
- web_building_sim.py: This is for web integration. It catches user inputs of key building parameters and returns a list of top 700 peers and their details
- terminal_building_sim.py: This is similar to the web version above, but designed for terminal interaction. 

# How To Run
**building_sim.py**

Call: python building_sim.py 100 

Returns: a file of json dump of each building and its 100 closest peers and details

Note: the json dump for ~3200 buildings and details of the top 700 peers of each building is about 1.3GB. Please be careful when selecting the number of peers you want to analyze. Our analyze suggests 700 peers is the optimal number of peers for benchmarking. Please consider pre-processing the data if you intend to use the json dump for downstream processing or visualization.

**web_building_sim.py**

Call: python web_building_sim.py 50000 100 30 60 70 

Description: the script will search and analysis closest peer buildings of a building that has 50,000 sq feet floor area, 100% occupancy, 30 Units, 60 years old, and 70 Est. Average EUI for the past 2-3 years.

Returns: a list of 700 closest peer buildings and their stats and EUI summary of this group.

**terminal_building_sim.py**

Call: python terminal_building_sim.py

Description: the terminal will prompt the user to input parameters (i.e. floor area, occupancy, building age, etc.)

Returns: print out of the details and top 5 peers out of 700.
