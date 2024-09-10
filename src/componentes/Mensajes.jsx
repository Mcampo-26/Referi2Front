import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { 
  Grid, 
  Paper, 
  Typography, 
  IconButton, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Hidden 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';
import SendIcon from '@mui/icons-material/Send';
import useMensajesStore from '../store/useMensajesStore';
import useUsuariosStore from '../store/useUsuariosStore';
import Swal from 'sweetalert2';
import MensajeDetails from './MensajeDetails';
import EmojiPickerButton from './EmojiPickerButton';
import { useTheme } from '@mui/material/styles';

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

  const theme = useTheme(); // Obtener el tema actual

  // Referencia para el editor de mensajes
  const editorRef = useRef(null);

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

  const handleReply = (message) => {
    if (messageType === 'received' && message.sender) {
      setSelectedRecipient(message.sender._id); // El remitente del mensaje recibido
    } else if (messageType === 'sent' && message.recipient) {
      setSelectedRecipient(message.recipient._id); // El destinatario del mensaje enviado
    }
    setTimeout(() => {
      editorRef.current.focus(); // Enfoca el editor de mensajes
    }, 0);
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
    
    // Llama a handleReply para establecer el destinatario automáticamente
    handleReply(message);
  };

  const handleSelectMessageType = (type) => {
    setMessageType(type);
    setSelectedRecipient(''); // Reinicia el destinatario seleccionado al cambiar de tipo de mensaje
  };

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
    <Grid container spacing={2} className="p-2 sm:p-4 max-w-5xl mx-auto h-full">
      {/* Columna Izquierda: Navegación y Listado de Mensajes */}
      <Grid item xs={12} md={3} sx={{ borderRight: `1px solid ${theme.palette.divider}`, height: '100%' }}>
        <Paper sx={{ p: 4, bgcolor: theme.palette.background.paper, boxShadow: 3, height: '100%' }}>
          <div className="flex flex-col items-center justify-between mb-4">
            <Button
              fullWidth
              variant={messageType === 'received' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<InboxIcon />}
              onClick={() => handleSelectMessageType('received')}
              color="primary"
              sx={{ mb: 2 }}
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
              sx={{ mt: 2 }}
            >
              Enviados
            </Button>
          </div>

          {loadingMensajes ? (
            <Typography variant="body2" sx={{ p: 4, color: theme.palette.text.secondary }}>Cargando mensajes...</Typography>
          ) : errorMensajes ? (
            <Typography variant="body2" sx={{ p: 4, color: theme.palette.error.main }}>{errorMensajes}</Typography>
          ) : (
            <List>
              {messages && messages
                .filter(message => messageType === 'received' ? message.recipient._id === userId : message.sender._id === userId)
                .map((message) => (
                  <React.Fragment key={message._id}>
                    <ListItem
                      button
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: messageType === 'received'
                          ? (message.read ? theme.palette.background.default : '#e0e0e0')
                          : (message.read ? theme.palette.background.paper : '#f0f0f0'),
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        }
                      }}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <ListItemText
                        primary={message.sender && message.sender._id === userId ? userName : message.sender ? message.sender.nombre : 'Remitente desconocido'}
                        secondary={message.content}
                        primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 'bold', color: theme.palette.text.primary } }}
                        secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: theme.palette.text.secondary } }}
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
      <Grid item xs={12} md={9} className="flex flex-col h-full">
        <div className="flex flex-col h-full w-full">
          <Paper sx={{ p: 4, bgcolor: theme.palette.background.paper, boxShadow: 3, mb: 4, flexGrow: 1, overflow: 'auto' }}>
            <MensajeDetails 
              selectedMessage={selectedMessage} 
              handleReply={handleReply}
            />
          </Paper>

          <Paper sx={{ p: 4, bgcolor: theme.palette.background.paper, boxShadow: 3 }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 6 }}>
              <InputLabel sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>Seleccionar destinatario</InputLabel>
              <Select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                label="Seleccionar destinatario"
                sx={{
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.text.primary,
                  }
                }}
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

            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={setEditorState}
              handleKeyCommand={handleKeyCommand}
              placeholder="Escribe tu mensaje aquí..."
              className="border rounded-lg p-4 w-full mb-8"
              style={{
                minHeight: '250px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
              }}
            />

            <div className="flex justify-between items-center mt-10 w-full gap-8">
              <Hidden smDown>
                <EmojiPickerButton onEmojiSelect={handleInsertEmoji} />
              </Hidden>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                className="ml-2"
              >
                Enviar
              </Button>
            </div>
          </Paper>
        </div>
      </Grid>
    </Grid>
  );
};
