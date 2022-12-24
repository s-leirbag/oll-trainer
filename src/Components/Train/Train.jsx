import React from 'react';
import "./Train.css";
import Timer from "../Timer/Timer.jsx";
import { algsInfo, ollMap } from '../../Constants';

export default class Train extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode, // random, recap
            times: props.times,
            lastScramble: '',
            lastCase: -1,
            isBoxDisplayed: false,
        };
    }

    handleTimerEnd(time) {
        
    }

    generateScramble() {
        
    }

    inverseScramble() {
        
    }

    confirmClear() {

    }

    applyStyle() {
        
    }

    displayBox(i) {
        this.setState({isBoxDisplayed: true});
    }

    renderBox(i) {
        return (
            <div id="hintWindow">
                <table id='box'>
                    <tr>
                        <td rowSpan='4'>
                            <img id='boxImg' src={"pic/" + i + ".svg"}/>
                        </td>
                        <td id='boxTitle'>
                            #{i} {algsInfo[i]["name"]}
                        </td>
                    </tr>
                    <tr>
                        <td id='boxalg'>
                            {algsInfo[i]["a"]}
                            {algsInfo[i]["a2"] != "" ? "<br><br>" + algsInfo[i]["a2"] : ""}
                        </td>
                    </tr>
                    <tr>
                        <td id='boxsetup'>
                            Setup: {this.inverseScramble(algsInfo[i]["a"])/* ollMap[i][0] */}
                        </td>
                    </tr>
                </table>
                <div id="hintWindowBack" onClick={() => this.hideBox()}></div> // might need to place outside hintWindow div
            </div>
        );
    }

    render() {
        const lastScramble = this.state.lastScramble;
        const lastCase = this.state.lastCase;

        const timesLength = this.props.times.length;
        const length = this.props.selected.length;

        let selInfo, scramInfo, lastScramInfo;

        if (length > 0) {
            selInfo = " | " + this.state.mode + " mode: " + length + " cases selected";
            scramInfo = "scramble: " + this.generateScramble();
        }
        else {
            selInfo = "";
            scramInfo = "click \"select cases\" above and pick some OLLs to practice";
        }

        if (timesLength > 0) {
            lastScramInfo = (
                <div>
                    Last Scramble: {lastScramble} {algsInfo[lastCase]['name']}
                    <button onClick={() => this.confirmUnsel(lastCase)}>Unselect</button>
                </div>
            );
        }

        let timesList;

        timesList = (
            <div className='ollTimes'>
                <div class='ollNameHeader'>
                    <span
                        class='ollNameStats'
                        // onClick={() => this.displayBox(keys[j])}
                    >
                        {algsInfo[oll]["name"]}
                    </span>
                    :{this.msToHumanReadable(meanForCase)}
                </div>
                {timesString}
                <br/><br/>
            </div>
        );

        return (
            <div className='train'>
            <table><tbody>
                <tr>
                    <td colSpan='2'>
                        <button
                            id='selectBtn'
                            onClick={() => this.props.changeMode('caseselect')}
                        >
                            Select Cases
                        </button>
                        {selInfo}
                    </td>
                </tr>
                <tr>
                    <td id="scramble" colSpan="2">
                        {scramInfo}
                    </td>
                </tr>
                
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