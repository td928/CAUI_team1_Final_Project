import React, {PureComponent} from 'react';
import Slider, { Range } from 'rc-slider';
import { LineChart, Line, XAxis, YAxis, 
          CartesianGrid, Tooltip, Legend, 
          ResponsiveContainer, Label, Bar } from 'recharts';
import { Button, ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactTable from 'react-table';
// import 'react-table/react-table.css';

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

  _updateFilters(name, value) {
    // const {filter_values} = this.props.settings;
    // filter_values[name] = value;
    // this.props.updateSettings({
    //   filter_values: filter_values
    // });
    const {originalData, filter_values} = this.props.settings;
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
      if(filter_values.limitByWorkers && filter_values.numberWorkers && filter_values.numberHours && filter_values.buildingsPerWorkerHour){
        const limit = filter_values.numberWorkers * filter_values.numberHours * filter_values.buildingsPerWorkerHour
        data.features = data.features.slice(0, limit)
      }
      console.log(filter_values, data.features.length);

      this.props.updateSettings({ data, filter_values });
    }
  }

  _formatSettingName(name) {
    return name.match(camelPattern).join(' ');
  }


  _renderCheckbox(name, value) {
    return (
      <div key={name} className="input">
        <label>{this._formatSettingName(name)}</label>
        <input type="checkbox" checked={value} onChange={evt => this.props.onChange(name, evt.target.checked)} />
      </div>
    );
  }

  _renderSlider(name, value, range) {
    const [min, max] = range;

    return (
      <div key={name} className="input">
        <label>{this._formatSettingName(name)} ({value}%)</label>
        <input type="range" min={min} max={max} defaultValue={value} name={name} ref={name} className="form-control"
                onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
      </div>
    );
    //<Slider  min={min} max={max} defaultValue={value} onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
  }

  _renderNumericInput(name, value) {
    return (
      <div key={name} className="input input-inline">
        <label>{this._formatSettingName(name)}</label>
        <input type="number" name={name} defaultValue={value} ref={name}
          onChange={evt => this.props.onChange(name, Number(evt.target.value))} />
      </div>
    );
  }

  _renderCheckbox(name, value) {
    return (
      <div key={name} className="input input-inline">
        <label>{this._formatSettingName(name)}</label>
        <input type="checkbox" checked={value}
          onChange={evt => this.props.onChange(name, evt.target.checked)} />
      </div>
    );
  }


  _renderTable(){
    const {data} = this.props.settings;
    return (
      <ReactTable data={data} />
    )
  }

  _renderCustomBuildingForm(){
    const {data} = this.props.settings;
    return (
      <ReactTable data={data} />
    )
  }

}