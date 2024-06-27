const { exec } = require('child_process');

const packages = [
  'fitz',
  'reportlab',
  'docx',
  'pptx',
  'translate',
  'PyMuPDF',
  'python-docx',
  'python-pptx',
];

// Function to install a package
function installPackage(packageName) {
  return new Promise((resolve, reject) => {
    exec(`pip3 install ${packageName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error installing ${packageName}:`, stderr);
        reject(error);
      } else {
        console.log(`Successfully installed ${packageName}:`, stdout);
        resolve(stdout);
      }
    });
  });
}

// Install all packages sequentially
async function installPackages() {
  for (const packageName of packages) {
    try {
      await installPackage(packageName);
    } catch (error) {
      console.error(`Failed to install ${packageName}:`, error);
    }
  }
  console.log('All packages installed');
}

installPackages();
