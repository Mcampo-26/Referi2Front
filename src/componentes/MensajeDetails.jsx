import React from 'react';
import { Paper, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const MensajeDetails = ({ selectedMessage, handleDeleteMessage }) => {
  return (
    <Paper className="p-4 bg-white dark:bg-gray-800 shadow-md" style={{ height: 'calc(60vh - 50px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {selectedMessage ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Typography variant="h5" className="text-gray-900 dark:text-white font-bold">
                {selectedMessage.sender ? selectedMessage.sender.nombre : 'Remitente desconocido'}
              </Typography>
              <Typography variant="body1" className="text-gray-700 dark:text-gray-300">
                {selectedMessage.sender ? selectedMessage.sender.email : 'Correo desconocido'}
              </Typography>
            </div>
            <IconButton
              color="secondary"
              onClick={() => handleDeleteMessage(selectedMessage._id)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
          <Typography variant="body1" className="text-gray-800 dark:text-white mb-4" style={{ flexGrow: 1 }}>
            {selectedMessage.content}
          </Typography>
        </>
      ) : (
        <Typography variant="body1" className="text-gray-600 dark:text-gray-300" style={{ flexGrow: 1 }}>
          Selecciona un mensaje para verlo
        </Typography>
      )}
    </Paper>
  );
};

export default MensajeDetails;
