import React from 'react';
import "./Button.css";
import { defaultPreset, stylePresets } from '../../StylePresets';

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        let defaultStyle = stylePresets[defaultPreset];
        this.state = {
            backgroundColor: props.regularColor || defaultStyle.buttonColor,
            regularColor: props.regularColor || defaultStyle.buttonColor,
            hoverColor: props.hoverColor || defaultStyle.accentColor,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleOnMouseEnter() {
        this.setState({ backgroundColor: this.state.hoverColor });
    }

    handleOnMouseLeave() {
        this.setState({ backgroundColor: this.state.regularColor });
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
                    color: 'white'
                }}
            >
                {this.props.name}
            </button>
        );
    }
}