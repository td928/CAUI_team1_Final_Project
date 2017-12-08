import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer, HexagonLayer} from 'deck.gl';
import * as d3 from "d3";


const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.85,
  diffuseRatio: 0.8,
  specularRatio: 1,
  lightsStrength: [0.8, 0.3, 0.8, 0.3],
  numberOfLights: 2
};
console.log(d3);
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

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

// const defaultProps = {
//   radius: 100,
//   upperPercentile: 100,
//   coverage: 1
// };

const elevationScale = {min: 30, max: 500};
const highlightColor = [255,255,255];

export default class DeckGLOverlay extends Component {

  constructor(props) {
    super(props);
    // this.startAnimationTimer = null;
    // this.intervalTimer = null;
    this.state = {
      // elevationScale: elevationScale.max//.min
    };

    // this._startAnimate = this._startAnimate.bind(this);
    // this._animateHeight = this._animateHeight.bind(this);
    this._onClick = this._onClick.bind(this);
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

  _onClick(e) {
    this.props.onClick(e);
  }

  render() {
    let {viewport, data} = this.props;
    const {selectedBuilding, selectedNeighborsBBL, blgAttr, cmap} = this.props.app.state;
    // console.log('b', selectedNeighborsBBL)
    // if(selectedNeighborsBBL){
    //   let {originalData} = this.props.app.state;
    //   data = Object.assign({}, originalData);
    //   data.features = data.features.slice(100 + Math.floor(100 * Math.random()), 100);
    //   console.log(data.features)
    // }


    if (!data || !data.features) {
      return null;
    }
    const domain_values = data.features.map((f) => Math.log(f.properties[blgAttr] + 10));
    const quantiles = d3.scaleQuantile().range(d3.range(5));
    quantiles.domain(domain_values);

    const colormap = chroma.scale(cmap).domain([0, 5]);
    // const cmap = chroma.scale('Spectral').domain([
    //   Math.max(...domain_values), Math.min(...domain_values)
    // ]);

    console.log(selectedBuilding, this.state.selectedBuilding);

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
      getElevation: f => 30*Math.log(f.properties[blgAttr] + 10),
      getFillColor: function(f) {
        // const {selectedBuilding, selectedNeighborsBBL} = this.state;
        const color = colormap(quantiles(Math.log(f.properties[blgAttr] + 10)));

        // dim buildings that aren't neighbors when custom is set
        if(selectedNeighborsBBL){
          if(!selectedNeighborsBBL.includes(f.properties.BBL)){
            return chroma('black').alpha(0.3).rgba();
          }
        }
        // dim buildings out of group when building is selected
        if(selectedBuilding){
          if(f.properties.km_group != selectedBuilding.properties.km_group){
            return chroma('black').alpha(0.3).rgba();
          }
        }
        return color.rgb();

      },//.bind(this.props.app),
      getLineColor: f => [255, 255, 255],
      lightSettings: LIGHT_SETTINGS,
      pickable: Boolean(this.props.onHover),
      onHover: this.props.onHover,
      onClick: this._onClick,
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } initWebGLParameters />
    );
  }


  // _renderHeatmap() {
  //   const {viewport, data, radius, coverage} = this.props;

  //   if (!data || !data.features) {
  //     return null;
  //   }

  //   const {features} = data;

  //   const layers = [
  //     new HexagonLayer({
  //       id: 'heatmap',
  //       colorRange,
  //       coverage,
  //       data: features,
  //       elevationRange: [0, 30],
  //       // elevationScale: this.state.elevationScale,
  //       extruded: true,
  //       getPosition: d => [d.properties.Longitude, d.properties.Latitude],
  //       lightSettings: LIGHT_SETTINGS,
  //       // onHover: this.props.onHover,
  //       opacity: 1,
  //       // pickable: Boolean(this.props.onHover),
  //       radius,
  //       // upperPercentile
  //     })
  //   ];

  //   return <DeckGL {...viewport} layers={layers} initWebGLParameters />;
  // }

}
// DeckGLOverlay.defaultProps = defaultProps;