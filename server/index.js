const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5001;

const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileNameWithoutExt = path.parse(file.originalname).name;
    const fileDir = path.join(publicDir, fileNameWithoutExt);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    cb(null, fileDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const process_file = 'process_ver6.py'

  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  console.log('File received:', req.file);

  const fileNameWithoutExt = path.parse(req.file.originalname).name;
  const publicFileDir = path.join(publicDir, fileNameWithoutExt);
  const publicImagesDir = path.join(publicFileDir, 'images');
  const outputFilePath = path.join(publicFileDir, `processed_${req.file.originalname}`);

  if (!fs.existsSync(publicFileDir)) {
    fs.mkdirSync(publicFileDir, { recursive: true });
  }
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  const publicFilePath = path.join(publicFileDir, req.file.originalname);

  const pythonProcess = spawn('python3', [process_file, publicFilePath, outputFilePath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      if (fs.existsSync(outputFilePath)) {
        const downloadLink = `/public/${fileNameWithoutExt}/processed_${req.file.originalname}`;
        console.log(`Download link: ${downloadLink}`);
        res.json({ downloadLink });
      } else {
        res.status(500).send('Processed file not found');
      }
    } else {
      res.status(500).send('Error processing file');
    }
  });
});

app.use('/public', express.static(publicDir));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
