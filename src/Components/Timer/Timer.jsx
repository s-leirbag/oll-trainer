import React from 'react';
import "./Timer.css";
import { msToReadable } from '../../Utils';

export default class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stage: "idle", // idle, prep, running, ending
            time: 0,
            intervalId: null,
            color: "white",
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown = (event) => {
        if (event.key === " ") {
            if (event.repeat)
                return;

            if (this.state.stage === "idle") {
                this.setState({
                    stage: "prep",
                    time: 0,
                    color: "green",
                });
            }
            else if (this.state.stage === "running") {
                clearInterval(this.state.intervalId);
                this.setState({
                    stage: "ending",
                    intervalId: null,
                    color: "maroon",
                });
                this.props.onTimerEnd(this.state.time);
            }
        }
    }

    handleKeyUp = (event) => {
        if (event.key === " ") {
            if (this.state.stage === "prep") {
                this.setState({
                    stage: "running",
                    intervalId: setInterval(() => {
                        this.setState({time: this.state.time + 10});
                    }, 10),
                    color: "white",
                });
            }
            else if (this.state.stage === "ending") {
                this.setState({
                    stage: "idle",
                    color: "white",
                });
            }
        }
    }

    render() {
        const time = this.state.time;
        const color = this.state.color;
        // const stage = this.state.stage;
        
        return (
            <div className="timer" style={{ color: color }}>
                {msToReadable(time)}
            </div>
        )
    }
}