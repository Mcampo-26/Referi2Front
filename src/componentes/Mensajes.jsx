import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Grid, Paper, Typography, IconButton, MenuItem, Select, FormControl, InputLabel, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';
import SendIcon from '@mui/icons-material/Send';
import useMensajesStore from '../store/useMensajesStore';
import useUsuariosStore from '../store/useUsuariosStore';
import Swal from 'sweetalert2';
import MensajeDetails from './MensajeDetails';
import EmojiPickerButton from './EmojiPickerButton'; // Asegúrate de importar el componente de la barra de herramientas

export const Mensajes = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageType, setMessageType] = useState('received');

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const empresaId = localStorage.getItem('empresaId');

  const { messages, getMessagesByUser, createMessage, deleteMessage, markMessageAsRead, loading: loadingMensajes, error: errorMensajes } = useMensajesStore();
  const { usuarios, getUsuariosByEmpresa, loading: loadingUsuarios, error: errorUsuarios } = useUsuariosStore();

  useEffect(() => {
    if (userId) getMessagesByUser(userId);
    if (empresaId) getUsuariosByEmpresa(empresaId);
  }, [userId, empresaId, getMessagesByUser, getUsuariosByEmpresa]);

  const handleSendMessage = async () => {
    const content = editorState.getCurrentContent().getPlainText();
    if (!content.trim() || !selectedRecipient) return;
    await createMessage({ sender: userId, recipient: selectedRecipient, content });
    setEditorState(EditorState.createEmpty());
  };

  const handleDeleteMessage = async (messageId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await deleteMessage(messageId);
      Swal.fire('Eliminado', 'El mensaje ha sido eliminado.', 'success');
    }
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    markMessageAsRead(message._id);
  };

  const handleSelectMessageType = (type) => setMessageType(type);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleInsertEmoji = (emoji) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const contentStateWithEmoji = Modifier.insertText(contentState, selectionState, emoji);
    const newEditorState = EditorState.push(editorState, contentStateWithEmoji, 'insert-characters');
    setEditorState(newEditorState);
  };

  return (
    <Grid container spacing={2} className="p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Columna Izquierda: Navegación y Listado de Mensajes */}
      <Grid item xs={12} md={4} className="border-r dark:border-gray-700">
        <Paper className="p-4 bg-white dark:bg-gray-800 shadow-md h-full">
          <div className="flex items-center justify-between mb-4">
            <Button
              fullWidth
              variant={messageType === 'received' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<InboxIcon />}
              onClick={() => handleSelectMessageType('received')}
              color="primary"
              className="mb-2"
            >
              Recibidos
            </Button>
            <Button
              fullWidth
              variant={messageType === 'sent' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<SendIcon />}
              onClick={() => handleSelectMessageType('sent')}
              color="primary"
            >
              Enviados
            </Button>
          </div>
          {loadingMensajes ? (
            <Typography variant="body2" className="p-4 text-gray-600 dark:text-gray-300">Cargando mensajes...</Typography>
          ) : errorMensajes ? (
            <Typography variant="body2" className="p-4 text-red-500">{errorMensajes}</Typography>
          ) : (
            <List>
              {messages && messages
                .filter(message => messageType === 'received' ? message.recipient._id === userId : message.sender._id === userId)
                .map((message) => (
                  <React.Fragment key={message._id}>
                    <ListItem
                      button
                      className={`flex justify-between items-center ${
                        messageType === 'received'
                          ? (message.read ? 'bg-gray-100' : 'bg-blue-50')
                          : (message.read ? 'bg-gray-200' : 'bg-green-50')
                      } dark:bg-gray-700`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <ListItemText
                        primary={message.sender && message.sender._id === userId ? userName : message.sender ? message.sender.nombre : 'Remitente desconocido'}
                        secondary={message.content}
                        primaryTypographyProps={{ className: 'text-sm font-bold text-gray-900 dark:text-white' }}
                        secondaryTypographyProps={{ className: 'text-xs text-gray-700 dark:text-gray-300' }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message._id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          )}
        </Paper>
      </Grid>

      {/* Columna Derecha: Vista Detallada del Mensaje Seleccionado y Envío de Mensajes */}
      <Grid item xs={12} md={8}>
        <FormControl fullWidth variant="outlined" className="mb-4">
          <InputLabel>Seleccionar destinatario</InputLabel>
          <Select
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            label="Seleccionar destinatario"
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          >
            {loadingUsuarios ? (
              <MenuItem disabled>Cargando usuarios...</MenuItem>
            ) : errorUsuarios ? (
              <MenuItem disabled>{errorUsuarios}</MenuItem>
            ) : (
              usuarios.map((usuario) => (
                <MenuItem key={usuario._id} value={usuario._id}>
                  {usuario.nombre}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <Paper className="p-4 bg-white dark:bg-gray-800 shadow-md h-full">
          {selectedMessage ? (
            <MensajeDetails message={selectedMessage} />
          ) : (
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">Selecciona un mensaje para ver los detalles.</Typography>
          )}
          <div className="flex flex-col mt-4">
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              handleKeyCommand={handleKeyCommand}
              placeholder="Escribe tu mensaje aquí..."
              className="border rounded-lg p-2 bg-white dark:bg-gray-800"
            />
            <div className="flex justify-between items-center mt-2">
              <EmojiPickerButton onEmojiSelect={handleInsertEmoji} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                className="ml-2"
              >
                Enviar
              </Button>
            </div>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};


