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
  
    return (
      <div>
        <Button variant='text' onClick={handleOpen} color='inherit'>{name}</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby={name}
          aria-describedby={'info for ' + name + ' case'}
        >
          <Box sx={style}>
            <img src={"pic/" + i + ".svg"} alt={name}/>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              #{i} {name}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Algorithm:<br/>
              {alg1}
              {alg2 !== "" ? <><br/>{alg2}</> : ""}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Setup:<br/>
              {inverseScramble(alg1)/* ollMap[i][0] */}
            </Typography>
          </Box>
        </Modal>
      </div>
    );
  }