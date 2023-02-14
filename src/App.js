import React from 'react';
import './App.css';
import CaseSelect from './Components/CaseSelect/CaseSelect.jsx';
import Train from './Components/Train/Train.jsx';
import { logTabSep } from './Utils';
// import { algsGroups, renderGroups, algsInfo } from './Constants';

/// \value stringified json object or standard type
/// \returns true if succeed
function saveLocal(name, value) {
  // If the platform supports localStorage, then save the value
  try {
      localStorage.setItem(name, value);
      return true;
  }
  catch(e) {
      // Most likely cause of errors is a very old browser that doesn't support localStorage (fail silently)
      console.warn("saving error");
      return false;
  }
}

/// \returns loaded value or specified defaultValue in case of error
function loadLocal(name, defaultValue) {
  // If the platform supports localStorage, then load the selection
  try {
      return localStorage.getItem(name);
  }
  catch(e) {
      // Either no selection in localStorage or browser does not support localStorage (fail silently)
      console.warn("can't load from localstorage");
      return defaultValue;
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        mode: 'caseselect', // caseselect, random, recap
        selected: [],
        times: [],
        lastEntry: {},
        currentEntry: {},
        recapArray: [],
        selChanged: false,
        bgcolor_in: '#f5f5f5',
        textcolor_in: '#000000',
        linkscolor_in: '#004411'
    };
  }

  componentDidMount() {
    this.loadSelection();
    this.loadTrainInfo();
    this.loadStyle();
  }

  saveTrainInfo(info) {
    if (info.hasOwnProperty('times')) {
      this.setState({ times: info.times });
      saveLocal('times', JSON.stringify(info.times));
    }
    if (info.hasOwnProperty('lastEntry')) {
      this.setState({ lastEntry: info.lastEntry });
      saveLocal('lastEntry', JSON.stringify(info.lastEntry));
    }
    if (info.hasOwnProperty('currentEntry')) {
      this.setState({ currentEntry: info.currentEntry });
      saveLocal('currentEntry', JSON.stringify(info.currentEntry));
    }
    if (info.hasOwnProperty('recapArray')) {
      this.setState({ recapArray: info.recapArray });
      saveLocal('recapArray', JSON.stringify(info.recapArray));
    }
  }
  
  loadTrainInfo() {
    let times = JSON.parse(loadLocal('times', '[]'));
    if (times == null)
      times = [];
    
    let lastEntry = JSON.parse(loadLocal('lastEntry', '{}'));
    if (lastEntry == null)
      lastEntry = {};
    
    let currentEntry = JSON.parse(loadLocal('currentEntry', '{}'));
    if (currentEntry == null)
      currentEntry = {};

    let recapArray = JSON.parse(loadLocal('recapArray', '{}'));
    if (recapArray == null)
      recapArray = {};
    
    this.saveTrainInfo({
      // times: times,
      lastEntry: lastEntry, 
      currentEntry: currentEntry,
      recapArray: recapArray
    });
  }

  saveSelection(selected) {
    this.setState({ selected: selected, selChanged: true });
    return saveLocal('selected', JSON.stringify(selected));
  }
  
  loadSelection() {
    let selected = JSON.parse(loadLocal('selected', '[31,32]'));
    if (selected == null)
      selected = [31,32];
    this.saveSelection(selected);
  }

  applyStyle(style) {
    this.saveStyle(style);
  }

  saveStyle(style) {
    if (style.hasOwnProperty('bgcolor_in')) {
      this.setState({ bgcolor_in: style.bgcolor_in });
      saveLocal('bgcolor_in', JSON.stringify(style.bgcolor_in));
    }
    if (style.hasOwnProperty('textcolor_in')) {
      this.setState({ textcolor_in: style.textcolor_in });
      saveLocal('textcolor_in', JSON.stringify(style.textcolor_in));
    }
    if (style.hasOwnProperty('linkscolor_in')) {
      this.setState({ linkscolor_in: style.linkscolor_in });
      saveLocal('linkscolor_in', JSON.stringify(style.linkscolor_in));
    }
  }

  loadStyle() {
    let bgcolor_in = JSON.parse(loadLocal('bgcolor_in', ''));
    if (bgcolor_in == null)
      bgcolor_in = '';
    
    let textcolor_in = JSON.parse(loadLocal('textcolor_in', ''));
    if (textcolor_in == null)
      textcolor_in = '';
    
    let linkscolor_in = JSON.parse(loadLocal('linkscolor_in', ''));
    if (linkscolor_in == null)
      linkscolor_in = '';

    this.saveStyle({
      bgcolor_in: bgcolor_in, 
      textcolor_in: textcolor_in,
      linkscolor_in: linkscolor_in
    });
  }

  changeMode(mode) {
    this.setState({ mode: mode });
    if (mode === 'recap') {
      let newRecapArray = this.state.recapArray;
      if (this.state.selChanged)
        newRecapArray = this.state.selected;
      this.setState({ recapArray: newRecapArray, selChanged: false });
    }
  }

  render() {
    let app;
    if (this.state.mode === 'caseselect') {
      app = (
        <CaseSelect
          selected={this.state.selected}
          saveSelection={(selected) => this.saveSelection(selected)}
          changeMode={(mode) => this.changeMode(mode)}
          bgcolor_in={this.state.bgcolor_in}
        />
      );
    // random or recap
    } else {
      app = (
        <Train
          selected={this.state.selected}
          saveSelection={(selected) => this.saveSelection(selected)}
          mode={this.state.mode}
          changeMode={(mode) => this.changeMode(mode)}
          saveTrainInfo={(info) => this.saveTrainInfo(info)}
          times={this.state.times}
          lastEntry={this.state.lastEntry}
          currentEntry={this.state.currentEntry}
          recapArray={this.state.recapArray}
          applyStyle={(style) => this.applyStyle(style)}
          // saveStyle={(style) => this.saveStyle(style)}
          bgcolor_in={this.state.bgcolor_in}
          textcolor_in={this.state.textcolor_in}
          linkscolor_in={this.state.linkscolor_in}
        />
      );
    }

    return (
      <div className="App"
        style={{
          backgroundColor: this.state.bgcolor_in,
          color: this.state.textcolor_in
        }}
      >
        {app}
      </div>
    );
  }
}