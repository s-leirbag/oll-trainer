import React from 'react';
import "./Timer.css";
import { msToReadable } from '../../Utils';

// Timer simplify color codes/stages code

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
            if (this.state.stage === "idle") {
                this.setState({
                    stage: "prep",
                    time: 0,
                });
            }
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
            if (this.state.stage === "prep") {
                this.setState({
                    stage: "running",
                    startTime: (new Date()).getTime(),
                    intervalId: setInterval(() => {
                        this.setState({ time: (new Date()).getTime() - this.state.startTime });
                    }, 10),
                });
            }
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
        let color = stage === "prep" ? this.props.prepColor : this.props.regularColor;
        
        return (
            <div
                className="timer"
                style={{
                    color: color,
                    fontSize: this.props.fontSize,
                }}
            >
                {msToReadable(time)}
            </div>
        )
    }
}