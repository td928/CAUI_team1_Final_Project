/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import ControlPanel from './control-panel.js';
import Drawer from './drawer.js';
import {json as requestJson} from 'd3-request';
import {fromJS} from 'immutable';


/*

** Functionality

Most Important::::
--- Change colormap to quantile or something
* highlight on form submit / highlight on selected building
* histogram for peer group, with line plot for yearly
* histogram for custom building
xx Add colobar
----- Format table
----- Add units
xx- Add WER and NER

xx--- Change EUI to kWhr
xxxx- Change to hexagon layer


---------
Building highlighting
 * highlight on selected building
 * highlight on form submit

Plotting
 * histogram for custom building
 * histogram for peer group
    * with line plot for yearly

Change EUI to kWhr
Add units
Add colobar

Change to hexagon layer
Format table
Add WER and NER
---------

Animated heights/transitions
Click on building, highlight cluster, change colormap to diverging from mean

*/

function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

const defaultViewport = {
  altitude: 1.5, 
  bearing: 0, 
  height: 726, 
  latitude : 40.729368597298375 ,
  longitude : -73.98550576497104 ,
  maxLatitude : 85.05113 ,
  maxPitch : 60,
  maxZoom : 16,
  minLatitude : -85.05113,
  minPitch : 0,
  minZoom : 0,
  pitch : 60,
  width : 927,
  zoom: 10.577956559844765,
}

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL = 'benchmarks.geojson'; // eslint-disable-line

const colorScale = r => [r * 255, 140, 200 * (1 - r)];

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: defaultViewport,//{
      //   latitude: 40.7128,
      //   longitude: -74.0060,
      //   zoom: 13,
      //   maxZoom: 16,
      //   pitch: 60,
      //   bearing: 0,
      //   width: 500,
      //   height: 500
      // },
      settings: {
        dragPan: true,
        dragRotate: true,
        scrollZoom: true,
        touchZoomRotate: true,
        doubleClickZoom: true,
        minZoom: 0,
        maxZoom: 20,
        minPitch: 0,
        maxPitch: 85
      },
      filter_values: {
        percentile: 70,
        numberOfWorkers: 10,
        numberOfHours: 8,
        buildingsPerWorkerHour: 1,
        limitByWorkers: 0,
      },
      selectedBuilding: null,
      blgAttr: 'avgEER',
      cmap: 'Spectral',
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        console.log(response);
        // this.data = response;
        // this.setState({data: null});
        this.setState({originalData: response, data: response});
        this._filterBuildings();
      }
    });

    
    this._goToViewport = this._goToViewport.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
    this._togglePerspective = this._togglePerspective.bind(this);

    this._onClick = this._onClick.bind(this);
    this._onFilter = this._onFilter.bind(this);
    this._updateSettings = this._updateSettings.bind(this);
    this._filterBuildings = this._filterBuildings.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport},
    });
  }

  _togglePerspective(){
    // console.log(this.state.viewport);
    this._goToViewport({
      pitch: this.state.viewport.pitch ? 0 : 60,
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _goToViewport(viewport) {
    this._onViewportChange({
      // transitionInterpolator: new LinearInterpolator(),//FlyToInterpolator(),
      transitionDuration: 600,
      lastViewport: this.state.viewport,
      ...viewport,
    });
  };

  _onHover(event) {
    // console.log(event);
    // let countyName = '';
    // let hoverInfo = null;

    // console.log(event);
    // const county = event.features && event.features.find(f => f.layer.id === 'counties');
    // if (county) {
    //   hoverInfo = {
    //     lngLat: event.lngLat,
    //     county: county.properties
    //   };
    //   countyName = county.properties.COUNTY;
    // }
    // this.setState({
    //   mapStyle: defaultMapStyle.setIn(['layers', highlightLayerIndex, 'filter', 2], countyName),
    //   hoverInfo
    // });
  }

  _updateSettings(newState){
    this.setState({ ...newState });
  }

  _onClick(event) {
    const [longitude, latitude] = event.lngLat;
    this.setState({ selectedBuilding: event.object });
    this._goToViewport({
      longitude, latitude
    })
  }

  _filterBuildings() {
    const {originalData, filter_values, blgAttr} = this.state;
    let data = Object.assign({}, originalData);

    if(data && data.features){
      // sort descending order
      data.features = data.features.sort((a, b) => b.properties[blgAttr] - a.properties[blgAttr])
      // only take the top percentile
      if(filter_values.percentile){
        data.features = data.features.slice(0, data.features.length * (1 - filter_values.percentile/100))
      }
      // truncate at certain limit
      if(filter_values.limitByWorkers && filter_values.numberOfWorkers && filter_values.numberOfHours && filter_values.buildingsPerWorkerHour){
        const limit = filter_values.numberOfWorkers * filter_values.numberOfHours * filter_values.buildingsPerWorkerHour
        data.features = data.features.slice(0, limit)
      }

      this.setState({ data });
    }
  }

  _onFilter(name, value){
    const {filter_values} = this.state;
    filter_values[name] = value;
    this.setState({ filter_values });
    this._filterBuildings();
  }

  render() {
    const {viewport, data, selectedBuilding} = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v9">
          <DeckGLOverlay viewport={viewport} app={this}
            data={data}
            selectedBuilding={selectedBuilding}
            onClick={this._onClick}
            onHover={this._onHover} />
        </MapGL>
        <ControlPanel
          settings={this.state}
          updateSettings={this._updateSettings}
          onChange={this._onFilter}
          onAfterChange={this._filterBuildings}
          goToViewport={this._goToViewport}
          togglePerspective={this._togglePerspective} />

        <Drawer data={data} updateSettings={this._updateSettings} settings={this.state} />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
