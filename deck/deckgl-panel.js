import React, {PureComponent} from 'react';

const defaultContainer =  ({children}) => <div className="control-panel">{children}</div>;

export default class ControlPanel extends PureComponent {
  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const {settings} = this.props;

    return (
      <Container>
        <h3>Interactive GeoJSON</h3>
        <p>Map showing median household income by state in year
        Hover over a state to see details.</p>
        <p>Data source: <a href="www.census.gov">US Census Bureau</a></p>
        <div className="source-link">
          <a href="https://github.com/uber/react-map-gl/tree/master/examples/geojson" target="_new">View Code ↗</a>
        </div>
        <hr />

        <div className="input">
          <label>Year</label>
        </div>
      </Container>
    );
  }
}