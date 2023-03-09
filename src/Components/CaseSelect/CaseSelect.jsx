import React from 'react';
import "./CaseSelect.css";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container'
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { algsGroups, renderGroups, algsInfo } from '../../Constants';
import { logTabSep } from '../../Utils';

/**
 * Clickable tile of a case
 */
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

/**
 * Clickable header of a group of cases (e.g., P shapes, I shapes)
 */
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

/**
 * Case selection page
 */
export default class CaseSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.selected,
        };
    }

    /**
     * Add/remove a case to/from the selection list
     * @param {number} i number of case being toggled
     */
    toggleCase(i) {
        let selectedCopy = this.state.selected.slice();
        if (this.state.selected.includes(i))
            selectedCopy.splice(selectedCopy.indexOf(i), 1);
        else
            selectedCopy.push(i);
        this.setState({selected: selectedCopy});
        this.props.saveSelection(selectedCopy);
    }

    /**
     * Add/remove all cases in a group to/from the selection list
     * If any case in the group is already selected, unselect the entire group
     * @param {string} group name of group of cases
     */
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

    /**
     * Add/remove all cases to/from the selection list
     */
    toggleAll() {
        const newSelected = (
            this.state.selected.length > 0 ?
            [] :
            // Get case numbers for all cases
            Object.keys(algsInfo).map(i => parseInt(i))
        );
        this.setState({selected: newSelected});
        this.props.saveSelection(newSelected);
    }

    /**
     * @param {number} i number of case to render
     * @returns Case jsx
     */
    renderCase(i) {
        const style = this.props.styleSettings;
        
        // Highlight case if selected
        let bgCol
        if (this.state.selected.includes(i))
            bgCol = style.mode === 'light' ? style.primary.light : style.primary.main;
        
        return (
            <Case
                key={i}
                onClick={() => this.toggleCase(i)}
                name={algsInfo[i]["name"]}
                backgroundColor={bgCol}
                src={"pic/" + i + ".svg"}
            />
        );
    }

    /**
     * @param {string} group name of group of cases
     * @returns GroupHeader jsx
     */
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

    /**
     * Render case tiles for a case group
     * @param {string} group name of group of cases
     * @returns jsx for case tiles
     */
    renderGroupCases(group) {
        const cases = algsGroups[group];
        const row = [];
        for (const i of cases)
            row.push(this.renderCase(i));

        return row;
    }

    /**
     * Render group headers and group cases for a group of 4 cases and a group of 2 cases side by side
     * @param {string[]} pair pair of groups to render side by side
     * @returns jsx for group headers and their tiles
     */
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

    /**
     * Render a group header and the corresponding cases
     * @param {string} group name of group to render
     * @returns jsx for group headers and their tiles
     */
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

    /**
     * Render the case selection page
     */
    render() {
        // Header for all cases
        const topHeader = (
            <tr><GroupHeader
                key='allHeader'
                onClick={() => this.toggleAll()}
                colSpan='6'
                name={'All Cases (57) | selected: ' + this.state.selected.length}
            /></tr>
        );

        // Render case headers and cases
        let cases = [];
        for (const pair of renderGroups["42"]) 
            cases = cases.concat(this.render42Group(pair));
        for (const group of renderGroups["normal"])
            cases = cases.concat(this.renderNormalGroup(group));

        return (
            <Paper>
            <Container maxWidth="sm">
                {/* Text info at the top of the page */}
                <Box py={3} ml={1}>
                    <Typography variant='h2' component='h1'>OLL Trainer</Typography>
                    <Typography variant='body1' component='p'>
                        Welcome to the OLL trainer!
                        <br/><br/>OLL is a step in the CFOP speedcubing method 
                        (<Link href='https://jperm.net/3x3/cfop'>CFOP</Link>). In OLL, you orient the last layer of pieces.
                        <br/><br/>There are 57 different OLL cases. Select/deselect them by clicking the images. You can select/deselect cases in groups by clicking the headers.
                        <br/><br/>Click train to go into training mode!
                        <br/><br/>Enjoy!<br/>Gabriel Shiu
                        <br/><br/>GitHub repo: <Link href='https://github.com/s-leirbag/oll-trainer'>click</Link>
                    </Typography>
                </Box>
            {/* Case headers/tiles */}
            <table><tbody>
                {topHeader}
                {cases}
            </tbody></table>
            {/* Button to switch to the training page */}
            <Button
                variant='contained'
                onClick={() => this.props.changeMode(this.props.trainMode)}
                title='Train your selected cases'
                size='large'
                sx={{ fontSize: 50, position: 'fixed', top: 10, right: 10 }}
            >
                Train
            </Button>
            </Container>
            </Paper>
        );
    }
}