import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';

const MensajeDetails = ({ selectedMessage, handleReply, messageType }) => {
  // Verifica si el tipo de mensaje es enviado
  const esMensajeEnviado = messageType === 'sent';



  return (
    <Paper
      className="p-4 bg-white dark:bg-gray-800 shadow-md"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
      }}
    >
      {selectedMessage ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              {/* Mostrar "Para:" si es un mensaje enviado, "De:" si es recibido */}
              <Typography variant="h6" className="text-gray-900 dark:text-white font-bold">
                {esMensajeEnviado ? 'Para: ' : 'De: '}
                {esMensajeEnviado
                  ? selectedMessage.recipient?.nombre || 'Desconocido'  // Mostrar destinatario si es enviado
                  : selectedMessage.sender?.nombre || 'Desconocido'}   
              </Typography>
              <Typography variant="body1" className="text-gray-700 dark:text-gray-300">
                {esMensajeEnviado
                  ? selectedMessage.recipient?.email || 'Correo desconocido'  // Mostrar correo del destinatario si es enviado
                  : selectedMessage.sender?.email || 'Correo desconocido'}  
              </Typography>
            </div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReplyIcon />}
              onClick={() => handleReply(selectedMessage)}
            >
              Responder
            </Button>
          </div>
          <Typography
            variant="body1"
            className="text-gray-800 dark:text-white mb-4"
            style={{ flexGrow: 1 }}
          >
            {selectedMessage.content}
          </Typography>
        </>
      ) : (
        <Typography
          variant="body1"
          className="text-gray-600 dark:text-gray-300"
          style={{ flexGrow: 1 }}
        >
          Selecciona un mensaje para verlo
        </Typography>
      )}
    </Paper>
  );
};

export default MensajeDetails;
