import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import ReactDrawer from 'react-drawer';
import ReactTable from 'react-table';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, 
          CartesianGrid, Tooltip, Legend, 
          ResponsiveContainer, Label, Bar } from 'recharts';
// import {spawn} from 'child_process';
// var spawn = require("child_process").spawn;
// import pytalk from 'pytalk';
import $ from "jquery";

 
const camelPattern = /(^|[A-Z])[a-z]*/g;

export default class Drawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      position: 'bottom',
      noOverlay: false,

      form: {
        floorArea: 4006,
        avgEui: 120,
        occupancy: 100,
        units: 25,
        age: 30
      }
    };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this._updateForm = this._updateForm.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  _formatSettingName(name) {
    return name.match(camelPattern).join(' ');
  }
  toggleDrawer() {
    this.setState({open: !this.state.open});
  }
  openDrawer() {
    this.setState({open: true});
  }
  closeDrawer() {
    this.setState({open: false});
  }
  onItemClick(event) {
    const oldPanel = this.state.panel;
    const newPanel = event.currentTarget.dataset.panel;
    if(oldPanel == newPanel)
      this.toggleDrawer();
    else{
      this.openDrawer();
    }
    this.setState({ panel: newPanel });
  }

  _updateForm(name, value) {
    const {form} = this.state;
    form[name] = value;
    this.setState({ form: form });
  }

  _clearSelectedNeighbors() {
    this.props.updateSettings({
      selectedNeighbors: null,
      selectedNeighborsBBL: null,
    });
  }

  onFormSubmit(e){
    const {form} = this.state;
    const {updateSettings} = this.props;
    e.preventDefault();
    console.log(form);
    // console.log([
    //   'web_building_sim.py', 
    //   form.floorArea,
    //   form.occupancy,
    //   form.units,
    //   form.age,
    //   form.avgEui,
    // ]);
    // spawn('python',[
    //   'web_building_sim.py', 
    //   form.floorArea,
    //   form.occupancy,
    //   form.units,
    //   form.age,
    //   form.avgEui,
    // ]).stdout.on('data', function (data){
    //   console.log(data);
    // });

    let {data} = this.props.settings;
    data.features = data.features.reverse();

    $.ajax({
      method: 'GET',
      url: 'http://localhost:5000/calculate',
      data: {
        floorArea_2016: form.floorArea,
        Occupancy: form.occupancy,
        UnitsTotal: form.units,
        age: form.age,
        avgEUI: form.avgEui
      },
      dataType: 'json',
      crossDomain: true,

    }).done(function(d){
      console.log(d);
      updateSettings({
        customOutput: d,
        selectedNeighborsBBL: d.Neighbours.map((f) => f.BBL),
        data
      });
    });

    // let worker = pytalk.worker('CF/web_building_sim.py', {async: true}); 
    // let calc = worker.method('calculate');

    // calc(form, (err, res) => {
    //   console.log(res);

    //   worker.close();
    // });
  }

  _renderNumericInput(name, value, label='') {
    return (
      <div key={name} className="input input-inline">
        <label>{label ? label : this._formatSettingName(name)}</label>
        <input type="number" name={name} defaultValue={value} ref={name}
          onChange={evt => this._updateForm(name, Number(evt.target.value))} />
      </div>
    );
  }


  render() {
    return (
      <div>
        <ul className='drawer-tabs'>
          <li onClick={this.onItemClick} data-panel='table'>Table</li>
          <li onClick={this.onItemClick} data-panel='custom'>Custom</li>
        </ul>

        <ReactDrawer
          open={this.state.open}
          position={this.state.position}
          onClose={this.closeDrawer}>
          
          {this.state.open && this.state.panel == 'table' ? this._renderTable() : ''}
          {this.state.open && this.state.panel == 'custom' ? this._renderForm() : ''}

        </ReactDrawer>
      </div>
    );
  }

  _renderTable() {
    const data = this.props.data.features.map((f) => f.properties);
    const columns = [
      {Header: 'BBL', accessor: 'BBL'},
      {Header: 'Address', accessor: 'Address'},
      {Header: 'EUI 2016 (kBtu/ft^2)', accessor: 'EUI_2016'},
      {Header: () => <span title='Energy Efficiency Ratio'>EER</span>, accessor: 'avgEER'},
      {Header: () => <span title='Water Efficiency Ratio'>WER</span>, accessor: 'avgWER'},
      {Header: () => <span title='Natural Gas Efficiency Ratio'>NER</span>, accessor: 'avgNER'},
      {Header: 'Water Intensity (gal/ft^2)', accessor: 'water_intensity'},
      {Header: 'Natural Gas Intensity (kBtu/ft^2)', accessor: 'naturalgas_intensity'},
      {Header: 'Gross Floor Area (ft^2)', accessor: 'floorArea_2016'},
      {Header: 'Year Built', accessor: 'YearBuilt'},
      {Header: 'Number of Units', accessor: 'UnitsTotal'},
      {Header: 'Number of Floors', accessor: 'NumFloors'},
    ]
    return (
      <ReactTable data={data} columns={columns} />
    );
  }

  _renderForm() {
    const {form} = this.state;
    const {customOutput} = this.props.settings;
    //floorArea, AvgEUI, Occupancy, Units, Age, AvgEUI

    var chart = '';
    if(customOutput){

      const histvs = customOutput.Neighbours.map(
        (f) => f.EUI_2016
      )
      const [min, max] = [Math.min(...histvs), Math.max(...histvs)];
      const bin_size = Math.floor((max - min) / 6);
      let hist = histvs.reduce(function(bins, v){
        const i = Math.floor((max - v) / bin_size)  * bin_size;
        bins[i] = (bins[i] || 0) + 1;
        return bins;
      }, {});

      hist = Object.entries(hist).map(function([k, v]){
        return {name: k, EUI: v}
      })
      hist[0]['c'] = 0;
      hist[hist.length-1]['c'] = Math.max(...hist.map(b => b.EUI));
      hist[0]['Your EUI'] = customOutput.Self.avgEUI;
      hist[hist.length-1]['Your EUI'] = customOutput.Self.avgEUI;

      chart = (
        <BarChart width={600} height={300} data={hist}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
       <XAxis dataKey="name"/>
       <YAxis yAxisId="bar" />
       <YAxis yAxisId="line" orientation="right" />
       <CartesianGrid strokeDasharray="3 3"/>
       <Tooltip />
       <Bar yAxisId="bar" dataKey="EUI" />
       <Line yAxisId="line" dataKey="Your EUI" />
      </BarChart>
      );
    }

    return (
      <div className='cols2'>
            <form onSubmit={this.onFormSubmit.bind(this)} className='user-form'>
              {this._renderNumericInput('floorArea', form.floorArea, 'Gross Floor Area (ft2)')}
              {this._renderNumericInput('avgEui', form.avgEui, 'Estimated Energy Usage Intensity (kBtu/ft^2)')}
              {this._renderNumericInput('occupancy', form.occupancy)}
              {this._renderNumericInput('units', form.units)}
              {this._renderNumericInput('age', form.age, 'Age of Building (yr)')}

              <ButtonToolbar>
                <Button bsStyle="primary" type='submit'>Submit</Button>
                <Button bsStyle="danger" type='reset'>Reset</Button>
              </ButtonToolbar>
              
              <p></p>
            </form>
          <div>
            {chart}
          </div>
      </div>
    );
  }

}