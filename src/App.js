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
    };
  }

  componentDidMount() {
    this.loadSelection();
    this.loadTrainInfo();
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
        />
      );
    }

    return (
      <div className="App">
        {app}
      </div>
    );
  }
}