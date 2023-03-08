import React from 'react';

import CaseModal from "./CaseModal.jsx";

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { msToReadable } from '../../Utils';
import { sortBy } from 'lodash';

const columns = [
    { id: 'caseName', label: 'Case', minWidth: 80 },
    { id: 'average', label: 'Avg' },
    { id: 'timesList', label: 'Times', minWidth: 170 },
];

/**
 * Section of stats
 * Includes case name, average time, and times
 */
function TimesGroup(props) {
    let sum = 0;
    let timesList = [];
    for (const i in props.caseTimes) {
        const entry = props.caseTimes[i];
        sum += entry.time;
        timesList.push(
            <span
                className={(entry === props.lastEntry) ? "timeResultBold" : "timeResult"}
                title={entry.scramble}
                onClick={() => props.confirmRem(entry.index)}
                key={i}
            >
                {entry.ms}{(i < props.caseTimes.length - 1) ? ', ' : ''}
            </span>
        )
    }

    // const caseName = algsInfo[props.caseNum]["name"];
    const average = msToReadable(sum / props.caseTimes.length);
    const caseName = <CaseModal i={props.caseNum}/>

    return { caseName, average, timesList };
}

/**
 * Section of stats/times
 * Sorts list of times by case and makes according TimesGroup components
 */
export default class Stats extends React.Component {
    /**
     * Sort list of times by case
     * @param {Object[]} times 
     * @returns 
     */
    getResultsByCase(times) {
        let resultsByCase = {};
        for (const entry of times) {
            const caseNum = entry.case;
            if (resultsByCase[caseNum] == null)
                resultsByCase[caseNum] = [];
            resultsByCase[caseNum].push(entry);
        }
        return resultsByCase;
    }

    render() {
        const style = this.props.styleSettings;
        const resultsByCase = this.getResultsByCase(this.props.times);
        const keys = sortBy(Object.keys(resultsByCase).map(Number));

        let groupsList = [];
        for (const i of keys) {
            groupsList.push(
                TimesGroup({
                    displayBox: () => this.props.displayBox(i),
                    confirmRem: (i) => this.props.confirmRem(i),
                    caseTimes: resultsByCase[i],
                    caseNum: i,
                    lastEntry: this.props.lastEntry
                })
            );
        }
          
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography>
                    {this.props.times.length} times
                </Typography>
                <Button variant='outline' onClick={() => this.props.confirmClear()} key={style.buttonColor}>
                    Clear
                </Button>
                <Typography>
                    Click case names for case info
                    <br/>Click times to remove times
                </Typography>

                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                        {columns.map((column) => (
                            <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                            >
                            {column.label}
                            </TableCell>
                        ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groupsList
                        .map((group, index) => {
                            return (
                            <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                {columns.map((column) => {
                                const value = group[column.id];
                                return (
                                    <TableCell key={column.id} align={column.align}>
                                    {value}
                                    </TableCell>
                                );
                                })}
                            </TableRow>
                            );
                        })}
                        {/* {groupsList} */}
                    </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    }
}