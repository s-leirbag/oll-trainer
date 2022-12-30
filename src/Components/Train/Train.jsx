import React from 'react';
import "./Train.css";
import Timer from "../Timer/Timer.jsx";
import { algsInfo, ollMap } from '../../Constants';
import { msToReadable, logTabSep } from '../../Utils';
import { clone, cloneDeep, sample, isEmpty } from 'lodash';

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
            isBoxDisplayed: false,
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

        let recapArrayCopy = clone(this.state.recapArray);
        recapArrayCopy.splice(recapArrayCopy.indexOf(entry.case), 1)
        if (isEmpty(recapArrayCopy))
            recapArrayCopy = clone(this.state.selected);

        this.setState({ times: timesCopy, lastEntry: entry, recapArray: recapArrayCopy });
        this.props.saveTrainInfo({ times: timesCopy, lastEntry: entry, recapArray: recapArrayCopy });
        this.makeNewScramble(recapArrayCopy);
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

    confirmUnsel() {
        if (window.confirm("Do you want to unselect this case?")) {
            const lastEntry = this.state.times[this.state.times.length - 1];
            let selectedCopy = this.state.selected.slice();
            selectedCopy.splice(selectedCopy.indexOf(lastEntry.case), 1);
            this.setState({selected: selectedCopy});
            this.props.saveSelection(selectedCopy);
            if (selectedCopy.length > 0)
                this.makeNewScramble(selectedCopy);
        }
    }

    applyStyle() {
        
    }

    displayBox(i) {
        this.setState({isBoxDisplayed: true});
    }

    renderBox(i) {
        const name = algsInfo[i]["name"];
        return (
            <div id="hintWindow">
                <table id='box'>
                    <tr>
                        <td rowSpan='4'>
                            <img id='boxImg' src={"pic/" + i + ".svg"} alt={name}/>
                        </td>
                        <td id='boxTitle'>
                            #{i} {name}
                        </td>
                    </tr>
                    <tr>
                        <td id='boxalg'>
                            {algsInfo[i]["a"]}
                            {algsInfo[i]["a2"] !== "" ? "<br><br>" + algsInfo[i]["a2"] : ""}
                        </td>
                    </tr>
                    <tr>
                        <td id='boxsetup'>
                            Setup: {this.inverseScramble(algsInfo[i]["a"])/* ollMap[i][0] */}
                        </td>
                    </tr>
                </table>
                <div id="hintWindowBack" onClick={() => this.hideBox()}></div> {/* might need to place outside hintWindow div */}
            </div>
        );
    }

    render() {
        const times = this.state.times;
        const timesLength = times.length;

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
                button = <button onClick={() => this.confirmUnsel(lastCase)}>Unselect</button>;
            lastScramInfo = (
                <div>
                    Last Scramble: {this.state.lastEntry.scramble + ' (' + algsInfo[lastCase]['name'] + ')'}
                    {button}
                </div>
            );
        }

        let groupsList=[];
        if (!isEmpty(times)) {
            let resultsByCase = {};
            for (const entry of times) {
                const caseNum = entry.case;
                if (resultsByCase[caseNum] == null)
                    resultsByCase[caseNum] = [];
                resultsByCase[caseNum].push(entry);
            }

            const keys = Object.keys(resultsByCase).sort();
            for (const i of keys) {
                let sum = 0;
                let timesList = [];
                for (const j in resultsByCase[i]) {
                    const entry = resultsByCase[i][j];
                    sum += entry.time;
                    timesList.push(
                        <span
                            className={(entry === this.state.lastEntry) ? "timeResultBold" : "timeResult"}
                            title={entry.scramble}
                            onClick={() => this.confirmRem(entry.index)}
                            key={j}
                        >
                            {entry.ms}{(j < resultsByCase[i].length - 1) ? ', ' : ''}
                        </span>
                    )
                }

                const avg = msToReadable(sum / resultsByCase[i].length);
                groupsList.push(
                    <div className='ollTimes' key={i}>
                        <div className='ollNameHeader'>
                            <span
                                className='ollNameStats'
                                onClick={() => this.displayBox(i)}
                            >
                                {algsInfo[i]["name"]}
                            </span>
                            : {avg}
                        </div>
                        {timesList}
                        <br/><br/>
                    </div>
                );
            }
        }


        return (
            <div className='train'>
            <table><tbody>
                <tr><td colSpan='2'>
                    <button
                        id='selectBtn'
                        onClick={() => this.props.changeMode('caseselect')}
                    >
                        Select Cases
                    </button>
                    {selInfo}
                </td></tr>
                <tr><td id="scramble" colSpan="2">{scramInfo}</td></tr>
                <tr>
                    <td id="timer">
                        <Timer
                            isActive={nSelected > 0}
                            onTimerEnd={time => this.handleTimerEnd(time)} />
                    </td>
                    <td id="stats">
                        <div className="resultInfoHeader">
                            {timesLength} times
                            <button onClick={() => this.confirmClear()}>Clear</button>
                            :
                        </div>
                        <div id="times">
                            {groupsList}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan="2">
                        <div>
                            Timer Size
                            <button onClick={() => this.adjustSize('timer', 8)}>Increase</button>
                            <button onClick={() => this.adjustSize('timer', -8)}>Decrease</button>
                            <br/>
                        </div>
                        <div>
                            Scramble Size
                            <button onClick={() => this.adjustSize('scramble', 8)}>Increase</button>
                            <button onClick={() => this.adjustSize('scramble', -8)}>Decrease</button>
                            <br/>
                        </div>
                        <div>
                            Colors
                            <button onClick={() => this.setStyle('light')}>Light</button>
                            <button onClick={() => this.setStyle('dark')}>Dark</button>
                            <br/>
                        </div>
                        <div>
                            Background
                            <input
                                type='text'
                                value='#f5f5f5'
                                className='settinginput'
                                id='bgcolor_in'
                                onChange={() => this.applyStyle()}
                                placeholder='#f5f5f5'
                                maxLength='12'
                            />
                            <br/>
                        </div>
                        <div>
                            Text
                            <input
                                type='text'
                                value='black'
                                className='settinginput'
                                id='textcolor_in'
                                onChange={() => this.applyStyle()}
                                placeholder='#000'
                                maxLength='12'
                            />
                            <br/>
                        </div>
                        <div>
                            Link
                            <input
                                type='text'
                                value='#004411'
                                className='settinginput'
                                id='linkscolor_in'
                                onChange={() => this.applyStyle()}
                                placeholder='#004411'
                                maxLength='12'
                            />
                            <br/>
                        </div>
                        {lastScramInfo}
                    </td>
                </tr>
            </tbody></table>
            {this.state.isBoxDisplayed ? this.renderBox() : ""}
            </div>
        )
    }
}