import React from 'react';

import CaseModal from "./CaseModal.jsx";

import Box from '@mui/material/Box';
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

/**
 * Column info for stats table
 */
const columns = [
    { id: 'caseName', label: 'Case', width: 80 },
    { id: 'timesList', label: 'Times' },
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

    const average = msToReadable(sum / props.caseTimes.length);

    return {
        caseName: <CaseModal i={props.caseNum} confirmUnsel={props.confirmUnsel} />,
        timesList: (
            <Box sx={{ ml: 1.5 }}>
                <Typography variant='body1' component='body1'>
                    {average} average<br/>
                    {timesList}
                </Typography>
            </Box>
        )
    };
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
        const resultsByCase = this.getResultsByCase(this.props.times);
        const caseNums = sortBy(Object.keys(resultsByCase).map(Number));

        let groupsList = [];
        for (const i of caseNums) {
            const confirmUnsel = this.props.selected.includes(i) ? () => this.props.confirmUnsel(i) : null;
            groupsList.push(
                TimesGroup({
                    confirmRem: (entry) => this.props.confirmRem(entry),
                    confirmUnsel: confirmUnsel,
                    caseTimes: resultsByCase[i],
                    caseNum: i,
                    lastEntry: this.props.lastEntry
                })
            );
        }

        return (
            <Paper sx={{ height: '100%' }} elevation={4}>
                <Box sx={{ height: '100%', p: 2 }}>
                    <Box sx={{ height: '5%', display: 'inline-flex' }}>
                        <Typography variant='h6' component='h6'>
                            {this.props.times.length} times
                        </Typography>
                        <Button sx={{ ml: 2 }} variant='outlined' onClick={() => this.props.confirmClear()}>
                            Clear
                        </Button>
                    </Box>

                    <Typography sx={{ height: '10%' }} variant='body1' component='p'>
                        Click case names for case info.<br/>Click times to remove times.
                    </Typography>

                    <Paper sx={{ height: '85%' }} elevation={1}>
                    <TableContainer sx={{ height: '100%', display: 'flex' }}>
                        <Table size='small' stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                key={column.id}
                                align={column.align}
                                style={{ width: column.width }}
                                >
                                {column.label}
                                </TableCell>
                            ))}
                            </TableRow>
                        </TableHead>
                        
                        <TableBody sx={{ overflow: 'auto' }}>
                            {groupsList
                            .map((group, index) => {
                                return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    {columns.map((column) => {
                                    const value = group[column.id];
                                    return (
                                        <TableCell key={column.id} align={column.align} sx={{ p: 0 }}>
                                        {value}
                                        </TableCell>
                                    );
                                    })}
                                </TableRow>
                                );
                            })}
                        </TableBody>
                        </Table>
                    </TableContainer>
                    </Paper>
                </Box>
            </Paper>
        );
    }
}
