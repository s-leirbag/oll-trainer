import React from 'react';
import "./CaseSelect.css";
import { algsGroups, renderGroups, algsInfo } from '../../Constants';

function Case(props) {
    return (
        <td
            className="case"
            onClick={() => props.onClick()}
            title={props.name}
            style={{ background: props.background }}
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
        this.props.saveSelection(this.state.selected);
    }

    toggleGroup(group) {
        const cases = algsGroups[group];
        const selectedInGroup = cases.filter(value => this.state.selected.includes(value));
        this.setState({
            selected: (
                selectedInGroup.length > 0 ?
                this.state.selected.filter(value => !cases.includes(value)) : // difference
                this.state.selected.concat(cases)
            )
        });
        this.props.saveSelection(this.state.selected);
    }

    toggleAll() {
        this.setState({
            selected: this.state.selected.length > 0 ? [] : Object.keys(algsInfo).map(i => parseInt(i))
        });
        this.props.saveSelection(this.state.selected);
    }

    renderCase(i) {
        const bgColor = this.state.selected.includes(i) ? 'yellow' : 'white';
        
        return (
            <Case
                key={i}
                onClick={() => this.toggleCase(i)}
                name={algsInfo[i]["name"]}
                background={bgColor}
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

        return (
            <div className="caseselect">
            <div>
                <h1>OLL Trainer</h1>
                <p>
                    Click on pictures and group headers to select/deselect cases
                    <br/>GitHub repo: <a href='https://github.com/s-leirbag/oll-trainer'>click</a>, download offline version: <a href='https://github.com/s-leirbag/oll-trainer/archive/refs/heads/main.zip'>zip</a>
                </p>
            </div>
            <table><tbody>
                {topHeader}
                {cases}
            </tbody></table>
            <div className="btns-right">
                <h1>Train</h1>
                <button
                    onClick={() => this.props.changeMode('random')}
                    title='Train selected cases randomly'
                >
                    Random
                </button>
                <button
                    onClick={() => this.props.changeMode('recap')}
                    title='Go through all the selected cases once'
                >
                    Recap
                </button>
            </div>
            </div>
        );
    }
}