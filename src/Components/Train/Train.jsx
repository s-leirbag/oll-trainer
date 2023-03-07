import React from 'react';
import "./Train.css";
import { Button, ButtonGroup } from '@mui/material';
import Timer from "../Timer/Timer.jsx";
import { styleSettingNames, stylePresets } from '../../StylePresets';
import { algsInfo, ollMap } from '../../Constants';
import { msToReadable, logTabSep } from '../../Utils';
import { clone, cloneDeep, sample, isEmpty, sortBy } from 'lodash';

/**
 * Info box for cases
 */
function HintBox(props) {
    const i = props.i;
    const name = algsInfo[i]["name"];
    const alg1 = algsInfo[i]["a"];
    const alg2 = algsInfo[i]["a2"];

    return (
        <div>
            <table id="hintWindow" style={{backgroundColor: props.styleSettings.backgroundColor}}><tbody>
                <tr>
                    <td rowSpan='4'>
                        <img id='boxImg' src={"pic/" + i + ".svg"} alt={name}/>
                    </td>
                    <td id='boxTitle'>
                        #{i} {name}
                    </td>
                </tr>
                <tr><td id='boxalg'>
                    {alg1}
                    {alg2 !== "" ? <div><br/>{alg2}</div> : ""}
                </td></tr>
                <tr><td id='boxsetup'>
                    Setup: {props.inverseScramble(alg1)/* ollMap[i][0] */}
                </td></tr>
            </tbody></table>
            <div id="hintWindowBack" onClick={() => props.hideBox()}></div>
        </div>
    );
}

/**
 * Section of stats
 * Includes case name, average time, and times
 */
function TimesGroup(props) {
    let sum = 0;
    let timesList = [];
    for (const i in props.caseTimes) {
        const entry = props.caseTimes[i];
        sum += entry.time;
        timesList.push(
            <span
                className={(entry === props.lastEntry) ? "timeResultBold" : "timeResult"}
                title={entry.scramble}
                onClick={() => props.confirmRem(entry.index)}
                key={i}
            >
                {entry.ms}{(i < props.caseTimes.length - 1) ? ', ' : ''}
            </span>
        )
    }

    const avg = msToReadable(sum / props.caseTimes.length)
    const name = algsInfo[props.caseNum]["name"];

    return (
        <div className='ollTimes'>
            <div className='ollNameHeader'>
                <span
                    className='ollNameStats'
                    onClick={() => props.displayBox()}
                >
                    {name}
                </span>
                : {avg} average
            </div>
            {timesList}
            <br/><br/>
        </div>
    );
}

/**
 * Section of stats/times
 * Sorts list of times by case and makes according TimesGroup components
 */
class Stats extends React.Component {
    /**
     * Sort list of times by case
     * @param {Object[]} times 
     * @returns 
     */
    getResultsByCase(times) {
        let resultsByCase = {};
        for (const entry of times) {
            const caseNum = entry.case;
            if (resultsByCase[caseNum] == null)
                resultsByCase[caseNum] = [];
            resultsByCase[caseNum].push(entry);
        }
        return resultsByCase;
    }

    render() {
        const resultsByCase = this.getResultsByCase(this.props.times);
        const keys = sortBy(Object.keys(resultsByCase).map(Number));

        let groupsList = [];
        for (const i of keys) {
            groupsList.push(
                <TimesGroup
                    key={i}
                    displayBox={() => this.props.displayBox(i)}
                    confirmRem={(i) => this.props.confirmRem(i)}
                    caseTimes={resultsByCase[i]}
                    caseNum={i}
                    lastEntry={this.props.lastEntry}
                />
            );
        }

        const style = this.props.styleSettings;
        return (
            <td id="stats">
                <div className="resultInfoHeader">
                    {this.props.times.length} times
                    <Button variant='outline' onClick={() => this.props.confirmClear()} key={style.buttonColor}>
                        Clear
                    </Button>
                    :
                </div>
                <div>
                    Click case names for case info
                    <br/>Click times to remove times
                </div>
                <div id="times">
                    {groupsList}
                </div>
            </td>
        );
    }
}

/**
 * A UI setting with its name and two buttons
 */
function SettingButtons(props) {
    return (
        <div>
            {props.name}
            <ButtonGroup variant="outlined" aria-label="outlined button group">
                <Button onClick={() => props.onClick1()}>
                    {props.buttonName1}
                </Button>
                <Button onClick={() => props.onClick2()}>
                    {props.buttonName2}
                </Button>
            </ButtonGroup>
            <br/>
        </div>
    );
}

/**
 * A UI setting with its name and text input
 */
function SettingInput(props) {
    return (
        <label>
            {props.name}
            <input
                className='settinginput'
                type="text"
                value={props.value}
                onChange={props.onChange}
                maxLength='7'
                size='7'
            />
        </label>
    );
}

/**
 * Training page
 */
export default class Train extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Random/recap
            // Random mode feeds the user random cases from their selection
            // Recap mode feeds each case once for the user to review
            mode: props.mode,
            selected: props.selected, // selected cases in the form of case number
            times: props.times, // list of time entries
            recapArray: props.selected, // tracks cases left to serve to user in recap mode, initially fill with entire selection
            currentEntry: null, // entry of current case in training, current scramble above the timer
            lastEntry: props.lastEntry, // entry from last case timed in training
            caseDisplayed: -1, // current case having its info box displayed, -1 to indicate no case info box shown
            sizes: {
                'timer': 90,
                'scramble': 20,
            }, // UI settings of timer/scramble sizes
            styleSettings: props.styleSettings, // style passed down from
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        if (this.props.selected.length > 0)
            this.makeNewScramble();
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    /**
     * Delete/backspace to delete the last time entry
     * Hold shift to clear entire session
     * @param {Object} event 
     */
    handleKeyDown = (event) => {
        if (event.key === 'Delete' || event.key === 'Backspace') {          
            if (event.shiftKey)
                this.confirmClear();
            else
                this.confirmRemLast();
        }
    }

    /**
     * Record a new time entry and update last entry
     * @param {number} time Time in ms from timer
     */
    handleTimerEnd(time) {
        let timesCopy = cloneDeep(this.state.times);
        let entry = clone(this.state.currentEntry);
        entry.time = time;
        entry.ms = msToReadable(time);
        entry.index = timesCopy.length;
        timesCopy.push(entry);

        if (this.state.mode === 'random') {
            // Make a new scramble of a random case from the selection
            this.makeNewScramble();
        }
        else if (this.state.mode === 'recap') {
            let recapArrayCopy = clone(this.state.recapArray);

            // Take the current case out of the recap array
            // If the recap array is empty, refill it with the original selection
            recapArrayCopy.splice(recapArrayCopy.indexOf(entry.case), 1)
            if (isEmpty(recapArrayCopy))
                recapArrayCopy = clone(this.state.selected);
            
            this.setState({ recapArray: recapArrayCopy });

            // Make a new scramble based on a case in whatever is left in the recap array
            this.makeNewScramble(recapArrayCopy);
        }

        this.setState({ times: timesCopy, lastEntry: entry });
        this.props.saveTrainInfo({ times: timesCopy, lastEntry: entry });
    }

    /**
     * Generate a new scramble
     * If cases is defined, choose a random case from there
     * Otherwise, choose a random case from the selected array or recap array based on the mode
     * @param {number[]} cases Optional list of cases to choose from
     */
    makeNewScramble(cases) {
        if (cases === undefined)
            cases = this.state.mode === 'random' ? this.state.selected : this.state.recapArray;
        const caseNum = sample(cases);
        const alg = this.inverseScramble(sample(ollMap[caseNum]));
        const rotation = sample(["", "y", "y2", "y'"]);
        const finalAlg = this.applyAlgRotation(alg, rotation);
        // currentEntry includes the scramble and case number
        const newEntry = {scramble: finalAlg, case: caseNum};
        this.setState({ currentEntry: newEntry });
    }

    /**
     * http://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
     * Replace strings in strings according to a given mapping
     * @param {string} str 
     * @param {Object} mapObj object describing strings to replace
     * @returns Modified string
     */
    replaceAll(str,mapObj) {
        if (!mapObj)
            return str;
        
        // Join mapping keys together with | to search for matching strings to replace
        // g flag: global, replace all matches
        // i flag: ignore case
        let re = new RegExp(Object.keys(mapObj).join("|"),"gi");

        return str.replace(re, function(matched){
            return mapObj[matched];
        });
    }
    
    /**
     * Rotate an algorithm around the vertical axis accordingly
     * @param {string} alg 
     * @param {string} rot type of rotation to apply to algorithm using cubing notation
     * @returns algorithm rotated
     */
    // returns new string with transformed algorithm.
    // Returnes sequence of moves that get the cube to the same position as (alg + rot) does, but without cube rotations.
    // Example: applyAlgRotation("R U R'", "y") = "F U F'"
    applyAlgRotation(alg, rot) {
        let mapObj;
        if (rot==="y")
            mapObj = {R:"F",F:"L",L:"B",B:"R"};
        if (rot==="y'")
            mapObj = {R:"B",B:"L",L:"F",F:"R"};
        if (rot==="y2")
            mapObj = {R:"L",L:"R",B:"F",F:"B"};

        return this.replaceAll(alg, mapObj);
    }

    /**
     * Take an algorithm and reverse
     * If you perform the intial algorithm on a cube then perform the inverse scramble, the cube will not change
     * @param {string} s initial scramble
     * @returns inverse scramble/algorithm
     */
    inverseScramble(s) {
        // deleting parentheses and double spaces
        s = s.replaceAll('[', " ");
        s = s.replaceAll(']', " ");
        s = s.replaceAll('(', " ");
        s = s.replaceAll(')', " ");
        while(s.indexOf("  ") !== -1)
            s = s.replaceAll("  ", " ");
    
        let arr = s.split(" ");
        let result = "";
        for (const move of arr) {
            if (move.length === 0)
                continue;
            // For double turns like U2, just flip the order of the 2 and the face letter
            if (move[move.length - 1] === '2')
                result = move + " " + result;
            // For prime turns like U', remove the ' to reverse it
            else if (move[move.length - 1] === '\'')
                result = move.substring(0, move.length - 1) + " " + result;
            // For regular moves like U, prepend the ' to reverse it
            else
                result = move + "' " + result;
        }
    
        return result.substring(0, result.length-1);
    }

    /**
     * Give each time object an appropriate index value based on its place in the array
     * @param {Object[]} times list of entries of user times
     * @returns times entries with index value added
     */
    updateEntryIndeces(times) {
        for (var i = 0; i < times.length; i++)
            times[i]["index"] = i;
        return times;
    }

    /**
     * Ask the user if they are sure they want to remove a time
     * They may have accidentally started/stopped the timer
     * And do not wish to mess up their stats
     * @param {number} i index of timei entry to remove
     */
    confirmRem(i) {
        const ms = this.state.times[i].ms;
        if (window.confirm("Are you sure you want to remove this time?\n\n" + ms)) {
            let timesCopy = cloneDeep(this.state.times);
            timesCopy.splice(i, 1);
            timesCopy = this.updateEntryIndeces(timesCopy);

            const newLastEntry = isEmpty(timesCopy) ? {} : timesCopy[timesCopy.length - 1]

            this.setState({ times: timesCopy, lastEntry: newLastEntry });
            this.props.saveTrainInfo({ times: timesCopy, lastEntry: newLastEntry });
        }
    }

    /**
     * Ask the user if they are sure they want to remove their most recently timed time
     * They may have accidentally started/stopped the timer
     * And do not wish to mess up their stats
     */
    confirmRemLast() {
        if (isEmpty(this.state.times))
            return;
        this.confirmRem(this.state.times.length - 1);
    }

    /**
     * Ask the user if they are sure they want to clear their session stats
     */
    confirmClear() {
        if (this.state.times.length > 0) {
            if (window.confirm("Are you sure you want to clear session?")) {
                this.setState({times: []});
                this.props.saveTrainInfo({times: []});
            }
        } else {
            alert('Session is already empty');
        }
    }

    /**
     * Ask the user if they are sure they want to unselect a case
     * @param {number} caseNum number of case to unselect
     */
    confirmUnsel(caseNum) {
        if (window.confirm("Do you want to unselect this case?")) {
            let newSelected = clone(this.state.selected);
            newSelected.splice(newSelected.indexOf(caseNum), 1);

            if (newSelected.length > 0) {
                let set = newSelected;
                // Remove it from the recap array if in recap mode
                if (this.state.mode === 'recap') {
                    let newRecapArray = clone(this.state.recapArray);
                    newRecapArray.splice(newRecapArray.indexOf(caseNum), 1);
                    this.setState({ recapArray: newRecapArray });
                    set = newRecapArray;
                }
                this.makeNewScramble(set);
            }
            this.setState({ selected: newSelected });
            this.props.saveSelection(newSelected);
        }
    }

    /**
     * Apply style settings to the page
     * @param {Object} newStyle 
     */
    applyStyle(newStyle) {
        let style = this.state.styleSettings;

        for (const propertyName of styleSettingNames) {
            if (newStyle.hasOwnProperty(propertyName))
                style[propertyName] = newStyle[propertyName];
        }

        this.setState({ styleSettings: style })
        this.props.applyStyle(style);
    }

    /**
     * Change a color in the style settings based on an input event
     * @param {string} propertyName 
     * @param {Object} event 
     */
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-controlled-component
    handleColorInputChange = (propertyName, event) => {
        this.applyStyle({ [propertyName]: event.target.value });
    };

    /**
     * Adjust the size of the timer or scramble
     * @param {string} element 
     * @param {number} increment 
     */
    adjustSize(element, increment) {
        let sizes = this.state.sizes;
        sizes[element] += increment;
        this.setState({ sizes: sizes });
    }

    /**
     * Set the style settings to a preset
     * @param {string} preset 
     */
    setStyle(preset) {
        const style = stylePresets[preset];
        this.applyStyle(style);
    }

    /**
     * Display a hint box for a case
     * @param {number} i number of case to display a hint box for
     */
    displayBox(i) {
        this.setState({ caseDisplayed: i });
    }

    /**
     * Hide a hint box for a case
     */
    hideBox() {
        this.setState({ caseDisplayed: -1 });
    }

    /**
     * Render a hintbox if one is currently displayed
     * @returns jsx for a HintBox or null if not dispalyed
     */
    renderHintBox() {
        let hintBox = "";
        if (this.state.caseDisplayed !== -1) {
            hintBox = (
                <HintBox
                    i={this.state.caseDisplayed}
                    inverseScramble={(s) => this.inverseScramble(s)}
                    hideBox={() => this.hideBox()}
                    styleSettings={this.state.styleSettings}
                />
            );
        }
        return hintBox;
    }

    /**
     * Render a setting with buttons shorter using a function
     */
    renderSettingButtons(name, buttonName1, buttonName2, onClick1, onClick2, style, key) {
        return (
            <SettingButtons
                name={name}
                buttonName1={buttonName1}
                buttonName2={buttonName2}
                onClick1={onClick1}
                onClick2={onClick2}
                styleSettings={style}
                key={key}
            />
        );
    }

    /**
     * Render a setting with text input shorter using a function
     */
    renderSettingInput(name, value, onChange) {
        return (
            <SettingInput
                name={name}
                value={value}
                onChange={onChange}
            />
        );
    }

    /**
     * Render the settings buttons and text input at the bottom of the train page
     * @returns jsx for settings
     */
    renderSettings() {
        const style = this.state.styleSettings;
        return (
            <div>
                {this.renderSettingButtons('Timer Size', '+', '-',
                        () => this.adjustSize('timer', 16), () => this.adjustSize('timer', -16),
                        style, 'timer' + style.buttonColor)}
                {this.renderSettingButtons('Scramble Size', '+', '-',
                        () => this.adjustSize('scramble', 8), () => this.adjustSize('scramble', -8),
                        style, 'scramble' + style.buttonColor)}
                {this.renderSettingButtons('Color Presets', 'Light', 'Dark',
                        () => this.setStyle('light'), () => this.setStyle('dark'),
                        style, 'presets' + style.buttonColor)}
                <span>Specific Colors: </span>
                {this.renderSettingInput('Background: ', style.backgroundColor,
                        (event) => this.handleColorInputChange('backgroundColor', event))}
                {this.renderSettingInput('Button: ', style.buttonColor,
                        (event) => this.handleColorInputChange('buttonColor', event))}
                {this.renderSettingInput('Text: ', style.textColor,
                        (event) => this.handleColorInputChange('textColor', event))}
                {/* {this.renderSettingInput('Link: ', style.linkColor,
                        (event) => this.handleColorInputChange('linkColor', event))} */}
                {this.renderSettingInput('Accent: ', style.accentColor,
                        (event) => this.handleColorInputChange('accentColor', event))}
            </div>
        );
    }

    /**
     * Render page
     * Use user's style settings, pass needed info along
     * @returns Train jsx
     */
    render() {
        const sizes = this.state.sizes;
        const style = this.state.styleSettings;
        const times = this.state.times;
        const nSelected = this.state.selected.length;
        const currentEntry = this.state.currentEntry;
        
        let selInfo, scramInfo, lastScramInfo;

        // selInfo is the note at the top saying the mode and # of cases
        // scramInfo is the scramble
        if (nSelected > 0) {
            if (this.state.mode === 'random')
                selInfo = " | random mode: " + nSelected + " cases selected";
            else if (this.state.mode === 'recap')
                selInfo = " | recap mode: " + (this.state.recapArray.length + 0) + " cases left";
            // currentEntry is null on the first frame
            if (currentEntry)
                scramInfo = "scramble: " + currentEntry.scramble;
        } else {
            selInfo = "";
            scramInfo = "click \"select cases\" above and pick some OLLs to practice";
        }

        // Display the last scramble if applicable, and a button to remove it from the selection of cases
        const lastCase = this.state.lastEntry.case;
        if (!isEmpty(times) && lastCase !== -1) {
            let button = "";
            if (this.state.selected.includes(lastCase))
                button = <Button variant='contained' onClick={() => this.confirmUnsel(lastCase)} key={style.buttonColor}>Unselect</Button>;
            lastScramInfo = (
                <div>
                    Last Scramble: {this.state.lastEntry.scramble + ' (' + algsInfo[lastCase]['name'] + ')'}
                    {button}
                </div>
            );
        }

        return (
            <div className='train'>
            <table id='mainTable'><tbody>
                <tr><td colSpan='2'>
                    <Button
                        variant='contained'
                        id='selectBtn'
                        onClick={() => this.props.changeMode('caseselect')}
                        key={style.buttonColor}
                    >
                        Select Cases
                    </Button>
                    {selInfo}
                </td></tr>
                <tr><td id="scramble" colSpan="2" style={{ fontSize: sizes['scramble'] }} >{scramInfo}</td></tr>
                <tr>
                    <td id="timer">
                        <Timer
                            isActive={nSelected > 0}
                            onTimerEnd={time => this.handleTimerEnd(time)}
                            regularColor={style.textColor}
                            prepColor={style.accentColor}
                            fontSize={sizes['timer']}
                        />
                    </td>
                    <Stats
                        times={times}
                        confirmRem={(i) => this.confirmRem(i)}
                        confirmClear={() => this.confirmClear()}
                        lastEntry={this.state.lastEntry}
                        displayBox={(i) => this.displayBox(i)}
                        styleSettings={style}
                    />
                </tr>
                <tr>
                    <td colSpan="2">
                        {this.renderSettings()}
                        {lastScramInfo}
                    </td>
                </tr>
            </tbody></table>
            {this.renderHintBox()}
            </div>
        )
    }
}