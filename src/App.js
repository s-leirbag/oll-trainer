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
 * Load a local value or the specified default value if there is an error or it is null
 * @param {string} name 
 * @param {*} defaultValue Default value to return if error
 * @returns 
 */
function loadLocal(name, defaultValue) {
  try {
    // If the platform supports localStorage, load the value
    let value = localStorage.getItem(name);
    // If no value is stored, use defaultValue
    if (value == null)
      value = defaultValue;
    return value;
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
   * times, lastEntry
   * @param {Object} info 
   */
  saveTrainInfo(info) {
    const trainInfoNames = ['times', 'lastEntry'];
    for (const propertyName of trainInfoNames) {
      if (info.hasOwnProperty(propertyName)) {
        let state = { [propertyName]: info[propertyName]};
        this.setState(state);
        saveLocal(propertyName, JSON.stringify(info[propertyName]));
      }
    }
  }
  
  /**
   * Save training variables:
   * times, lastEntry
   */
  loadTrainInfo() {
    const times = JSON.parse(loadLocal('times', '[]'));
    const lastEntry = JSON.parse(loadLocal('lastEntry', '{}'));
    
    this.saveTrainInfo({
      times: times,
      lastEntry: lastEntry,
    });
  }

  /**
   * Save array of selected cases to local storage, update app state
   * @param {int[]} selected 
   * @returns true if success
   */
  saveSelection(selected) {
    this.setState({ selected: selected });
    return saveLocal('selected', JSON.stringify(selected));
  }
  
  /**
   * Load selected cases
   */
  loadSelection() {
    let selected = JSON.parse(loadLocal('selected', '[31,32]'));
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
    const defaultStyle = clone(stylePresets[defaultPreset]);
    let style = JSON.parse(loadLocal('style', JSON.stringify(defaultStyle)));
    this.saveStyle(style);
  }

  /**
   * Change app modes
   * 
   * CaseSelect is front page, selecting apps
   * Random is training page with random cases given
   * Recap is training page going through each case once
   * @param {*} mode 
   */
  changeMode(mode) {
    this.setState({ mode: mode });
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