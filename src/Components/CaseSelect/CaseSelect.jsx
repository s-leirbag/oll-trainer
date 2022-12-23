import React from 'react';
import "./CaseSelect.css";
import "../../Constants";
import { algsGroups, renderGroups, algsInfo } from '../../Constants';

export default class CaseSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: [],
        }
    }

    toggleCase(i) {
        let selectedCopy = this.state.selected.slice();
        if (this.state.selected.includes(i))
            selectedCopy.splice(selectedCopy.indexOf(i), 1);
        else
            selectedCopy.push(i);
        this.setState({selected: selectedCopy});
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
    }

    toggleAll() {
        this.setState({
            selected: (
                this.state.selected.length > 0 ? [] : Object.keys(algsInfo).map(i => parseInt(i))
            )
        });
    }

    renderCase(i) {
        let backgroundVal;
        
        if (this.state.selected.includes(i))
            backgroundVal = 'yellow';
        else
            backgroundVal = 'white';
        
        return (
            <td
                className="case"
                // key={i}
                onClick={() => this.toggleCase(i)}
                title={algsInfo[i]["name"]}
                style={{ background: backgroundVal }}
                key={i}
            >
                <img width='100px' src={"pic/" + i + ".svg"} alt={algsInfo[i]["name"]}/>
            </td>
        )
    }

    renderGroupHeader(group) {
        const cases = algsGroups[group];

        return (
            <td
                key={group}
                className="groupHeader"
                onClick={() => this.toggleGroup(group)}
                colSpan={cases.length}
            >
                {group}
            </td>
        )
    }

    renderGroup(group) {
        const cases = algsGroups[group];

        const row = [];
        for (const i of cases) {
            row.push(this.renderCase(i));
        }

        return row;
    }

    render42Group(pair) {
        const [group1, group2] = [pair[0], pair[1]];
        return [
            <tr key={group1 + group2 + "headerRow"}>
                {[this.renderGroupHeader(group1), this.renderGroupHeader(group2)]}
            </tr>,
            <tr key={group1 + group2 + "row"}>
                {[this.renderGroup(group1), this.renderGroup(group2)]}
            </tr>
        ];
    }

    renderNormalGroup(group) {
        return [
            <tr key={group + "headerRow"}>
                {this.renderGroupHeader(group)}
            </tr>,
            <tr key={group + "row"}>
                {this.renderGroup(group)}
            </tr>
        ];
    }

    render() {
        let cases = [];

        for (const pair of renderGroups["42"]) {
            cases = cases.concat(this.render42Group(pair));
        }

        for (const group of renderGroups["normal"]) {
            cases = cases.concat(this.renderNormalGroup(group));
        }

        return (
            <div className="caseselect">
            <table><tbody>
                <tr><td
                    className='groupHeader'
                    onClick={() => this.toggleAll()}
                    colSpan='6'
                >
                    All Cases (57) | selected: {this.state.selected.length}
                </td></tr>
                {cases}
            </tbody></table>
            </div>
        );
    }
}