import React from 'react';
import './App.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styleSettingNames, defaultStyle } from './StylePresets.js';

import Alert from './Components/Alert.jsx'
import Egg from './Components/Train/Egg.jsx'
import CaseSelect from './Components/CaseSelect/CaseSelect.jsx';
import Train from './Components/Train/Train.jsx';

import { cloneDeep } from 'lodash';
import { logTabSep } from './Utils';

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
      trainMode: 'random', // training mode (random/recap)
      selected: [], // selected cases in the form of case number
      times: [], // stat entries from previously timed cases in training
      lastEntry: {}, // entry from last case timed in training
      style: cloneDeep(defaultStyle), // tracks style settings for user
      alertOpen: false,
      alertInfo: { title: null, handleAgree: null },
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
   * @param {number[]} selected 
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
    let style = cloneDeep(this.state.style);

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
    const defaultStyleCopy = cloneDeep(defaultStyle);
    let style = JSON.parse(loadLocal('style', JSON.stringify(defaultStyleCopy)));
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
    if (mode === 'random' || mode === 'recap')
      this.setState({ trainMode: mode });
  }

  setAlertOpen(val) {
    this.setState({ alertOpen: val });
  }

  setAlert(title, handleAgree) {
    this.setAlertOpen(true);
    this.setState({ alertInfo: { title: title, handleAgree: handleAgree }});
  }

  /**
   * Render app
   * Show appropriate component based on mode
   * Use user's style customization
   * @returns App jsx
   */
  render() {
    let app;
    // CaseSelect is the front page for selecting cases
    if (this.state.mode === 'caseselect') {
      app = (
        <CaseSelect
          selected={this.state.selected}
          saveSelection={(selected) => this.saveSelection(selected)}
          trainMode={this.state.trainMode}
          changeMode={(mode) => this.changeMode(mode)}
          styleSettings={this.state.style}
          key={this.state.selected}
        />
      );
    // Train is the training/timing page
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
          alert={(title, handleAgree) => this.setAlert(title, handleAgree)}
        />
      );
    }

    // Generate user-customized theme using mode, palette, timer/scramble font size
    const style = this.state.style;
    const theme = createTheme({
      palette: {
        mode: style.mode,
        primary: style.primary,
      },
      typography: {
        timer: {
          fontWeight: 300,
          fontSize: style.timerFontSize,
          lineHeight: 1.167,
          letterSpacing: "-0.01562em",
        },
        scramble: {
          fontWeight: 400,
          fontSize: style.scrambleFontSize,
          lineHeight: 1.334,
          letterSpacing: "0em",
        }
      }
    })

    const alertOpen = this.state.alertOpen;
    const alertInfo = this.state.alertInfo;
    return (
      <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Alert
          open={alertOpen}
          title={alertInfo.title}
          handleClose={() => this.setAlertOpen(false)}
          handleAgree={alertInfo.handleAgree}
        />
        {app}
        <Egg alert={(title, handleAgree) => this.setAlert(title, handleAgree)} />
      </ThemeProvider>
      </div>
    );
  }
}
