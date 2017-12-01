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

const elevationScale = {min: 1, max: 50};


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
    const {viewport, data, colorScale} = this.props;

    if (!data) {
      return null;
    }
    const domain_values = data.features.map((f) => f.properties.avgEER);
    const cmap = chroma.scale('Spectral').domain([Math.min.apply(Math, domain_values), Math.max.apply(Math, domain_values)]);

    const layer = new GeoJsonLayer({
      id: 'buildings',
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      // elevationRange: [0, 3000],
      // elevationScale: this.state.elevationScale,
      fp64: true,
      getElevation: f => f.properties.avgEUI,
      getFillColor: f => cmap(f.properties.avgEUI).rgb(),
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
