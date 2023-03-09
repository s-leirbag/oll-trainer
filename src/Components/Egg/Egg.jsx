import React from 'react';
import "./Egg.css";
import Button from "./Button.jsx";
import { clone } from 'lodash';

/**
 * Popup window of hints for easter eggs
 */
function EggHints(props) {
    return (
        <div>
            <table id="eggWindow" style={{backgroundColor: props.styleSettings.backgroundColor}}><tbody>
                <tr>
                    {/* Click on egg image quickly to break it as an easter egg */}
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
                    {/* List of easter eggs */}
                    Click Mr. Egg too fast
                    <br/>Solve very slow/very fast {"(not done yet)"}
                    <br/>Easter Egg 3
                    <br/>Easter Egg 4
                    <br/>Easter Egg 5
                </td></tr>
            </tbody></table>
            <div id="eggWindowBack" onClick={() => props.hide()}></div>
        </div>
    );
}

// Click with less than CRACK_TIME_THRESHOLD ms between each click to break the egg
const CRACK_TIME_THRESHOLD = 800;
// Click 6 times fast enough to crack
const CLICKS_TO_CRACK = 6;
// Time of waving animation
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
            clickTimes: [], // Holds list of times between clicks on eggs
            lastClickTime: (new Date()).getTime(), // Time of last click on egg
            crackLevel: 0, // Corresponds to egg image. 0 1 2
            img: IMAGE_INDEX[0],
        };
    }

    /**
     * Show/hide egg hint box
     * @param {boolean} val 
     */
    setEggHintVisibility(val) {
        this.setState({ eggHintsDisplayed: val });
    }

    /**
     * Return to normal image after wave animation image
     */
    resetWaveAnimation() {
        // If the egg is not cracked, reset the image from the wave image to the uncracked image
        if (this.state.crackLevel === 0)
            this.setState({ img: IMAGE_INDEX[0] });
    }

    handleOnClick() {
        this.setEggHintVisibility(true);
        this.onEggClick();
    }

    /**
     * When egg image is clicked (either the egg in hint window or the egg button)
     * Update the crack times/level/image accordingly
     */
    onEggClick() {
        if (this.state.crackLevel === 2) {
            // alert('You killed Mr. Egg...');
            return;
        }

        // Store duration since last click
        const clickTime = (new Date()).getTime();
        let clickTimes = clone(this.state.clickTimes);
        clickTimes.push(clickTime - this.state.lastClickTime);
        // Store only the last CLICKS_TO_CRACK times because that is all we need
        if (clickTimes.length > CLICKS_TO_CRACK)
            clickTimes.shift();
        
        // Update crack level accordingly
        let crackLevel = this.state.crackLevel;
        let img = this.state.img;
        // 1. If we haven't reached the max crack level (2)
        // 2. If we've clicked the eggs at least CLICKS_TO_CRACK times
        // 3. If each duration between clicks is less than CRACK_TIME_THRESHOLD ms
        if (
            crackLevel < 2
            && clickTimes.length === CLICKS_TO_CRACK
            && clickTimes.every(ms => ms < CRACK_TIME_THRESHOLD)
        ) {
            // Increment crack level and change image and alert user
            crackLevel += 1;
            img = IMAGE_INDEX[crackLevel];
            if (crackLevel === 1)
                alert('Ouch! Please don\'t hurt me more...');
            if (crackLevel === 2)
                alert('OOOOUUCH! You killed Mr. Egg.');

            // Reset click times for next crack level
            clickTimes = [];
        }
        // If crack conditions are not satisfied, just run a wave animation
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

    /**
     * Render egg hint box
     */
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

    /**
     * Render egg button and hint box if displayed
     */
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