/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import ControlPanel from './control-panel.js';
// import Animator from './animator.js';
import {json as requestJson} from 'd3-request';
import {fromJS} from 'immutable';


/*

** Functionality

Load 3D
Animated heights/transitions
Rotate flat
Dark map

Click on building, highlight cluster, change colormap to diverging from mean
Close panel goes back to filters
 * slider percentile
 * # workers, # hours, # buildings/worker/hr
 * button group for EER, WER, NER
 * 

*/



// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL = 'benchmarks.geojson'; // eslint-disable-line

const colorScale = r => [r * 255, 140, 200 * (1 - r)];

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 40.7128,
        longitude: -74.0060,
        zoom: 13,
        maxZoom: 16,
        pitch: 60,
        bearing: 0,
        width: 500,
        height: 500
      },
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
        percentile: 90,
        numberOfWorkers: 10,
        numberOfHours: 8,
        buildingsPerWorkerHour: 1,
        limitByWorkers: 0,

        sortBy: 'avgEER'
      }
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        console.log(response);
        // this.data = response;
        // this.setState({data: null});
        this.setState({originalData: response, data: response});
        this._onFilter();
      }
    });

    this._updateSettings = this._updateSettings.bind(this);
    this._goToViewport = this._goToViewport.bind(this);
    this._togglePerspective = this._togglePerspective.bind(this);
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
    this._goToViewport({
      pitch: this.state.viewport.pitch ? 0 : 60,
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _goToViewport(viewport) {
    this._onViewportChange({
      // transitionInterpolator: new LinearInterpolator(),//FlyToInterpolator(),
      // transitionDuration: 600,
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

  _onFilter(name, value){
    const {originalData, filter_values} = this.state;
    let data = Object.assign({}, originalData);
    filter_values[name] = value;

    if(data && data.features){
      // sort descending order
      data.features = data.features.sort((a, b) => b.properties[filter_values.sortBy] - a.properties[filter_values.sortBy])
      // only take the top percentile
      if(filter_values.percentile){
        data.features = data.features.slice(0, data.features.length * (1 - filter_values.percentile/100))
      }
      // truncate at certain limit
      if(filter_values.limitByWorkers && filter_values.numberOfWorkers && filter_values.numberOfHours && filter_values.buildingsPerWorkerHour){
        const limit = filter_values.numberOfWorkers * filter_values.numberOfHours * filter_values.buildingsPerWorkerHour
        data.features = data.features.slice(0, limit)
      }

      this.setState({ data, filter_values });
    }
  }

  render() {
    const {viewport, data} = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v9">
          <DeckGLOverlay viewport={viewport} app={this}
            data={data}
            colorScale={colorScale}
            onClick={this._onClick.bind(this)}
            onHover={this._onHover} />
        </MapGL>
        <ControlPanel
          settings={this.state}
          updateSettings={this._updateSettings.bind(this)}
          onChange={this._onFilter.bind(this)}
          goToViewport={this._goToViewport}
          togglePerspective={this._togglePerspective} />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
