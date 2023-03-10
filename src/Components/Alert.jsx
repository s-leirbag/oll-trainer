import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

/**
 * DialogTitle with 'x' icon to close
 */
function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ ml: 1, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

/**
 * Custom Material alert/confirm dialog
 * If handleAgree is provided, the dialog will have agree/disagree buttons
 * Did not provide onClose to the Dialog, so you cannot escape/click out of it
 * Takes in a title prop for the alert and 'open' to open/close it
 */
export default function Alert(props) {
  const { open, title, handleClose, handleAgree } = props;

  // If handleAgree is provided, the dialog will have agree/disagree buttons
  let actions = ''
  if (handleAgree) {
    const handleAgreeThenClose = () => {
      handleClose();
      handleAgree();
    }
    actions = (
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleAgreeThenClose} autoFocus>
          Agree
        </Button>
      </DialogActions>
    )
  }

  return (
    <div>
      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          {title}
        </BootstrapDialogTitle>
        {actions}
      </BootstrapDialog>
    </div>
  );
}
