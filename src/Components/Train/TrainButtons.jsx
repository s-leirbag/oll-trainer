import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Popover from '@mui/material/Popover';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

/**
 * A UI setting with its name and buttons
 * Uses a map of button names to callbacks
 * So you can have any number of buttons you want
 */
export function SettingButtons(props) {
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
 * Data for toggle mode buttons and popover
 */
const buttonData = {
    'Random': {
        mode: 'random',
        description: 'Gives you random cases from your selection.',
    },
    'Recap': {
        mode: 'recap',
        description: 'Goes through all the selected cases once.',
    },
}

/**
 * Toggle buttons to change between random/recap training modes
 */
export class ModeButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode, // mode, random/recap
            hovered: props.mode, // hovered mode for popover (to know which description to display)
            open: false, // is popover open?
        };
    }

    /**
     * Set new mode given input
     * @param {Object} event 
     * @param {String} newMode 
     */
    handleMode(event, newMode) {
        if (newMode !== null) {
            this.setState({ mode: newMode });
            this.props.changeMode(newMode);
        }
    };

    /**
     * Set which mode is hovered
     * @param {String} name 
     */
    setHovered(name) {
        this.setState({ hovered: name });
    }

    /**
     * Open the popover and anchor it properly
     * @param {Object} event 
     */
    handlePopoverOpen(event) {
        this.setState({ open: true, anchorEl: event.currentTarget });
    };

    /**
     * Hide the popover
     */
    handlePopoverClose() {
        this.setState({ open: false });
    };

    render() {
        const open = this.state.open;

        /**
         * Render buttons
         */
        let buttons = [];
        for (const [name, data] of Object.entries(buttonData)) {
            buttons.push(
                <ToggleButton
                    value={data['mode']}
                    aria-label={name}
                    aria-owns={open ? 'mouse-over-popover' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={() => this.setHovered(name)}
                    key={name}
                >
                    {name}
                </ToggleButton>
            );
        }

        /**
         * Render popover if it is open
         */
        let popover = '';
        if (open) {
            const name = this.state.hovered;
            const description = buttonData[name]['description'];
            popover = (
                <Popover
                    id="mouse-over-popover"
                    sx={{ pointerEvents: 'none' }}
                    open={open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={() => this.handlePopoverClose()}
                    disableRestoreFocus
                >
                    <Typography sx={{ p: 0.75 }}>{description}</Typography>
                </Popover>
            );
        }
    
        return (
            <Box>
                <Typography variant='h4' component='h4'>
                    Mode
                </Typography>
                <ToggleButtonGroup
                    value={this.state.mode}
                    exclusive
                    onChange={(event, newMode) => this.handleMode(event, newMode)}
                    aria-label="mode"
                    onMouseEnter={(event) => this.handlePopoverOpen(event)}
                    onMouseLeave={() => this.handlePopoverClose()}
                    color="primary"
                >
                    {buttons}
                </ToggleButtonGroup>
                {popover}
            </Box>
        );
    }
}
