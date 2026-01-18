import jsPDF from 'jspdf';
export const generatePDF = ({ paiement, recu }) => {
  if (!recu || !paiement) return;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Reçu de paiement', 20, 20);

  doc.setFontSize(14);
  doc.text(`Numéro de transaction: ${paiement.numeroTransaction}`, 20, 35);
  doc.text(`Numéro de reçu: ${recu.numeroRecu}`, 20, 45);
  doc.text(`Montant: ${recu.montant} FCFA`, 20, 55);
  doc.text(`Téléphone: ${recu.telephone}`, 20, 65);
  doc.text(`Concours: ${recu.concours}`, 20, 75);

  // Ajouter le QR Code
  if (recu.qrCode) {
    doc.addImage(recu.qrCode, 'PNG', 150, 35, 50, 50);
  }

  doc.setFontSize(10);
  doc.text('Merci pour votre paiement. Veuillez conserver ce reçu.', 20, 135);

  doc.save(`recu-${recu.numeroRecu}.pdf`);
};
