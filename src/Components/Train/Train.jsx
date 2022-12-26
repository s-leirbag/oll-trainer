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
            times: props.times,
            recapArray: (props.mode === 'recap' ? props.selected : []),
            lastEntry: {},
            currentEntry: {},
            isBoxDisplayed: false,
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        this.makeNewScramble();
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
        const entryCase = entry.case;
        entry.time = time;
        entry.ms = msToReadable(time);

        if (timesCopy[entryCase] == null)
            timesCopy[entryCase] = [];
        timesCopy[entryCase].push(entry);

        this.setState({
            times: timesCopy,
            lastEntry: entry,
        });
        this.makeNewScramble();
    }

    // !!!
    makeNewScramble() {
        let caseNum = 0;
        if (this.state.mode === 'random') {
            caseNum = sample(this.props.selected);
        } else {
            let recapArray = this.state.recapArray;
            if (isEmpty(recapArray))
                recapArray = this.props.selected;
            caseNum = sample(recapArray);
            this.setState({recapArray: recapArray.splice(recapArray.indexOf(caseNum), 1)});
        }
        const alg = this.inverseScramble(sample(ollMap[caseNum]));
        const rotation = sample(["", "y", "y2", "y'"]);
        const finalAlg = this.applyAlgRotation(alg, rotation);

        this.setState({ currentEntry: {scramble: finalAlg, case: caseNum} });
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

    // !!!
    inverseScramble(alg) {
        return alg;
    }

    confirmClear() {
        if (window.confirm("Are you sure you want to clear session?"))
            this.setState({times: {}});
    }

    /// requests confirmation and deletes result
    confirmRem(caseNum, j) {
        const ms = this.state.times[caseNum][j].ms;
        if (window.confirm("Are you sure you want to remove this time?\n\n" + ms)) {
            const times = cloneDeep(this.state.times);
            times[caseNum].splice(j, 1);
            this.setState({times: times});
        }
    }

    confirmRemLast() {
        const caseNum = this.state.lastEntry.case;
        if (this.state.times[caseNum] === null || isEmpty(this.state.times[caseNum]))
            return;

        const caseTimes = this.state.times[caseNum];
        this.confirmRem(caseNum, caseTimes[caseTimes.length - 1]);
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
        let timesLength = 0;
        for (const i in times)
            timesLength += times[i].length;

        const length = this.props.selected.length;

        let selInfo, scramInfo, lastScramInfo;

        if (length > 0) {
            if (this.state.mode === 'random')
                selInfo = " | random mode: " + length + " cases selected";
            else
                selInfo = " | recap mode: " + this.state.recapArray.length + " cases left";
            scramInfo = "scramble: " + this.state.currentEntry.scramble;
        }
        else {
            selInfo = "";
            scramInfo = "click \"select cases\" above and pick some OLLs to practice";
        }

        const lastCase = this.state.lastEntry.case;
        if (!isEmpty(times) && lastCase !== -1) {
            lastScramInfo = (
                <div>
                    Last Scramble: {this.state.lastEntry.scramble + ' (' + algsInfo[lastCase]['name'] + ')'}
                    <button onClick={() => this.confirmUnsel(lastCase)}>Unselect</button>
                </div>
            );
        }

        let timesList=[];
        if (!isEmpty(times)) {
            const keys = Object.keys(times).sort();
            for (const i of keys) {
                if (isEmpty(times[i]))
                    continue;

                let sum = 0;
                let timesString = [];
                for (const j in times[i]) {
                    const entry = times[i][j];
                    sum += entry.time;
                    timesString.push(
                        <span
                            className={(entry === this.state.lastEntry) ? "timeResultBold" : "timeResult"}
                            title={entry.scramble}
                            onClick={() => this.confirmRem(i, j)}
                            key={j}
                        >
                            {entry.ms}{(j < times[i].length - 1) ? ', ' : ''}
                        </span>
                    )
                }
                // logTabSep(sum, times[i].length, sum / times[i].length, msToReadable(1290), msToReadable(4430));
                const avg = msToReadable(sum / times[i].length);
                timesList.push(
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
                        {timesString}
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
                        <Timer onTimerEnd={(time) => this.handleTimerEnd(time)} />
                    </td>
                    <td id="stats">
                        <div className="resultInfoHeader">
                            {timesLength} times
                            <button onClick={() => this.confirmClear()}>Clear</button>
                            :
                        </div>
                        <div id="times">
                            {timesList}
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