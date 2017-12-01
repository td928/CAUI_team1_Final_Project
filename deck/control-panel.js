import React, {PureComponent} from 'react';
import Slider, { Range } from 'rc-slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button, ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

// import 'rc-slider/assets/index.css';

const camelPattern = /(^|[A-Z])[a-z]*/g;
const defaultContainer =  ({children}) => <div className="control-panel">{children}</div>;

export default class ControlPanel extends PureComponent {
  constructor(props) {
    super(props);

    // This binding is necessary to make `this` work in the callback
    this._clearSelected = this._clearSelected.bind(this);
  }


  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const {settings} = this.props;



    return (
      <Container>
        {settings.selectedBuilding
         ? this._renderInfo(settings.selectedBuilding)
         : this._renderFilters()}
      </Container>
    );
  }


  _clearSelected() {
    this.props.updateSettings({selectedBuilding: null});
  }


  _formatSettingName(name) {
    return name.match(camelPattern).join(' ');
  }


  _renderCheckbox(name, value) {
    return (
      <div key={name} className="input">
        <label>{this._formatSettingName(name)}</label>
        <input type="checkbox" checked={value}
          onChange={evt => this.props.onChange(name, evt.target.checked)} />
      </div>
    );
  }

  _renderSlider(name, value, range) {
    const [min, max] = range;

    return (
      <div key={name} className="input">
        <label>{this._formatSettingName(name)}</label>
        <input type="range" min='{min}' max='{max}' defaultValue='{value}' id="threshold" className="form-control"
                onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
      </div>
    );
    <Slider  min={min} max={max} defaultValue={value} onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
  }

  _renderNumericInput(name, value) {
    return (
      <div key={name} className="input input-inline">
        <label>{this._formatSettingName(name)}</label>
        <input type="number" value={value}
          onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
      </div>
    );
  }

  _renderButtonGroup(name, value) {
    return (
      <div key={name} className="input">
        <label>{this._formatSettingName(name)}</label>
        <input type="number" value={value}
          onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
      </div>
    );
  }

  _renderFilters() {
    return (
      <div>
        {this._renderSlider('percentile', 80, [0, 100])}

        {this._renderNumericInput('numberOfWorkers', 10)}
        {this._renderNumericInput('numberOfHours', 10)}
        {this._renderNumericInput('buildingsPerWorkerHour', 10)}
      </div>
    );
  }

  _renderInfo(obj) {
    const {properties} = obj;
    const {viewport} = this.props.settings;

    const data = [2013, 2014, 2015, 2016].map(
      (y) => ({name: y, value: properties['EUI_'+y]})
    );

    return (
      <div>
        <div onClick={this._clearSelected}>x</div>
        <h3>{properties.Address}</h3>
        <p>Total Floor Area: {properties.floorArea_2016} ft^2</p>

        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={data} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
           <XAxis dataKey="name"/>
           <YAxis/>
           <CartesianGrid strokeDasharray="3 3"/>
           <Tooltip/>
           <Legend />
           <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{r: 8}}/>
         </LineChart>
       </ResponsiveContainer>

       <ButtonToolbar>
        {/* primary, success, info, warning, danger, link */}

        <Button bsStyle="primary" onClick={this.props.togglePerspective}>{viewport.pitch ? 'Flat' : 'Perspective'}</Button>
      </ButtonToolbar>

     
      </div>
    );

    /*
 <ToggleButtonGroup type="checkbox" defaultValue={[1, 3]}>
        <ToggleButton value={1}>Checkbox 1 (pre-checked)</ToggleButton>
        <ToggleButton value={2}>Checkbox 2</ToggleButton>

        <ToggleButton value={3}>Checkbox 3 (pre-checked)</ToggleButton>
      </ToggleButtonGroup>
    */
  }
}