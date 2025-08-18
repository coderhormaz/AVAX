import fs from 'fs';

// Read the AIDeployment.tsx file
const filePath = './src/components/AIDeployment.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the createToken call to add gas limit
const oldPattern = /const tx = await masterFactory\.createToken\(name, ticker, supply\);/g;
const newPattern = `const tx = await masterFactory.createToken(name, ticker, supply, {
        gasLimit: 2500000, // Increased gas limit to prevent stuck transactions
      });`;

content = content.replace(oldPattern, newPattern);

// Write the file back
fs.writeFileSync(filePath, content);

console.log('✅ Successfully added gas limit to token creation in AIDeployment.tsx');
