import React from 'react';

import "./Train.css";
import ModeButtons from "./ModeButtons.jsx";
import Stats from "./Stats.jsx";
import Timer from "../Timer/Timer.jsx";
import { styleSettingNames, stylePresets } from '../../StylePresets';
import { algsInfo, ollMap } from '../../Constants';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { clone, cloneDeep, sample, isEmpty } from 'lodash';
import { msToReadable, inverseScramble, incrementRem, logTabSep } from '../../Utils';

/**
 * A UI setting with its name and two buttons
 */
function SettingButtons(props) {
    let buttons = [];
    for (const [name, onClick] of Object.entries(props.map)) {
        buttons.push(
            <Button onClick={() => onClick()} key={name}>
                {name}
            </Button>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant='body1' component='p'>
                {props.name}
            </Typography>
            <ButtonGroup variant="outlined" aria-label="outlined button group">
                {buttons}
            </ButtonGroup>
        </Box>
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
        const alg = inverseScramble(sample(ollMap[caseNum]));
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
        let style = clone(this.state.styleSettings);

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
        // this.applyStyle({ [propertyName]: event.target.value });
    };

    /**
     * Adjust the size of the timer or scramble
     * @param {string} element 
     * @param {number} increment 
     */
    adjustSize(element, increment) {
        if (element === 'timer') {
            let timerFontSize = this.state.styleSettings.timerFontSize;
            this.applyStyle({ timerFontSize: incrementRem(timerFontSize, increment) });
        }
        else if (element === 'scramble') {
            let scrambleFontSize = this.state.styleSettings.scrambleFontSize;
            this.applyStyle({ scrambleFontSize: incrementRem(scrambleFontSize, increment) });
        }
    }

    /**
     * Set the theme light/dark
     * @param {string} newTheme 
     */
    setTheme(newTheme) {
        this.applyStyle(stylePresets[newTheme][this.state.styleSettings.accent]);
    }

    /**
     * Set the accent color
     * @param {string} accent 
     */
    setAccent(accent) {
        this.applyStyle(stylePresets[this.state.styleSettings.mode][accent]);
    }

    /**
     * Change the trainig mode to random/recap
     * @param {string} accent 
     */
    changeMode(newMode) {
        this.props.changeMode(newMode);
        this.setState({ mode: newMode });
        if (newMode === 'recap')
            this.setState({ recapArray: clone(this.state.selected) });
    }

    /**
     * Render the customization setting buttons at the bottom of the train page
     * @returns jsx for settings
     */
    renderSettings() {
        const settings = {
            'Timer': {
                '+': () => this.adjustSize('timer', 1),
                '-': () => this.adjustSize('timer', -1),
            },
            'Scramble': {
                '+': () => this.adjustSize('scramble', 0.2),
                '-': () => this.adjustSize('scramble', -0.2),
            },
            'Theme': {
                '☀️': () => this.setTheme('light'),
                '🌙': () => this.setTheme('dark'),
            },
            'Accent': {
                '🤍': () => this.setAccent('gray'),
                '🍓': () => this.setAccent('red'),
                '🍊': () => this.setAccent('orange'),
                '🌻': () => this.setAccent('yellow'),
                '🐸': () => this.setAccent('green'),
                '🥶': () => this.setAccent('blue'),
                '💜': () => this.setAccent('purple'),
                '🌸': () => this.setAccent('pink'),
            },
        }

        let settingButtons = [];
        for (const [name, map] of Object.entries(settings))
            settingButtons.push(<SettingButtons name={name} map={map} key={name}/>);
        
        return (
            <Paper sx={{ display: 'inline-flex' }} elevation={4}>
                {settingButtons}
            </Paper>
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
        
        let nCases, nCasesText, scramble, lastScramInfo;

        // nCases is the note at the top saying the # of cases
        if (nSelected > 0) {
            if (this.state.mode === 'random') {
                nCases = nSelected;
                nCasesText = ' cases selected';
            }
            else if (this.state.mode === 'recap') {
                nCases = (this.state.recapArray.length + 0);
                nCasesText = ' cases left';
            }
            // currentEntry is null on the first frame
            if (currentEntry)
                scramble = "scramble: " + currentEntry.scramble;
        } else {
            nCases = 0;
            nCasesText = ' cases selected';
            scramble = "click \"select cases\" above and pick some OLLs to practice";
        }

        // Display the last scramble if applicable, and a button to remove it from the selection of cases
        const lastCase = this.state.lastEntry.case;
        if (!isEmpty(times) && lastCase !== -1) {
            let button = "";
            if (this.state.selected.includes(lastCase))
                button = (
                    <Button sx={{ ml: 2 }} variant='outlined' onClick={() => this.confirmUnsel(lastCase)}>
                        Unselect
                    </Button>
                );
            lastScramInfo = (
                <Paper sx={{ p: 1 }} elevation={4}>
                <Typography variant='h6' component='h6'>
                    Last Scramble: {this.state.lastEntry.scramble + ' (' + algsInfo[lastCase]['name'] + ')'}
                    {button}
                </Typography>
                </Paper>
            );
        }

        return (
            <Grid container columnSpacing={2} sx={{ p: 2, height: '100vh' }}>
                <Grid item xs={8}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper elevation={4}>
                            <Typography px={1} variant='scramble'>
                                {scramble}
                            </Typography>
                        </Paper>

                        <Timer
                            isActive={nSelected > 0}
                            onTimerEnd={time => this.handleTimerEnd(time)}
                            prepColor={style.accentColor}
                            fontSize={sizes['timer']}
                        />

                        {this.renderSettings()}
                        {lastScramInfo}
                    </Box>
                </Grid>
                
                <Grid item xs={4} sx={{ height: '100%' }}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper sx={{ height: '15%', p: 2, display: 'inline-flex' }} elevation={2}>
                            <ModeButtons
                                mode={this.state.mode}
                                changeMode={(newMode) => this.changeMode(newMode)}
                            />
                            <Box sx={{ ml: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'end' }}>
                                    <Typography variant='h4' component='h4'>
                                        {nCases}
                                    </Typography>
                                    <Typography sx={{ ml: 1 }} variant='h6' component='h6'>
                                        {nCasesText}
                                    </Typography>
                                </Box>

                                <Button
                                    variant='contained'
                                    onClick={() => this.changeMode('caseselect')}
                                    sx={{ py: 1.45 }}
                                >
                                    Select Cases
                                </Button>
                            </Box>
                        </Paper>

                        <Box sx={{ height: '83%' }}>
                        <Stats
                            times={times}
                            confirmRem={(i) => this.confirmRem(i)}
                            confirmClear={() => this.confirmClear()}
                            confirmUnsel={(caseNum) => this.confirmUnsel(caseNum)}
                            lastEntry={this.state.lastEntry}
                            selected={this.state.selected}
                        />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}