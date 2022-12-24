import React from 'react';
import './App.css';
import CaseSelect from './Components/CaseSelect/CaseSelect.jsx';
import Train from './Components/Train/Train.jsx';
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
        mode: 'caseselect', // caseselect, train
        selected: [],
        times: [],
    };
  }

  componentDidMount() {
    this.loadSelection();
  }

  saveSelection(selected) {
    this.setState({selected: selected});
    return saveLocal('ollSelection', JSON.stringify(selected));
  }
  
  loadSelection() {
    let selected = JSON.parse(loadLocal('ollSelection', '[31,32]'));
    // if (selected == null)
    //   selected = [31,32];
    this.saveSelection(selected);
  }

  changeMode(mode) {
    this.setState({
      mode: mode,
    });
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
    }
    else if (this.state.mode === 'random' || this.state.mode === 'recap') {
      app = (
        <Train
          mode={this.state.mode}
          selected={this.state.selected}
          changeMode={(mode) => this.changeMode(mode)}
          times={this.state.times}
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