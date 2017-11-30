/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import DeckGLPanel from './deckgl-panel.js';

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
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        console.log(response);
        this.setState({data: response});
      }
    });
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
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  // _onHover(){
  //   return ();
  // }

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
            colorScale={colorScale} />
        </MapGL>
        <DeckGLPanel />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
