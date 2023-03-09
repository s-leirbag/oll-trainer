import React from 'react';
import { algsInfo } from '../../Constants';
import { inverseScramble } from '../../Utils';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

/**
 * Info box for cases
 */
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  
export default function CaseModal(props) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    const i = props.i;
    const name = algsInfo[i]["name"];
    const alg1 = algsInfo[i]["a"];
    const alg2 = algsInfo[i]["a2"];

    let altAlg = '';
    if (alg2 !== "") {
      altAlg = (
        <Typography>
          Alternative:<br/>
          {alg2}
        </Typography>
      );
    }
  
    let unselButton = "";
    if (props.confirmUnsel)
      unselButton = (
        <Button sx={{ ml: 0 }} variant='outlined' onClick={props.confirmUnsel}>
          Unselect
        </Button>
    );

    return (
      <div>
        <Button sx={{ p: 0.5, textAlign: 'left', justifyContent: 'left' }} variant='text' onClick={handleOpen} color='inherit'>
          <img height={80} src={"pic/" + i + ".svg"} alt={name}/>
          {/* {name} */}
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby={name}
          aria-describedby={'info for ' + name + ' case'}
        >
          <Box sx={style}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <img width='200' src={"pic/" + i + ".svg"} alt={name}/>
              <Typography variant="h4" component="h2">
                #{i} {name}
              </Typography>
              <Typography>
                Algorithm:<br/>
                {alg1}
              </Typography>
              {altAlg}
              <Typography>
                Setup:<br/>
                {inverseScramble(alg1)/* ollMap[i][0] */}
              </Typography>
              {unselButton}
            </Box>
          </Box>
        </Modal>
      </div>
    );
  }