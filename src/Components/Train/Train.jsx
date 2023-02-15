import React from 'react';
import "./Train.css";
import Button from "../Button/Button.jsx";
import Timer from "../Timer/Timer.jsx";
import { stylePresets } from '../../StylePresets';
import { algsInfo, ollMap } from '../../Constants';
import { msToReadable, logTabSep } from '../../Utils';
import { clone, cloneDeep, sample, isEmpty, sortBy } from 'lodash';

function HintBox(props) {
    const i = props.i;
    const name = algsInfo[i]["name"];
    const alg1 = algsInfo[i]["a"];
    const alg2 = algsInfo[i]["a2"];

    return (
        <div>
            <table id="hintWindow"><tbody>
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
                : {avg}
            </div>
            {timesList}
            <br/><br/>
        </div>
    );
}

class Stats extends React.Component {
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

        return (
            <td id="stats">
                <div className="resultInfoHeader">
                    {this.props.times.length} times
                    <Button name='Clear' onClick={() => this.props.confirmClear()} styleSettings={this.props.styleSettings}/>
                    :
                </div>
                <div id="times">
                    {groupsList}
                </div>
            </td>
        );
    }
}

function SettingButtons(props) {
    return (
        <div>
            {props.name}
            <Button
                name={props.buttonName1}
                onClick={() => props.onClick1()}
                styleSettings={props.styleSettings}
            />
            <Button
                name={props.buttonName2}
                onClick={() => props.onClick2()}
                styleSettings={props.styleSettings}
            />
            <br/>
        </div>
    );
}

class SettingInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.applyStyle({ [this.props.propertyName]: event.target.value });
    }

    render() {
        return (
            <label>
                {this.props.name}
                <input
                    className='settinginput'
                    type="text"
                    value={this.state.value}
                    onChange={(event) => this.handleChange(event)}
                    maxLength='12'
                />
            </label>
        );
    }
  }

export default class Train extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode, // random, recap
            selected: props.selected,
            times: props.times,
            recapArray: props.recapArray,
            currentEntry: props.currentEntry,
            lastEntry: props.lastEntry,
            caseDisplayed: -1,
            sizes: {
                'timer': 90,
                'scramble': 20,
            }
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

    handleKeyDown = (event) => {
        if (event.key === 'Delete' || event.key === 'Backspace') {          
            if (event.shiftKey)
                this.confirmClear();
            else
                this.confirmRemLast();
        }
    }

    handleTimerEnd(time) {
        let timesCopy = cloneDeep(this.state.times);
        let entry = clone(this.state.currentEntry);
        entry.time = time;
        entry.ms = msToReadable(time);
        entry.index = timesCopy.length;
        timesCopy.push(entry);

        if (this.state.mode === 'random') {
            this.makeNewScramble();
        }
        else {
            let recapArrayCopy = clone(this.state.recapArray);
            recapArrayCopy.splice(recapArrayCopy.indexOf(entry.case), 1)
            if (isEmpty(recapArrayCopy))
                recapArrayCopy = clone(this.state.selected);
            this.setState({ recapArray: recapArrayCopy });
            this.props.saveTrainInfo({ recapArray: recapArrayCopy });
            this.makeNewScramble(recapArrayCopy);
        }

        this.setState({ times: timesCopy, lastEntry: entry });
        this.props.saveTrainInfo({ times: timesCopy, lastEntry: entry });
    }

    makeNewScramble(cases) {
        if (cases === undefined)
            cases = this.state.mode === 'random' ? this.state.selected : this.state.recapArray;
        const caseNum = sample(cases);
        const alg = this.inverseScramble(sample(ollMap[caseNum]));
        const rotation = sample(["", "y", "y2", "y'"]);
        const finalAlg = this.applyAlgRotation(alg, rotation);
        const newEntry = {scramble: finalAlg, case: caseNum};
        this.setState({ currentEntry: newEntry });
        this.props.saveTrainInfo({ currentEntry: newEntry });
    }

    // http://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
    replaceAll(str,mapObj) {
        if (!mapObj)
            return str;
        let re = new RegExp(Object.keys(mapObj).join("|"),"gi");

        return str.replace(re, function(matched){
            return mapObj[matched];
        });
    }
    
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

    inverseScramble(s) {
        // deleting parantheses and double spaces
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
            if (move[move.length - 1] === '2')
                result = move + " " + result;
            else if (move[move.length - 1] === '\'')
                result = move.substring(0, move.length - 1) + " " + result;
            else
                result = move + "' " + result;
        }
    
        return result.substring(0, result.length-1);
    }

    updateEntryIndeces(times) {
        for (var i = 0; i < times.length; i++)
            times[i]["index"] = i;
        return times;
    }

    /// requests confirmation and deletes result
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

    confirmRemLast() {
        if (isEmpty(this.state.times))
            return;

        this.confirmRem(this.state.times.length - 1);
    }

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

    confirmUnsel(caseNum) {
        if (window.confirm("Do you want to unselect this case?")) {
            let newSelected = clone(this.state.selected);
            newSelected.splice(newSelected.indexOf(caseNum), 1);

            if (newSelected.length > 0) {
                let set = newSelected;
                if (this.state.mode === 'recap') {
                    let newRecapArray = clone(this.state.recapArray);
                    newRecapArray.splice(newRecapArray.indexOf(caseNum), 1);
                    this.setState({ recapArray: newRecapArray });
                    this.props.saveTrainInfo({recapArray: newRecapArray});
                    set = newRecapArray;
                }
                this.makeNewScramble(set);
            }
            this.setState({ selected: newSelected });
            this.props.saveSelection(newSelected);
        }
    }

    adjustSize(element, increment) {
        let sizes = this.state.sizes;
        sizes[element] += increment;
        this.setState({ sizes: sizes });
    }

    setStyle(preset) {
        const style = stylePresets[preset];
        this.props.applyStyle(style);
    }

    displayBox(i) {
        this.setState({ caseDisplayed: i });
    }

    hideBox() {
        this.setState({ caseDisplayed: -1 });
    }

    renderHintBox() {
        let hintBox = "";
        if (this.state.caseDisplayed !== -1) {
            hintBox = (
                <HintBox
                    i={this.state.caseDisplayed}
                    inverseScramble={(s) => this.inverseScramble(s)}
                    hideBox={() => this.hideBox()}
                />
            );
        }
        return hintBox;
    }

    render() {
        const sizes = this.state.sizes;
        const style = this.props.styleSettings;
        const times = this.state.times;
        const nSelected = this.state.selected.length;
        
        let selInfo, scramInfo, lastScramInfo;

        if (nSelected > 0) {
            if (this.state.mode === 'random')
                selInfo = " | random mode: " + nSelected + " cases selected";
            else
                selInfo = " | recap mode: " + (this.state.recapArray.length + 0) + " cases left";
            scramInfo = "scramble: " + this.state.currentEntry.scramble;
        } else {
            selInfo = "";
            scramInfo = "click \"select cases\" above and pick some OLLs to practice";
        }

        const lastCase = this.state.lastEntry.case;
        if (!isEmpty(times) && lastCase !== -1) {
            let button = "";
            if (this.state.selected.includes(lastCase))
                button = <Button name='Unselect' onClick={() => this.confirmUnsel(lastCase)} styleSettings={style}/>;
            lastScramInfo = (
                <div>
                    Last Scramble: {this.state.lastEntry.scramble + ' (' + algsInfo[lastCase]['name'] + ')'}
                    {button}
                </div>
            );
        }

        const hintBox = this.renderHintBox();

        return (
            <div className='train'>
            <table id='mainTable'><tbody>
                <tr><td colSpan='2'>
                    <Button
                        name='Select Cases'
                        id='selectBtn'
                        onClick={() => this.props.changeMode('caseselect')}
                        styleSettings={style}
                    />
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
                        <SettingButtons
                            name='Timer Size'
                            buttonName1='Increase'
                            buttonName2='Decrease'
                            onClick1={() => this.adjustSize('timer', 16)}
                            onClick2={() => this.adjustSize('timer', -16)}
                            styleSettings={style}
                        />
                        <SettingButtons
                            name='Scramble Size'
                            buttonName1='Increase'
                            buttonName2='Decrease'
                            onClick1={() => this.adjustSize('scramble', 8)}
                            onClick2={() => this.adjustSize('scramble', -8)}
                            styleSettings={style}
                        />
                        <SettingButtons
                            name='Colors'
                            buttonName1='Light'
                            buttonName2='Dark'
                            onClick1={() => this.setStyle('light')}
                            onClick2={() => this.setStyle('dark')}
                            styleSettings={style}
                        />
                        <SettingInput
                            name='Background'
                            propertyName='backgroundColor'
                            value={style.backgroundColor}
                            applyStyle={(style) => this.props.applyStyle(style)}
                            // Key to create a new input component when the value changes
                            // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                            key={style.backgroundColor}
                        />
                        <SettingInput
                            name='Button'
                            propertyName='buttonColor'
                            value={style.buttonColor}
                            applyStyle={(style) => this.props.applyStyle(style)}
                            key={style.buttonColor}
                        />
                        <SettingInput
                            name='Text'
                            propertyName='textColor'
                            value={style.textColor}
                            applyStyle={(style) => this.props.applyStyle(style)}
                            key={style.textColor}
                        />
                        <SettingInput
                            name='Link'
                            propertyName='linkColor'
                            value={style.linkColor}
                            applyStyle={(style) => this.props.applyStyle(style)}
                            key={style.linkColor}
                        />
                        <SettingInput
                            name='Accent'
                            propertyName='accentColor'
                            value={style.accentColor}
                            applyStyle={(style) => this.props.applyStyle(style)}
                            key={style.accentColor}
                        />

                        {lastScramInfo}
                    </td>
                </tr>
            </tbody></table>
            {hintBox}
            </div>
        )
    }
}