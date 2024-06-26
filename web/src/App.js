import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import Logo from './images/thinkprompt_logo.jpeg';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [options, setOptions] = useState({
    uppercase: false,
    imageSeparation: false,
    translate: 'english' // Default selection
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCheckboxChange = (option) => {
    setOptions({
      ...options,
      [option]: !options[option]
    });
  };

  const handleSelectChange = (e) => {
    setOptions({
      ...options,
      translate: e.target.value
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    // Append selected options to formData
    Object.keys(options).forEach(key => {
      if (options[key]) {
        formData.append(key, true);
      }
    });

    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('File uploaded successfully');
      setDownloadLink(response.data.downloadLink);
      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      setMessage('Error uploading file');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={Logo} alt="Logo" className="logo" style={{ width: 48, height: 48 }} />
          <h1 style={{ color: 'black' }}>Thinkprompt</h1>
        </div>
        {/* <div className="language-selector" >
          <FontAwesomeIcon icon={faFlag} color='black' size='2x' />
        </div> */}
      </nav>
      <div className="container">
        <h1>File Upload</h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <input type="file" onChange={handleFileChange} style={{
            width: '80%',
            height: '135px',
            border: '4px dashed black',
            borderRadius: '24px'
          }} />
        </div>
        <div style={{ display: 'flex', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'calc(10%)' }}>
            <h2>Options: </h2>
            <div style={{ display: 'flex', gap: 4 }}>
              <label>
                <input type="checkbox" checked={options.uppercase} onChange={() => handleCheckboxChange('uppercase')} />
                Uppercase
              </label>
              <label>
                <input type="checkbox" checked={options.imageSeparation} onChange={() => handleCheckboxChange('imageSeparation')} />
                Image Separation
              </label>
              <label>
                <input type="checkbox" checked={options.translate} onChange={() => handleCheckboxChange('translate')} />
                Translate
              </label>
              <select value={options.translate} onChange={handleSelectChange}>
                <option value="english">English</option>
                <option value="vietnamese">Vietnamese</option>
              </select>
            </div>
          </div>

          <button onClick={handleUpload} style={{
            position: 'absolute',
            right: 'calc(10%)',
            borderRadius: '24px',
            alignSelf: 'center'
          }}>Upload</button>
        </div>

        {message && <p>{message}</p>}
        {downloadLink && (
          <p>
            <a href={downloadLink} download>
              Download Processed File
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
