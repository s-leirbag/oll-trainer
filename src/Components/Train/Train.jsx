import React from 'react';
import Timer from "../Timer/Timer.jsx";

export default class Train extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.type, // random, recap
        };
    }

    handleTimerEnd(time) {
        
    }

    render() {
        return (
            <div className='train'>
                <Timer
                    onTimerEnd={(time) => this.handleTimerEnd(time)}
                />
            </div>
        );
    }
}