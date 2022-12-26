import React from 'react';
import "./Train.css";
import Timer from "../Timer/Timer.jsx";
import { algsInfo, ollMap } from '../../Constants';
import { msToReadable } from '../../Utils';
import { cloneDeep, sample, isEmpty } from 'lodash';

export default class Train extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode, // random, recap
            times: props.times,
            recapArray: (props.mode === 'recap' ? props.selected : []),
            lastScramble: '',
            lastCase: -1,
            currentScramble: '',
            currentCase: -1,
            isBoxDisplayed: false,
        };
    }
    
    // makeResultInstance(time) {
    //     return {
    //         "time": time,
    //         "scramble": lastScramble,
    //         "index": this.state.times.length,
    //         "case": lastCase,
    //     };
    // }

    handleTimerEnd(time) {
        let timesCopy = cloneDeep(this.state.times);
        const currentCase = this.state.currentCase;

        if (timesCopy[currentCase] == null)
            timesCopy[currentCase] = [];
        timesCopy[currentCase].push(time);

        this.setState({times: timesCopy});

        console.log(timesCopy);

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

        this.setState({
            lastScramble: this.state.currentScramble,
            lastCase: this.state.currentCase,
            currentScramble: finalAlg,
            currentCase: caseNum,
        });
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
        const lastScramble = this.state.lastScramble;
        const lastCase = this.state.lastCase;
        const currentScramble = this.state.currentScramble;
        // const currentCase = this.state.currentCase;

        const times = this.state.times;
        let timesLength;
        for (const i in times)
            timesLength += times[i].length;

        const length = this.props.selected.length;

        let selInfo, scramInfo, lastScramInfo;

        if (length > 0) {
            if (this.state.mode === 'random')
                selInfo = " | random mode: " + length + " cases selected";
            else
                selInfo = " | recap mode: " + this.state.recapArray.length + " cases left";
            scramInfo = "scramble: " + currentScramble;
        }
        else {
            selInfo = "";
            scramInfo = "click \"select cases\" above and pick some OLLs to practice";
        }

        if (!isEmpty(times)) {
            lastScramInfo = (
                <div>
                    Last Scramble: {lastScramble} {algsInfo[lastCase]['name']}
                    <button onClick={() => this.confirmUnsel(lastCase)}>Unselect</button>
                </div>
            );
        }
        console.log(lastScramInfo);

        let timesList=[];
        if (!isEmpty(times)) {
            const keys = Object.keys(times).sort();
            for (const i of keys) {
                let entry;
                let sum = 0;

                const timesString = "";
                const avg = sum / keys[i].length;
                entry = (
                    <div className='ollTimes'>
                        <div class='ollNameHeader'>
                            <span
                                class='ollNameStats'
                                onClick={() => this.displayBox(i)}
                            >
                                {algsInfo[i]["name"]}
                            </span>
                            :{msToReadable(avg)}
                        </div>
                        {timesString}
                        <br/><br/>
                    </div>
                );
                timesList.push(entry);
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