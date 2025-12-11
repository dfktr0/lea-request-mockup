import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function App() {
  const [page, setPage] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    caseNumber: '',
    emergency: false,
    emergencyReason: '',
    country: '',
    agency: '',
    dataRequested: [],
    additionalInfo: '',
    fromDate: '',
    toDate: '',
    documentType: '',
    declare: false,
  });

  const majorEmails = ['gmail','yahoo','outlook','hotmail','aol','icloud','protonmail','yandex','zoho','mail','gmx'];

  function isValidEmail(e) {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(e)) return false;
    if (e.endsWith('.com')) return false;
    const domain = e.split('@')[1].split('.')[0];
    if (majorEmails.includes(domain)) return false;
    return true;
  }

  async function handleFileUpload(e) {
    setFileError('');
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);

    if (f.type === 'application/pdf') {
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(' ');
      }
      if (/(\b\d{13,19}\b)|(\b\d{3}-\d{2}-\d{4}\b)/.test(text)) {
        setFileError('PII detected in PDF. Upload blocked.');
        setFile(null);
      }
    }
  }

  function submitEmail() {
    if (!isValidEmail(email)) {
      alert('Unverified email');
      return;
    }
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(c);
    alert('Your 2FA code is: ' + c);
    setPage('code');
  }

  function submitCode() {
    if (code === generatedCode) setPage('form');
    else alert('Invalid code');
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function submitForm() {
    if (!file) {
      alert('Please upload a file before submitting.');
      return;
    }
    if (!formData.declare) {
      alert('You must declare under penalty of perjury.');
      return;
    }
    alert('Form submitted successfully (mock).');
    // Here you could reset or navigate to a confirmation page
  }

  if (page === 'email') return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Enter Email</h1>
      <input className="text-black p-2" value={email} onChange={e => setEmail(e.target.value)} />
      <button className="p-2 bg-green-500 ml-2" onClick={submitEmail}>Submit</button>
    </div>
  );

  if (page === 'code') return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Enter 2FA Code</h1>
      <input className="text-black p-2" value={code} onChange={e => setCode(e.target.value)} />
      <button className="p-2 bg-green-500 ml-2" onClick={submitCode}>Verify</button>
    </div>
  );

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl mb-4">LEA Request Form</h1>

      <label className="block">Upload File (PDF, no PII):</label>
      <input type="file" onChange={handleFileUpload} className="mb-2" />
      {fileError && <p className="text-red-400">{fileError}</p>}

      <label className="block">Full Name:</label>
      <input name="fullName" value={formData.fullName} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">Case Number:</label>
      <input name="caseNumber" value={formData.caseNumber} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">Emergency?</label>
      <input type="checkbox" name="emergency" checked={formData.emergency} onChange={handleFormChange} />
      {formData.emergency && (
        <input name="emergencyReason" value={formData.emergencyReason} onChange={handleFormChange} placeholder="Reason" className="text-black p-1 w-full mt-1" />
      )}

      <label className="block">Country:</label>
      <input name="country" value={formData.country} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">Law Enforcement Agency:</label>
      <input name="agency" value={formData.agency} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">Data Requested:</label>
      <select multiple name="dataRequested" value={formData.dataRequested} onChange={e => setFormData(prev => ({...prev, dataRequested: Array.from(e.target.selectedOptions, o => o.value)}))} className="text-black p-1 w-full">
        <option value="BSI">Basic Subscriber Information (BSI)</option>
        <option value="IP">IP Data</option>
        <option value="Messaging">Messaging Data</option>
      </select>

      <label className="block">Additional Info:</label>
      <input name="additionalInfo" value={formData.additionalInfo} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">From Date:</label>
      <input type="date" name="fromDate" value={formData.fromDate} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">To Date:</label>
      <input type="date" name="toDate" value={formData.toDate} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">Document Type:</label>
      <input name="documentType" value={formData.documentType} onChange={handleFormChange} className="text-black p-1 w-full" />

      <label className="block">
        <input type="checkbox" name="declare" checked={formData.declare} onChange={handleFormChange} />
        I declare under penalty of perjury under the laws of the United States of America that the foregoing is true and correct.
      </label>

      <button className="p-2 bg-green-500" onClick={submitForm}>Submit Form</button>
    </div>
  );
}
