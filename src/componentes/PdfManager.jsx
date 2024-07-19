import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import usePdfStore from '../store/UsePdfStore';
import {
  Box, Button, Container, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, useTheme
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import jsPDF from "jspdf";

const MySwal = withReactContent(Swal);

const StyledTableCell = ({ children }) => {
  const theme = useTheme();
  return (
    <TableCell style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
      {children}
    </TableCell>
  );
};

const PdfManager = () => {
  const theme = useTheme();
  const location = useLocation();
  const { pdfs, getPdfs, deletePdf, loading } = usePdfStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [qrUpdates, setQrUpdates] = useState([]);
  const [qrUsedAt, setQrUsedAt] = useState(null);

  useEffect(() => {
    getPdfs();
    if (location.state && location.state.qr) {
      const { qr } = location.state;
      setTitle(qr.nombre);
      setContent(`Empresa: ${qr.empresaId.name}\nUsuario Asignado: ${qr.assignedTo.nombre}\nDescuento: ${qr.value}%`);
      setQrUpdates(qr.updates || []);
      setQrUsedAt(qr.usedAt); // Assuming `usedAt` is the field containing the usage time
    }
  }, [getPdfs, location.state]);

  const handleDelete = (id) => {
    MySwal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo!"
    }).then((result) => {
      if (result.isConfirmed) {
        deletePdf(id);
        MySwal.fire("¡Eliminado!", "Tu archivo ha sido eliminado.", "success");
      }
    });
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    let y = 10;
    const sectionSpacing = 30;  // Increased space for the first section
    const subLineSpacing = 8;   // Space between sublines within each update
    const standardSpacing = 15; // Standard space for other sections

    doc.text(`Title: ${title}`, 10, y);
    y += standardSpacing;
    doc.text(`Empresa: ${content}`, 10, y);
    y += sectionSpacing; // Increased space after the first section
    if (qrUsedAt) {
      doc.text(`Used At: ${new Date(qrUsedAt).toLocaleString()}`, 10, y);
      y += standardSpacing;
    }
    qrUpdates.forEach((update, index) => {
      doc.text(`${index + 1}. Fecha: ${new Date(update.updatedAt).toLocaleString()}`, 10, y);
      y += subLineSpacing;
      doc.text(`   Servicio: ${update.service?.name || 'N/A'}`, 10, y);
      y += subLineSpacing;
      doc.text(`   Detalles: ${update.details}`, 10, y);
      y += standardSpacing; // Standard space after each update
    });

    doc.save('document.pdf');
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!Array.isArray(pdfs)) {
    return <p>No hay PDFs disponibles.</p>;
  }

  return (
    <Container className={theme.palette.mode === 'dark' ? 'theme-dark' : 'theme-light'}>
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Typography variant="h4" mb={4} className="text-center">Gestión de PDFs</Typography>
      </Box>
      <Box mb={4}>
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
            },
            '& .MuiInputBase-input': {
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
            },
          }}
        />
        <TextField
          label="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
            },
            '& .MuiInputBase-input': {
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
            },
          }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={generatePdf}
        >
          Generar PDF
        </Button>
      </Box>
      <TableContainer component={Paper} className={`shadow-lg rounded-lg overflow-hidden border ${theme.palette.mode === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
        


        
      </TableContainer>
    </Container>
  );
};

export default PdfManager;
