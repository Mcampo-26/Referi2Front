import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import usePdfStore from '../store/UsePdfStore';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme
} from "@mui/material";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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
      setContent(`Empresa: ${qr.empresaId.name}\nUsuario Asignado: ${qr.assignedTo.nombre}`);
      setQrUpdates(qr.updates || []);
      setQrUsedAt(qr.usedAt); // Assuming `usedAt` is the field containing the usage time
    }
  }, [getPdfs, location.state]);



  const generatePdf = () => {
    const doc = new jsPDF();
    let y = 10;
    const sectionSpacing = 30;  // Increased space for the first section
    const subLineSpacing = 8;   // Space between sublines within each update
    const standardSpacing = 15; // Standard space for other sections

    doc.text(`Nombre: ${title}`, 10, y);
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
      y += subLineSpacing;
      doc.text(`   Descuento: ${update.discount}%`, 10, y); // Include discount in the PDF
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
        <Typography variant="h4" mb={4} className="text-center">Gestión de Reportes</Typography>
      </Box>
      <Box mb={4}>
        <Typography variant="h6">Nombre: {title}</Typography>
        <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>{content}</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={generatePdf}
          sx={{ mt: 2 }}
        >
          Generar PDF
        </Button>
      </Box>
      <TableContainer component={Paper} className={`shadow-lg rounded-lg overflow-hidden border ${theme.palette.mode === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
        <Table>
          <TableHead className={`${theme.palette.mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>
            <TableRow>
              <StyledTableCell>N°</StyledTableCell>
              <StyledTableCell>Fecha</StyledTableCell>
              <StyledTableCell>Servicio</StyledTableCell>
              <StyledTableCell>Detalles</StyledTableCell>
              <StyledTableCell>Descuento</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {qrUpdates.map((update, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{new Date(update.updatedAt).toLocaleString()}</TableCell>
                <TableCell>{update.service?.name || 'N/A'}</TableCell>
                <TableCell>{update.details}</TableCell>
                <TableCell>{update.discount}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PdfManager;
