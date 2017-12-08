import React, {PureComponent} from 'react';
import Slider, { Range } from 'rc-slider';
import { LineChart, Line, XAxis, YAxis, 
          CartesianGrid, Tooltip, Legend, 
          ResponsiveContainer, Label, Bar } from 'recharts';
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

  _formatSettingName(name) {
    return name.match(camelPattern).join(' ');
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

  _renderFilters() {
    const {viewport} = this.props.settings;
    const {percentile, limitByWorkers, numberOfWorkers, numberOfHours, buildingsPerWorkerHour} = this.props.settings.filter_values;
    return (
      <div>

        {this._renderSlider('percentile', percentile, [0, 100])}

        {this._renderCheckbox('limitByWorkers', limitByWorkers)}
        { limitByWorkers ? this._renderNumericInput('numberOfWorkers', numberOfWorkers) : ''}
        { limitByWorkers ? this._renderNumericInput('numberOfHours', numberOfHours) : ''}
        { limitByWorkers ? this._renderNumericInput('buildingsPerWorkerHour', buildingsPerWorkerHour) : ''}
        

        <ButtonToolbar>
        {/* primary, success, info, warning, danger, link */}

        <Button bsStyle="primary" onClick={this.props.togglePerspective}>{viewport.pitch ? 'Flat' : 'Perspective'}</Button>
      </ButtonToolbar>
      </div>
    );
  }

  _renderInfo(obj) {
    const {properties} = obj;
    const {data} = this.props.settings;

    const line = [2013, 2014, 2015, 2016].map(
      (y) => ({name: y, EUI: properties['EUI_'+y]})
    );

    // const histvs = alldata.features.filter((f) => f.properties.km_group == properties.km_group).map(
    //   (f) => f.properties.EUI_2016
    // )
    // // const [min, max] = [Math.min(histvs), Math.max(histvs)];
    // // const bin_size = (max - min) / 6;
    // // let hist = histvs.reduce(function(bins, v){
    // //   const i = Math.floor((v - max) / bin_size)
    // //   bins[i] = (bins[i] || 0) + 1;
    // //   return bins;
    // // }, {});

    // // hist = hist.map(function(){
    // //   return {name: y, value: properties['EUI_'+y]}
    // // })

    return (
      <div>
        <div onClick={this._clearSelected}>x</div>
        <h3>{properties.Address}</h3>
        <p>Total Floor Area: {properties.floorArea_2016} ft^2</p>
        <p>EER: {properties.avgEER}</p>
        <p>WER: {properties.avgWER}</p>
        <p>NER: {properties.avgNER}</p>

        <ResponsiveContainer width='100%' height={100}>
          <LineChart data={line} margin={{top: 5, right: 0, left: 0, bottom: 5}}>
          
           <XAxis dataKey="name" axisLine={false} />
           <YAxis width={30} domain={['dataMin', 'auto']} />
           
           <Tooltip/>
           <Legend />
           <Line type="monotone" dataKey="EUI" stroke="#8884d8" activeDot={{r: 8}}/>
           
         </LineChart>
       </ResponsiveContainer>

      </div>
    );
    // <Bar dataKey="pv" fill="#8884d8" data={hist} layout='horizontal' />
    // <CartesianGrid strokeDasharray="3 3"/>

    /*
 <ToggleButtonGroup type="checkbox" defaultValue={[1, 3]}>
        <ToggleButton value={1}>Checkbox 1 (pre-checked)</ToggleButton>
        <ToggleButton value={2}>Checkbox 2</ToggleButton>

        <ToggleButton value={3}>Checkbox 3 (pre-checked)</ToggleButton>
      </ToggleButtonGroup>
    */
  }


  _renderTable(){
    const {data} = this.props.settings;
    return (
      <ReactTable data={data} />
    )
  }


}