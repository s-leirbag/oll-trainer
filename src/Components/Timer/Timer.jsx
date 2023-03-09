import React from 'react';
// import "./Timer.css";
import { msToReadable } from '../../Utils';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Timer component of training page
 */
export default class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stage: "idle", // idle, prep, running, ending
            time: 0,
            startTime: null,
            intervalId: null,
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown = (event) => {
        if (!this.props.isActive || event.repeat)
            return;
        
        if (event.key === " ") {
            // Hit space to prime the timer
            if (this.state.stage === "idle") {
                this.setState({
                    stage: "prep",
                    time: 0,
                });
            }
            // Or to stop it from running
            else if (this.state.stage === "running") {
                clearInterval(this.state.intervalId);
                this.setState({
                    stage: "ending",
                    intervalId: null,
                });
                this.props.onTimerEnd(this.state.time);
            }
        }
    }

    handleKeyUp = (event) => {
        if (!this.props.isActive)
            return;
        
        if (event.key === " ") {
            // Let go of space after timer is primed/prepped to begin timer
            if (this.state.stage === "prep") {
                this.setState({
                    stage: "running",
                    startTime: (new Date()).getTime(),
                    intervalId: setInterval(() => {
                        this.setState({ time: (new Date()).getTime() - this.state.startTime });
                    }, 10),
                });
            }
            // Or put the timer back into the idle stage
            else if (this.state.stage === "ending") {
                this.setState({
                    stage: "idle",
                });
            }
        }
    }

    render() {
        const time = this.state.time;
        const stage = this.state.stage;

        // Highlight the text color when the timer is primed/prepped
        let color = stage === "prep" ? this.props.prepColor : null;
        
        return (

            <Paper
                sx={{
                    color: color,
                    height: '100%',
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                elevation={4}
            >
                <Typography variant='h1' component='h1'>
                    {msToReadable(time)}
                </Typography>
                <Typography variant='body1' component='p'>
                    [space] to start/stop
                </Typography>
            </Paper>
        )
    }
}