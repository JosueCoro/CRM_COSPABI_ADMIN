import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Type extension for autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

export const PdfService = {
    /**
     * Genera el Aviso de Cobranza (Factura)
     */
    async generateAvisoCobranza(factura: any) {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- CABECERA ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('COOPERATIVA DE SERVICIOS PÚBLICOS "COSPABI" R.L.', 10, 15);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Calle s/n • Cel: 773 99315 - 687 63439 • El Bisito - Cotoca - Santa Cruz - Bolivia', 10, 20);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 150, 243); // Azul
        doc.text('AVISO DE COBRANZA', pageWidth / 2, 30, { align: 'center' });

        // Cuadro de Información Principal
        doc.setDrawColor(200);
        doc.rect(10, 35, pageWidth - 20, 30);

        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.text(`COD. FIJO: ${factura.cliente?.codigo_fijo || '---'}`, 15, 42);
        doc.text(`COD. UB: ${factura.cliente?.codigo_ubicacion || '---'}`, 60, 42);
        doc.text(`CATEGORÍA: ${factura.cliente?.categoria || '---'}`, 110, 42);
        doc.text(`FECHA EMISIÓN: ${factura.fecha_emision}`, 160, 42);

        doc.text(`NOMBRE: ${factura.cliente?.nombre_completo || '---'}`, 15, 50);
        doc.text(`ACTIVIDAD: VIVIENDA`, 110, 50);

        doc.text(`DIRECCIÓN: ${factura.cliente?.direccion || '---'}`, 15, 58);

        // --- SECCIÓN DE LECTURAS ---
        doc.setFont('helvetica', 'bold');
        doc.text('FECHAS Y LECTURAS', 10, 75);
        doc.line(10, 76, 50, 76);

        const lecturaData = [
            ['LECTURA ACTUAL', 'LECTURA ANTERIOR', 'CONSUMO M3'],
            [
                `${factura.lectura?.lectura_actual || '---'}`,
                `${factura.lectura?.lectura_anterior || '---'}`,
                `${factura.total_consumo} m³`
            ]
        ];

        doc.autoTable({
            startY: 80,
            head: [lecturaData[0]],
            body: [lecturaData[1]],
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: 50, fontStyle: 'bold' },
            styles: { halign: 'center' }
        });

        // --- DETALLE DE COBROS ---
        const currentY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS FACTURADOS', 110, currentY);

        const columns = ['Concepto', 'Importe (Bs)'];
        const rows = factura.detalles?.map((d: any) => [d.concepto, `${Number(d.importe).toFixed(2)} Bs`]) || [];

        doc.autoTable({
            startY: currentY + 5,
            head: [columns],
            body: rows,
            theme: 'plain',
            headStyles: { fillColor: [255, 255, 255], textColor: 100, fontStyle: 'bold', borderBottom: 1 },
            margin: { left: 110 },
            columnStyles: { 1: { halign: 'right' } }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`TOTAL FACTURA:`, 140, finalY + 5);
        doc.setFontSize(14);
        doc.setTextColor(25, 135, 84); // Verde
        doc.text(`${Number(factura.total_factura).toFixed(2)} Bs`, 195, finalY + 5, { align: 'right' });

        // Footer
        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('SR. SOCIO EVITE EL CORTE CANCELANDO SU FACTURA PUNTUALMENTE', pageWidth / 2, 280, { align: 'center' });

        doc.save(`Aviso_${factura.cliente?.codigo_fijo}_${factura.periodo}.pdf`);
    },

    /**
     * Genera el Recibo de Pago (Cancelado)
     */
    async generateReciboPago(pago: any) {
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, 150] // Formato ticket
        }) as jsPDFWithAutoTable;

        const pageWidth = 80;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('COOPERATIVA COSPABI R.L.', pageWidth / 2, 10, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`RECIBO NRO: ${pago.numero_recibo}`, pageWidth / 2, 18, { align: 'center' });

        doc.setDrawColor(200);
        doc.line(5, 22, 75, 22);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`SOCIO: ${pago.factura?.cliente?.nombre_completo || '---'}`, 5, 28);
        doc.text(`CÓDIGO: ${pago.factura?.cliente?.codigo_fijo || '---'}`, 5, 33);
        doc.text(`PERIODO: ${pago.factura?.periodo || '---'}`, 5, 38);
        doc.text(`FECHA PAGO: ${pago.fecha_pago}`, 5, 43);

        doc.line(5, 48, 75, 48);

        // Detalle simplificado
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE', 5, 53);
        doc.text('IMPORTE', 75, 53, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.text('PAGO DE FACTURA AGUA', 5, 58);
        doc.text(`${Number(pago.monto_pagado).toFixed(2)} Bs`, 75, 58, { align: 'right' });

        doc.line(5, 65, 75, 65);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 5, 72);
        doc.text(`${Number(pago.monto_pagado).toFixed(2)} Bs`, 75, 72, { align: 'right' });

        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text(`Cajero: ${pago.cajero}`, 5, 82);
        doc.text('GRACIAS POR SU PAGO', pageWidth / 2, 95, { align: 'center' });

        // Sello Cancelado
        doc.setDrawColor(0, 0, 255);
        doc.setLineWidth(0.5);
        doc.rect(50, 75, 25, 10);
        doc.setTextColor(0, 0, 255);
        doc.setFontSize(10);
        doc.text('PAGADO', 62.5, 82, { align: 'center' });

        doc.save(`Recibo_${pago.numero_recibo}.pdf`);
    }
};
