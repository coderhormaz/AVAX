/**
 * IPFS Debug and Test Component
 * Helps troubleshoot IPFS image upload and display issues
 */

import React, { useState } from 'react';
import { ipfsService } from '../services/ipfs';
import { CONFIG } from '../config';

export const IPFSDebugPanel: React.FC = () => {
  const [testImage, setTestImage] = useState<File | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testIPFSConfig = () => {
    addTestResult('Testing IPFS Configuration...');
    
    const lighthouseApiKey = CONFIG.STORAGE.LIGHTHOUSE_API_KEY;
    const pinataJWT = CONFIG.STORAGE.PINATA_JWT;
    
    addTestResult(`Lighthouse API Key: ${lighthouseApiKey ? '✅ Configured (' + lighthouseApiKey.slice(0, 8) + '...)' : '❌ Missing'}`);
    addTestResult(`Pinata JWT: ${pinataJWT ? '✅ Configured (' + pinataJWT.slice(0, 20) + '...)' : '❌ Missing'}`);
    
    if (!lighthouseApiKey && !pinataJWT) {
      addTestResult('❌ CRITICAL: No IPFS credentials found!');
      addTestResult('💡 Add VITE_LIGHTHOUSE_API_KEY or VITE_PINATA_JWT to .env');
    } else {
      addTestResult('✅ IPFS service should work! Try uploading an image.');
    }
  };

  const testImageUpload = async () => {
    if (!testImage) {
      addTestResult('❌ No test image selected');
      return;
    }

    setIsUploading(true);
    addTestResult(`🔄 Uploading test image: ${testImage.name}`);

    try {
      const hash = await ipfsService.uploadFile(testImage, 'test-image');
      setIpfsHash(hash);
      addTestResult(`✅ Upload successful! Hash: ${hash}`);
      
      // Test multiple gateways
      const gateways = [
        'https://gateway.pinata.cloud',
        'https://ipfs.io',
        'https://cloudflare-ipfs.com',
        'https://dweb.link'
      ];
      
      for (const gateway of gateways) {
        const url = ipfsService.getIPFSUrl(hash, gateway);
        addTestResult(`Testing gateway: ${gateway}`);
        
        try {
          const response = await fetch(url, { method: 'HEAD' });
          addTestResult(`${gateway}: ${response.ok ? '✅ Working' : '❌ Failed'}`);
        } catch (error) {
          addTestResult(`${gateway}: ❌ Error - ${error}`);
        }
      }
      
    } catch (error: any) {
      addTestResult(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const testHashDisplay = (hash: string) => {
    if (!hash) return;
    
    addTestResult(`🔍 Testing image display for hash: ${hash}`);
    
    const urls = ipfsService.getIPFSUrls(hash);
    urls.forEach((url, index) => {
      addTestResult(`Gateway ${index + 1}: ${url}`);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 border border-gray-600 rounded-lg p-4 z-50 max-h-96 overflow-y-auto">
      <h3 className="text-white font-semibold mb-3">🔧 IPFS Debug Panel</h3>
      
      <div className="space-y-3">
        {/* Config Test */}
        <button
          onClick={testIPFSConfig}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
        >
          Test IPFS Config
        </button>
        
        {/* Image Upload Test */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTestImage(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-600 file:text-white"
          />
          <button
            onClick={testImageUpload}
            disabled={!testImage || isUploading}
            className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white text-sm"
          >
            {isUploading ? 'Uploading...' : 'Test Upload'}
          </button>
        </div>
        
        {/* Hash Test */}
        <div>
          <input
            type="text"
            placeholder="Enter IPFS hash to test"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          />
          <button
            onClick={() => testHashDisplay(ipfsHash)}
            disabled={!ipfsHash}
            className="w-full mt-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded text-white text-sm"
          >
            Test Hash Display
          </button>
        </div>
        
        {/* Image Preview */}
        {ipfsHash && (
          <div className="space-y-2">
            <div className="text-white text-sm font-medium">Image Preview:</div>
            <img
              src={ipfsService.getIPFSUrl(ipfsHash)}
              alt="IPFS Test"
              className="w-full rounded border border-gray-600"
              style={{ maxHeight: '150px', objectFit: 'contain' }}
              onLoad={() => addTestResult('✅ Image loaded successfully')}
              onError={(e) => {
                addTestResult('❌ Image failed to load, trying fallback...');
                const img = e.target as HTMLImageElement;
                const urls = ipfsService.getIPFSUrls(ipfsHash);
                const currentIndex = urls.findIndex(url => img.src === url);
                if (currentIndex < urls.length - 1) {
                  img.src = urls[currentIndex + 1];
                  addTestResult(`🔄 Trying gateway: ${urls[currentIndex + 1]}`);
                }
              }}
            />
          </div>
        )}
        
        {/* Results */}
        <div className="border-t border-gray-600 pt-3">
          <div className="text-white text-sm font-medium mb-2">Test Results:</div>
          <div className="max-h-32 overflow-y-auto text-xs text-gray-300 space-y-1 bg-black/30 p-2 rounded">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No tests run yet</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="font-mono">{result}</div>
              ))
            )}
          </div>
          <button
            onClick={() => setTestResults([])}
            className="mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
          >
            Clear Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default IPFSDebugPanel;
