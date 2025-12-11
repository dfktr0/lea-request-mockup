
import React, { useState } from 'react';
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function App() {
  const [page, setPage] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [fileError, setFileError] = useState("");

  function isValidEmail(e) {
    const major = ["gmail","yahoo","outlook","hotmail","aol","icloud","protonmail","yandex","zoho","mail","gmx"];
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(e)) return false;
    if (e.endsWith(".com")) return false;
    const domain = e.split("@")[1].split(".")[0];
    if (major.includes(domain)) return false;
    return true;
  }

  async function handleFile(e){
    setFileError("");
    const f = e.target.files[0];
    if (!f) return;

    if(f.type === "application/pdf"){
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: buf}).promise;
      let text = "";
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it=>it.str).join(" ");
      }
      if(/\d{13,19}/.test(text) || /\d{3}-\d{2}-\d{4}/.test(text)){
        setFileError("PII detected in PDF. Upload blocked.");
      }
    }
  }

  function submitEmail(){
    if(!isValidEmail(email)){ alert("Unverified email"); return; }
    const c = String(Math.floor(100000 + Math.random()*900000));
    setGeneratedCode(c);
    alert("Your 2FA code is: "+c);
    setPage("code");
  }

  function submitCode(){
    if(code === generatedCode) setPage("form");
    else alert("Invalid code");
  }

  if(page==="email") return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Enter Email</h1>
      <input className="text-black p-2" value={email} onChange={e=>setEmail(e.target.value)} />
      <button className="p-2 bg-green-500 ml-2" onClick={submitEmail}>Submit</button>
    </div>
  );

  if(page==="code") return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Enter 2FA Code</h1>
      <input className="text-black p-2" value={code} onChange={e=>setCode(e.target.value)} />
      <button className="p-2 bg-green-500 ml-2" onClick={submitCode}>Verify</button>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">LEA Request Form</h1>
      <input type="file" onChange={handleFile} className="mb-4" />
      {fileError && <p className="text-red-400">{fileError}</p>}
      <p>Mock form here...</p>
    </div>
  );
}
