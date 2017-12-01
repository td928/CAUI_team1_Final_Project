/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {FlyToInterpolator, LinearInterpolator} from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import ControlPanel from './control-panel.js';

import {json as requestJson} from 'd3-request';

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
      }
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        console.log(response);
        this.setState({data: response});
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
      lastViewport: this.state.viewport,
      viewport: {...this.state.viewport, ...viewport},
    });
  }

  _togglePerspective(){
    this._goToViewport({
      ...this.state.lastViewport,
      ...(this.state.viewport.pitch ? {pitch: 0} : {}),
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _goToViewport(viewport) {
    this._onViewportChange({
      // transitionInterpolator: new LinearInterpolator(),//FlyToInterpolator(),
      // transitionDuration: 600,
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
    this.setState({ selectedBuilding: event.object });
  }

  _onFilter(name, value){

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
          <DeckGLOverlay viewport={viewport}
            data={data}
            colorScale={colorScale}
            onClick={this._onClick.bind(this)}
            onHover={this._onHover} />
        </MapGL>
        <ControlPanel
          settings={this.state}
          updateSettings={this._updateSettings}
          onChange={this._onFilter}
          goToViewport={this._goToViewport}
          togglePerspective={this._togglePerspective} />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
