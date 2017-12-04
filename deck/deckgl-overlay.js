import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';


const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.85,
  diffuseRatio: 0.8,
  specularRatio: 1,
  lightsStrength: [0.8, 0.3, 0.8, 0.3],
  numberOfLights: 2
};

// const LIGHT_SETTINGS = {
//   lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
//   ambientRatio: 0.05,
//   diffuseRatio: 0.6,
//   specularRatio: 0.8,
//   lightsStrength: [3.0, 0.0, 0.5, 0.0],
//   numberOfLights: 2
// };

// const LIGHT_SETTINGS = {
//   lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
//   ambientRatio: 0.2,
//   diffuseRatio: 0.5,
//   specularRatio: 0.3,
//   lightsStrength: [1.0, 0.0, 2.0, 0.0],
//   numberOfLights: 2
// };

const elevationScale = {min: 30, max: 500};
const highlightColor = [255,255,255];


export default class DeckGLOverlay extends Component {

  constructor(props) {
    super(props);
    // this.startAnimationTimer = null;
    // this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.max//.min
    };

    // this._startAnimate = this._startAnimate.bind(this);
    // this._animateHeight = this._animateHeight.bind(this);

  }

  // componentDidMount() {
  //   this._animate();
  // }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.data && this.props.data && nextProps.data.length !== this.props.data.length) {
  //     this._animate();
  //   }
  // }

  // componentWillUnmount() {
  //   this._stopAnimate();
  // }

  // _animate() {
  //   this._stopAnimate();

  //   // wait 1.5 secs to start animation so that all data are loaded
  //   this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  // }

  // _startAnimate() {
  //   this.intervalTimer = window.setInterval(this._animateHeight, 20);
  // }

  // _stopAnimate() {
  //   window.clearTimeout(this.startAnimationTimer);
  //   window.clearTimeout(this.intervalTimer);
  // }

  // _animateHeight() {
  //   if (this.state.elevationScale === elevationScale.max) {
  //     this._stopAnimate();
  //   } else {
  //     this.setState({elevationScale: this.state.elevationScale + 1});
  //   }
  // }


  render() {
    const {viewport, data} = this.props;
    const {selectedBuilding} = this.props.app.state;

    if (!data || !data.features) {
      return null;
    }
    const domain_values = data.features.map((f) => Math.log(f.properties.avgEER + 10));
    const cmap = chroma.scale('Spectral').domain([
      Math.max(...domain_values), Math.min(...domain_values)
    ]);

    const layer = new GeoJsonLayer({
      id: 'buildings',
      data,
      opacity: 1,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: false,
      // elevationRange: [Math.min(...domain_values), Math.max(...domain_values)],
      // elevationScale: 10,//this.state.elevationScale,
      // fp64: true,
      getElevation: f => 30*Math.log(f.properties.avgEER + 10),
      getFillColor: function(f) {
        return (selectedBuilding && (f.properties.BBL == selectedBuilding.properties.BBL) ? [255,255,255] : cmap(Math.log(f.properties.avgEER + 10)).rgb())
      },
      getLineColor: f => [255, 255, 255],
      lightSettings: LIGHT_SETTINGS,
      pickable: Boolean(this.props.onHover),
      onHover: this.props.onHover,
      onClick: this.props.onClick,
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } initWebGLParameters />
    );
  }
}
