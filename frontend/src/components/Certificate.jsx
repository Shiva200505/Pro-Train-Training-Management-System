import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = ({ trainingData, onClose }) => {
  const downloadCertificate = async () => {
    const certificate = document.getElementById('certificate');
    try {
      const canvas = await html2canvas(certificate, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const imgX = (pageWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('training-certificate.pdf');
    } catch (err) {
      console.error('Error generating certificate:', err);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
        <div id="certificate" className="bg-white p-8 relative border-8 border-blue-800">
          <div className="text-center">
            <h1 className="text-4xl font-serif mb-8 text-blue-800">Certificate of Completion</h1>
            <div className="text-xl mb-8">This is to certify that</div>
            <div className="text-3xl font-bold mb-8 text-blue-900">{trainingData?.user?.name || 'Shivam'}</div>
            <div className="text-xl mb-8">has successfully completed the training</div>
            <div className="text-3xl font-bold mb-8 text-blue-900">{trainingData?.title || 'ML'}</div>
            <div className="text-xl mb-8">
              conducted from {new Date(trainingData?.startDate).toLocaleDateString()} to {new Date(trainingData?.endDate).toLocaleDateString()}
            </div>
            <div className="text-xl mt-16">Issued on {currentDate}</div>
            
            <div className="mt-12 flex justify-between px-12">
              <div className="text-center">
                <div className="border-t-2 border-black w-48">
                  <p className="text-lg mt-2">Training Coordinator</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-black w-48">
                  <p className="text-lg mt-2">Trainer</p>
                  <p className="text-lg">{trainingData?.trainer || 'Ashish'}</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                className="w-24 h-24 object-contain opacity-30"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={downloadCertificate}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Download Certificate
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;