import React from 'react';
import "./Egg.css";
import Button from "./Button.jsx";
import { clone } from 'lodash';

function EggHints(props) {
    return (
        <div>
            <table id="eggWindow" style={{backgroundColor: props.styleSettings.backgroundColor}}><tbody>
                <tr>
                    <td
                        rowSpan='2'
                        style={{backgroundColor: props.styleSettings.accentColor}}
                        onClick={props.onEggClick}
                    >
                        <img id='eggImg' src={props.img} alt='egg'/>
                    </td>
                    <td id='eggTitle'><h1>Easter Eggs</h1></td>
                </tr>
                <tr><td>
                    Click Mr. Egg too fast
                    <br/>Solve very slow/very fast
                    <br/>Easter Egg 3
                    <br/>Easter Egg 4
                    <br/>Easter Egg 5
                </td></tr>
            </tbody></table>
            <div id="eggWindowBack" onClick={() => props.hide()}></div>
        </div>
    );
}

const CRACK_TIME_THRESHOLD = 800;
const CLICKS_TO_CRACK = 6;
const WAVE_TIME = 700;
const IMAGE_INDEX = {
    'wave': 'egg/egg-c.svg',
    // crack levels
    0: 'egg/egg-a.svg',
    1: 'egg/egg-d.svg',
    2: 'egg/egg-e.svg',
}

export default class Egg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            eggHintsDisplayed: false,
            clickTimes: [],
            lastClickTime: (new Date()).getTime(),
            crackLevel: 0, // 0 1 2
            img: IMAGE_INDEX[0],
        };
    }

    setEggHintVisibility(val) {
        this.setState({ eggHintsDisplayed: val });
    }

    resetWaveAnimation() {
        if (this.state.crackLevel === 0)
            this.setState({ img: IMAGE_INDEX[0] });
    }

    handleOnClick() {
        this.setEggHintVisibility(true);
        this.onEggClick();
    }

    onEggClick() {
        if (this.state.crackLevel === 2) {
            // alert('You killed Mr. Egg...');
            return;
        }

        const clickTime = (new Date()).getTime();
        let clickTimes = clone(this.state.clickTimes);
        clickTimes.push(clickTime - this.state.lastClickTime);
        if (clickTimes.length > CLICKS_TO_CRACK)
            clickTimes.shift();
        
        let crackLevel = this.state.crackLevel;
        let img = this.state.img;
        if (
            crackLevel < 2
            && clickTimes.length === CLICKS_TO_CRACK
            && clickTimes.every(ms => ms < CRACK_TIME_THRESHOLD)
        ) {
            crackLevel += 1;
            img = IMAGE_INDEX[crackLevel];
            if (crackLevel === 1)
                alert('Ouch!');
            if (crackLevel === 2)
                alert('OOOOUUCH!');

            // Reset click times for next crack level
            clickTimes = [];
        }
        else if (crackLevel === 0) {
            img = IMAGE_INDEX['wave'];
            setTimeout(() => this.resetWaveAnimation(), WAVE_TIME);
        }

        this.setState({
            clickTimes: clickTimes,
            lastClickTime: clickTime,
            crackLevel: crackLevel,
            img: img,
        });
    }
  
    renderEggHints() {
        let hints = "";
        if (this.state.eggHintsDisplayed) {
            hints = (
                <EggHints
                    hide={() => this.setEggHintVisibility(false)} 
                    styleSettings={this.props.styleSettings}
                    img={this.state.img}
                    onEggClick={() => this.onEggClick()}
                />
            );
        }
        return hints;
    }

    render() {
        const eggHints = this.renderEggHints();
        return (
            <div id="egg">
                <Button
                    name={<img width='100px' src={IMAGE_INDEX[this.state.crackLevel]} alt='egg'/>}
                    onClick={() => this.handleOnClick()}
                    title='easter egg'
                    styleSettings={this.props.styleSettings}
                />
                {eggHints}
            </div>
        );
    }
}