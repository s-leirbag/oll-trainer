import React from 'react';
import './App.css';
import { styleSettingNames, defaultPreset, stylePresets } from './StylePresets.js';
import Egg from './Components/Button/Egg.jsx'
import CaseSelect from './Components/CaseSelect/CaseSelect.jsx';
import Train from './Components/Train/Train.jsx';
// import { logTabSep } from './Utils';
import { clone } from 'lodash';
// import { algsGroups, renderGroups, algsInfo } from './Constants';

/**
 * Save a value to local storage
 * @param {string} name 
 * @param {*} value Stringified json object or standard type
 * @returns true if success
 */
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

/**
 * Load a local value or the specified default value if there is an error
 * @param {string} name 
 * @param {*} defaultValue Default value to return if error
 * @returns 
 */
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

/**
 * Main app component
 */
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        // Different modes on training app
        // CaseSelect is front page, selecting apps
        // Random is training page with random cases given
        // Recap is training page going through each case once
        mode: 'caseselect', // caseselect, random, recap
        selected: [], // selected cases in the form of case number
        times: [], // stat entries from previously timed cases in training
        lastEntry: {}, // entry from last case timed in training
        currentEntry: {}, // entry of current case in training, current scramble above the timer
        recapArray: [], // tracks cases left to serve to user in recap mode
        selChanged: false, // tell if selection has changed to update recap array
        style: clone(stylePresets[defaultPreset]), // tracks style settings for user
    };
  }

  /**
   * Load cases selected, stats, and style settings from local storage
   */
  componentDidMount() {
    this.loadSelection();
    this.loadTrainInfo();
    this.loadStyle();
  }

  /**
   * Save training variables to local storage, update app state:
   * times, lastEntry, currentEntry, recapArray
   * @param {Object} info 
   */
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
  
  /**
   * Save training variables:
   * times, lastEntry, currentEntry, recapArray
   */
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

  /**
   * Save array of selected cases to local storage, update app state
   * @param {int[]} selected 
   * @returns true if success
   */
  saveSelection(selected) {
    this.setState({ selected: selected, selChanged: true });
    return saveLocal('selected', JSON.stringify(selected));
  }
  
  /**
   * Load selected cases
   */
  loadSelection() {
    let selected = JSON.parse(loadLocal('selected', '[31,32]'));
    if (selected == null)
      selected = [31,32];
    this.saveSelection(selected);
  }

  /**
   * Save style settings to local storage, update app state
   * @param {Object} newStyle 
   */
  saveStyle(newStyle) {
    let style = this.state.style;

    for (const propertyName of styleSettingNames) {
      if (newStyle.hasOwnProperty(propertyName))
        style[propertyName] = newStyle[propertyName];
    }

    this.setState({ style: style })
    saveLocal('style', JSON.stringify(style));
  }
  
  /**
   * Load style settings
   */
  loadStyle() {
    let style = JSON.parse(loadLocal('style', ''));
    if (style == null)
      style = clone(stylePresets[defaultPreset]);
    this.saveStyle(style);
  }

  /**
   * Change app modes
   * Update recap array if switching to recap mode and selection has changed
   * 
   * CaseSelect is front page, selecting apps
   * Random is training page with random cases given
   * Recap is training page going through each case once
   * @param {*} mode 
   */
  changeMode(mode) {
    this.setState({ mode: mode });
    if (mode === 'recap') {
      let newRecapArray = this.state.recapArray;
      if (this.state.selChanged)
        newRecapArray = this.state.selected;
      this.setState({ recapArray: newRecapArray, selChanged: false });
    }
  }

  /**
   * Render app
   * Show appropriate component based on mode
   * Use user's style settings, pass needed info to hard drive
   * @returns App jsx
   */
  render() {
    let app;
    // Component CaseSelect is the front page for selecting cases
    if (this.state.mode === 'caseselect') {
      app = (
        <CaseSelect
          selected={this.state.selected}
          saveSelection={(selected) => this.saveSelection(selected)}
          changeMode={(mode) => this.changeMode(mode)}
          styleSettings={this.state.style}
        />
      );
    // Component Train is the training/timing page for mode random or recap
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
          applyStyle={(style) => this.saveStyle(style)}
          styleSettings={this.state.style}
        />
      );
    }

    const style = this.state.style;

    // Leave Easter egg button on both selection and training pages
    return (
      <div className="App"
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
        }}
      >
        {app}
        <Egg styleSettings={style}/>
      </div>
    );
  }
}