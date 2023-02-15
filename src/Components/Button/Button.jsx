import React from 'react';
import "./Button.css";

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            backgroundColor: props.styleSettings.buttonColor,
        };
    }

    handleOnMouseEnter() {
        this.setState({ backgroundColor: this.props.styleSettings.accentColor });
    }

    handleOnMouseLeave() {
        this.setState({ backgroundColor: this.props.styleSettings.buttonColor });
    }

    render() {
        return (
            <button
                onClick={() => this.props.onClick()}
                onMouseEnter={() => this.handleOnMouseEnter()}
                onMouseLeave={() => this.handleOnMouseLeave()}
                title={this.props.title || this.props.name}
                style={{
                    backgroundColor: this.state.backgroundColor,
                    color: this.props.styleSettings.textColor,
                }}
            >
                {this.props.name}
            </button>
        );
    }
}