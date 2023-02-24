import React from 'react';
import "./CaseSelect.css";
import Button from "../Button/Button.jsx";
import { algsGroups, renderGroups, algsInfo } from '../../Constants';
import { clone } from 'lodash';

function Case(props) {
    return (
        <td
            className="case"
            onClick={() => props.onClick()}
            title={props.name}
            style={{ backgroundColor: props.backgroundColor }}
        >
            <img width='100px' src={props.src} alt={props.name}/>
        </td>
    );
}

function GroupHeader(props) {
    return (
        <td
            className="groupHeader"
            onClick={() => props.onClick()}
            colSpan={props.colSpan}
        >
            {props.name}
        </td>
    );
}

export default class CaseSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.selected,
        };
    }

    toggleCase(i) {
        let selectedCopy = this.state.selected.slice();
        if (this.state.selected.includes(i))
            selectedCopy.splice(selectedCopy.indexOf(i), 1);
        else
            selectedCopy.push(i);
        this.setState({selected: selectedCopy});
        this.props.saveSelection(selectedCopy);
    }

    toggleGroup(group) {
        const cases = algsGroups[group];
        const selectedInGroup = cases.filter(value => this.state.selected.includes(value));
        const newSelected = (
            selectedInGroup.length > 0 ?
            this.state.selected.filter(value => !cases.includes(value)) : // difference
            this.state.selected.concat(cases)
        );
        this.setState({selected: newSelected});
        this.props.saveSelection(newSelected);
    }

    toggleAll() {
        const newSelected = (
            this.state.selected.length > 0 ?
            [] :
            Object.keys(algsInfo).map(i => parseInt(i))
        );
        this.setState({selected: newSelected});
        this.props.saveSelection(newSelected);
    }

    renderCase(i) {
        const style = this.props.styleSettings;
        // const backgroundColor = this.state.selected.includes(i) ? 'yellow' : style.backgroundColor;
        const backgroundColor = this.state.selected.includes(i) ? style.accentColor : style.backgroundColor;
        
        return (
            <Case
                key={i}
                onClick={() => this.toggleCase(i)}
                name={algsInfo[i]["name"]}
                backgroundColor={backgroundColor}
                src={"pic/" + i + ".svg"}
            />
        );
    }

    renderGroupHeader(group) {
        return (
            <GroupHeader
                key={group}
                onClick={() => this.toggleGroup(group)}
                colSpan={algsGroups[group].length}
                name={group}
            />
        );
    }

    renderGroupCases(group) {
        const cases = algsGroups[group];
        const row = [];
        for (const i of cases)
            row.push(this.renderCase(i));

        return row;
    }

    render42Group(pair) {
        const [group1, group2] = [pair[0], pair[1]];
        return [
            <tr key={group1 + group2 + "headerRow"}>
                {[this.renderGroupHeader(group1), this.renderGroupHeader(group2)]}
            </tr>,
            <tr key={group1 + group2 + "row"}>
                {[this.renderGroupCases(group1), this.renderGroupCases(group2)]}
            </tr>
        ];
    }

    renderNormalGroup(group) {
        return [
            <tr key={group + "headerRow"}>
                {this.renderGroupHeader(group)}
            </tr>,
            <tr key={group + "row"}>
                {this.renderGroupCases(group)}
            </tr>
        ];
    }

    render() {
        const style = this.props.styleSettings;
        const topHeader = (
            <tr><GroupHeader
                key='allHeader'
                onClick={() => this.toggleAll()}
                colSpan='6'
                name={'All Cases (57) | selected: ' + this.state.selected.length}
            /></tr>
        );

        let cases = [];
        for (const pair of renderGroups["42"]) 
            cases = cases.concat(this.render42Group(pair));
        for (const group of renderGroups["normal"])
            cases = cases.concat(this.renderNormalGroup(group));

        let trainButtonStyle = clone(style);
        trainButtonStyle.float = 'left';
        return (
            <div className="caseselect">
            <div className='case-select-header'>
                <h1>OLL Trainer</h1>
                <p>
                    Welcome to the OLL trainer!
                    <br/>OLL is a step in the CFOP speedcubing method 
                    (<a href='https://jperm.net/3x3/cfop' style={{ color: style.linkColor }}>CFOP</a>).
                    <br/>In OLL, you orient the last layer of pieces.
                    <br/>
                    <br/>There are 57 different OLL cases. Select/deselect them on the left by clicking the images.
                    <br/>You can select/deselect all cases/cases in different groups by clicking the headers.
                    <br/>
                    <br/>Click the training buttons on the right to go into training mode!
                    <br/>
                    <br/>Enjoy!
                    <br/>Gabriel Shiu
                    <br/>
                    <br/>GitHub repo: <a href='https://github.com/s-leirbag/oll-trainer' style={{ color: style.linkColor }}>click</a>
                    <br/>Offline version: <a href='https://github.com/s-leirbag/oll-trainer/archive/refs/heads/main.zip' style={{ color: style.linkColor }}>zip</a>
                </p>
            </div>
            <table><tbody>
                {topHeader}
                {cases}
            </tbody></table>
            <div className="train-buttons">
                <h1>Train</h1>
                <Button
                    name='Random mode'
                    onClick={() => this.props.changeMode('random')}
                    title='Train selected cases randomly'
                    styleSettings={trainButtonStyle}
                />
                <p>
                    Gives you random cases from your selection.
                </p>
                <Button
                    name='Recap mode'
                    onClick={() => this.props.changeMode('recap')}
                    title='Go through all the selected cases once'
                    styleSettings={trainButtonStyle}
                />
                <p>
                    Goes through all the selected cases once.
                </p>
            </div>
            </div>
        );
    }
}