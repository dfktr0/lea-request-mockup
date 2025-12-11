import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function App() {
  const [page, setPage] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    agentEmail: '',
    agentPhone: '',
    caseNumber: '',
    emergency: false,
    emergencyReason: '',
    country: '',
    agency: '',
    customAgency: '',
    dataSubjectEmail: '',
    dataRequested: { BSI: false, IP: false, Messaging: false },
    additionalInfo: '',
    fromDate: '',
    toDate: '',
    documentType: '',
    declare: false,
  });

  const majorEmails = ['gmail','yahoo','outlook','hotmail','aol','icloud','protonmail','yandex','zoho','mail','gmx'];
  const countries = ["United States", "Brazil", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Ireland", "Belgium", "Switzerland", "Austria", "Portugal", "Greece", "Poland", "Czech Republic", "Slovakia", "Hungary", "Luxembourg", "Liechtenstein", "Malta", "Estonia", "Latvia", "Lithuania", "Other"];
  const agencies = ["Police", "Europol", "Interpol", "FBI", "Department of Homeland Security", "DEA", "Sheriff's Office", "Tribal Police", "State Police", "Other"];
  const documentTypes = ["Subpoena", "Search Warrant", "NDO", "Other"];

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
      if (/(\d{13,19}\b)|(\d{3}-\d{2}-\d{4}\b)/.test(text)) {
        setFileError('PII detected in PDF. Upload blocked.');
        setFile(null);
      }
    }
  }

  function submitEmail() {
    if (!isValidEmail(email)) {
      setEmailError('Unverified email');
      return;
    }
    setEmailError('');
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

  function toggleDataRequested(type) {
    setFormData(prev => ({
      ...prev,
      dataRequested: { ...prev.dataRequested, [type]: !prev.dataRequested[type] }
    }));
  }

  function submitForm() {
    if (!file) {
      alert('Please upload a file before submitting.');
      return;
    }
    if (formData.emergency && !formData.emergencyReason.trim()) {
      alert('Emergency reason is required.');
      return;
    }
    if (!formData.dataRequested.BSI && !formData.dataRequested.IP && !formData.dataRequested.Messaging) {
      alert('Please select at least one type of data requested.');
      return;
    }
    if (!formData.declare) {
      alert('You must declare under penalty of perjury.');
      return;
    }
    alert('Form submitted successfully (mock).');
  }

  const inputClass = 'text-black p-3 rounded w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700 bg-gray-200';
  const labelClass = 'block text-gray-200 mb-1 font-semibold';
  const sectionClass = 'mb-8';
  const cardClass = 'bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700';
  const headerClass = 'text-3xl md:text-4xl font-bold mb-10 text-green-500 text-center';
  const buttonClass = 'w-full px-6 py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition shadow-lg';
  const footnoteClass = 'text-gray-400 text-sm mt-1 italic';
  const checkButtonClass = 'mr-4 mb-2 px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-green-500 transition';

  if (page === 'email') return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-green-500">Enter Your Email</h1>
      <input className={inputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
      {emailError && <p className="text-red-500 mt-2 font-semibold">{emailError}</p>}
      <button className="mt-4 px-6 py-3 bg-green-500 rounded font-semibold hover:bg-green-600 transition shadow-lg" onClick={submitEmail}>Submit</button>
    </div>
  );

  if (page === 'code') return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-green-500">Enter 2FA Code</h1>
      <input className={inputClass} value={code} onChange={e => setCode(e.target.value)} placeholder="6-digit Code" />
      <button className="mt-4 px-6 py-3 bg-green-500 rounded font-semibold hover:bg-green-600 transition shadow-lg" onClick={submitCode}>Verify</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-800 flex justify-center py-12 px-4">
      <div className={cardClass}>
        <h1 className={headerClass}>LEA Request Form</h1>

        <div className={sectionClass}>
          <label className={labelClass}>Upload File Official Law Enforcement documentation</label>
          <input type="file" onChange={handleFileUpload} className="mb-2" />
          {fileError && <p className="text-red-400 font-semibold">{fileError}</p>}
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Law Enforcement Agent Full Name</label>
          <input name="fullName" value={formData.fullName} onChange={handleFormChange} className={inputClass} />

          <label className={labelClass + ' mt-4'}>Law Enforcement Agent Email Address</label>
          <input name="agentEmail" value={formData.agentEmail} onChange={handleFormChange} placeholder="email@example.com" className={inputClass} />

          <label className={labelClass + ' mt-4'}>Law Enforcement Agent Telephone Number (Optional)</label>
          <input name="agentPhone" value={formData.agentPhone} onChange={handleFormChange} placeholder="(123) 456-7890" className={inputClass} />
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Law Enforcement Case Number</label>
          <input name="caseNumber" value={formData.caseNumber} onChange={handleFormChange} className={inputClass} />
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Emergency?</label>
          <input type="checkbox" name="emergency" checked={formData.emergency} onChange={handleFormChange} className="mr-2" />
          {formData.emergency && (
            <input name="emergencyReason" value={formData.emergencyReason} onChange={handleFormChange} placeholder="Reason" className={inputClass + ' mt-2'} />
          )}
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Country</label>
          <select name="country" value={formData.country} onChange={handleFormChange} className={inputClass}>
            <option value="">Select a country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {formData.country === 'United States' && (
            <p className={footnoteClass}>For United States requests, a valid Search Warrant, Subpoena, NDO, or similar document must be submitted.</p>
          )}
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Law Enforcement Agency</label>
          <select name="agency" value={formData.agency} onChange={handleFormChange} className={inputClass}>
            <option value="">Select an agency</option>
            {agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {formData.agency === 'Other' && (
            <input name="customAgency" value={formData.customAgency} onChange={handleFormChange} placeholder="Specify agency" className={inputClass + ' mt-2'} />
          )}
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Data Subject Email Address</label>
          <input name="dataSubjectEmail" value={formData.dataSubjectEmail} onChange={handleFormChange} placeholder="email@example.com" className={inputClass} />
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Data Requested</label>
          <div>
            {['BSI','IP','Messaging'].map(type => (
              <button type="button" key={type} className={checkButtonClass + (formData.dataRequested[type] ? ' bg-green-500' : '')} onClick={() => toggleDataRequested(type)}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Additional Info</label>
          <input name="additionalInfo" value={formData.additionalInfo} onChange={handleFormChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className={labelClass}>From Date</label>
            <input type="date" name="fromDate" value={formData.fromDate} onChange={handleFormChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>To Date</label>
            <input type="date" name="toDate" value={formData.toDate} onChange={handleFormChange} className={inputClass} />
          </div>
        </div>

        <div className={sectionClass}>
          <label className={labelClass}>Document Type</label>
          <select name="documentType" value={formData.documentType} onChange={handleFormChange} className={inputClass}>
            <option value="">Select document type</option>
            {documentTypes.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <label className="block mb-6 text-gray-300">
          <input type="checkbox" name="declare" checked={formData.declare} onChange={handleFormChange} className="mr-2" />
          I declare under penalty of perjury under the laws of the United States of America that the foregoing is true and correct.
        </label>

        <button className={buttonClass} onClick={submitForm}>Submit Form</button>
      </div>
    </div>
  );
}
