import React from 'react';
// import './Egg.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { clone } from 'lodash';

/**
 * Style for easter egg hints box
 */
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

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

/**
 * Easter eggs button and modal
 */
export default class Egg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
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
    setOpen(val) {
        this.setState({ isOpen: val });
    }

    /**
     * Return to normal image after wave animation image
     */
    resetWaveAnimation() {
        // If the egg is not cracked, reset the image from the wave image to the uncracked image
        if (this.state.crackLevel === 0)
            this.setState({ img: IMAGE_INDEX[0] });
    }

    /**
     * Handle clicking the egg button. Opens the modal and tracks the egg click.
     */
    handleOnClick() {
        this.setOpen(true);
        this.onEggClick();
    }

    /**
     * When egg image is clicked (either the egg in hint window or the egg button)
     * Update the crack times/level/image accordingly
     */
    onEggClick() {
        // Don't allow further cracking after crack level 2
        if (this.state.crackLevel === 2)
            return;

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
     * Render egg button and hint modal if open
     */
    render() {
        return (
            <div>
                <Button
                    variant='contained'
                    onClick={() => this.handleOnClick()}
                    size='large'
                    sx={{ p: 1, position: 'fixed', bottom: 10, right: 10 }}
                >
                    <img width={100} src={IMAGE_INDEX[this.state.crackLevel]} alt='egg'/>
                </Button>
                <Modal
                    open={this.state.isOpen}
                    onClose={() => this.setOpen(false)}
                    aria-labelledby='easter egg'
                    aria-describedby='easter egg hints'
                >
                    <Box sx={style}>
                        {/* Click on egg image quickly to break it as an easter egg */}
                        <img onClick={() => this.onEggClick()} width={150} src={this.state.img} alt='egg'/>
                        <Typography variant="h4" component="h2">
                            Easter Eggs
                        </Typography>
                        <Typography variant="body1" component="p" sx={{ mt: 2 }}>
                            {/* List of easter eggs */}
                            Click Mr. Egg too fast
                            <br/>Solve very slow/very fast {"(not done yet)"}
                            <br/>Easter Egg 3
                            <br/>Easter Egg 4
                            <br/>Easter Egg 5
                        </Typography>
                    </Box>
                </Modal>
            </div>
        );
    }
}
