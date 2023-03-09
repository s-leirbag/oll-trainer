import React from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

/**
 * Data for buttons and popover
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
export default class ModeButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode, // mode, random/recap
            hovered: props.mode, // hovered mode for popover (know which description to display)
            open: false, // is popover open?
        };
    }

    handleMode(event, newMode) {
        if (newMode !== null) {
            this.setState({ mode: newMode });
            this.props.changeMode(newMode);
        }
    };

    setHovered(name) {
        this.setState({ hovered: name });
    }

    handlePopoverOpen(event) {
        this.setState({ open: true, anchorEl: event.currentTarget });
    };

    handlePopoverClose() {
        this.setState({ open: false });
    };

    render() {
        const open = this.state.open;

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