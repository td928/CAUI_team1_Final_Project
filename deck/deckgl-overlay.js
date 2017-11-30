import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 11,
      maxZoom: 16,
      pitch: 25,
      bearing: 0
    };
  }

  _onClick(){

  }

  render() {
    const {viewport, data, colorScale} = this.props;

    if (!data) {
      return null;
    }
    const domain_values = data.features.map((f) => f.properties.avgEER);
    const cmap = chroma.scale('Spectral').domain([Math.min(domain_values), Math.max(domain_values)]);

    const layer = new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,
      getElevation: f => Math.log(f.properties.avgEER),
      getFillColor: f => [255, 0, 0],//cmap(f.properties.avgEER),
      getLineColor: f => [255, 255, 255],
      lightSettings: LIGHT_SETTINGS,
      pickable: Boolean(this.props.onHover),
      // onHover: this.props.onHover,
      onHover: info => console.log('Hovered:', info),
      onClick: info => console.log('Clicked:', info)
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } initWebGLParameters />
    );
  }
}
