import React from 'react';
// import { useState, useEffect } from 'react';
import "./Timer.css";

export default class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // stage: "idle", // idle, prep, running, ending
            isRunning: false,
            time: 0,
            intervalId: null
        }
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        // window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown = (event) => {
        // color:  #e42a2a;
        if (event.key === " ") {
            if (event.repeat)
                return;

            // console.log("space key pressed");

            if (this.state.isRunning === false) {
                this.setState({
                    isRunning: true,
                    time: 0,
                    intervalId: setInterval(() => {
                        this.setState({time: this.state.time + 10});
                    }, 10),
                });
            }
            else {
                clearInterval(this.state.intervalId);
                this.setState({
                    isRunning: false,
                    intervalId: null,
                });
            }
        }
    }

    // handleKeyUp = (event) => {
    //     if (event.key === " ") {
    //         console.log("space key released");
    //         if (this.state.isRunning === false) {
    //             this.setState({
    //                 isRunning: true,
    //                 time: 0,
    //                 intervalId: setInterval(() => {
    //                     this.setState({time: this.state.time + 10});
    //                 }, 10),
    //             });
    //         }
    //         else {
    //             clearInterval(this.state.intervalId);
    //             this.setState({
    //                 isRunning: false,
    //                 intervalId: null,
    //             });
    //         }
    //     }
    // }

    render() {
        const time = this.state.time;
        return (
            <div className="timer">
                <span className="digits">
                    {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
                </span>
                <span className="digits">
                    {("0" + Math.floor((time / 1000) % 60)).slice(-2)}.
                </span>
                <span className="digits mili-sec">
                    {("0" + ((time / 10) % 100)).slice(-2)}
                </span>
            </div>
        )
    }
}

// export default function Timer(props) {
//     const [isPaused, setIsPaused] = useState(true);
//     const [time, setTime] = useState(0);
    
//     useEffect(() => {
//         let interval = null;

//         if (isPaused === false) {
//             interval = setInterval(() => {
//                 setTime((time) => time + 10);
//             }, 10);
//         } else {
//             clearInterval(interval);
//         }
//         return () => {
//             clearInterval(interval);
//         };
//     }, [isPaused]);

//     useEffect(() => {
//         window.addEventListener("keydown", (event) => {
//             if (event.key === " ") {
//                 console.log("space key pressed");
//                 if (isPaused === false) {
//                     setIsPaused(true);
//                 }
//                 else {
//                     setIsPaused(false);
//                     setTime(0);
//                 }
//             }
//         });
//     }, []);

//     return (
//         <div className="timer">
//             <span className="digits">
//                 {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
//             </span>
//             <span className="digits">
//                 {("0" + Math.floor((time / 1000) % 60)).slice(-2)}.
//             </span>
//             <span className="digits mili-sec">
//                 {("0" + ((time / 10) % 100)).slice(-2)}
//             </span>
//         </div>
//     );
// }