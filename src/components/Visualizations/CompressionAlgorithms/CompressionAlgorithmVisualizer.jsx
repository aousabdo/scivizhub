import React, { useState, useEffect, useRef } from 'react';
import { runLengthEncode, runLengthDecode, huffmanEncode, huffmanDecode, lzwEncode, lzwDecode } from './compressionAlgorithms';

const CompressionAlgorithmVisualizer = () => {
  const [inputText, setInputText] = useState('AAAABBBCCDAABBB');
  const [compressionAlgorithm, setCompressionAlgorithm] = useState('runlength');
  const [compressedOutput, setCompressedOutput] = useState('');
  const [decompressedOutput, setDecompressedOutput] = useState('');
  const [compressionRatio, setCompressionRatio] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [showExplanation, setShowExplanation] = useState(true);
  const [huffmanTree, setHuffmanTree] = useState(null);
  const [huffmanCodeMap, setHuffmanCodeMap] = useState({});
  const [bitstream, setBitstream] = useState('');
  const [lzwDictionary, setLzwDictionary] = useState({});
  const [showBinary, setShowBinary] = useState(false);
  
  const animationRef = useRef(null);
  
  // Example texts for quick selection
  const exampleTexts = {
    repetitive: 'AAAABBBCCDAABBB',
    text: 'the quick brown fox jumps over the lazy dog',
    structured: 'name: John Doe, age: 30, city: New York, name: Jane Smith, age: 25, city: New York',
    binary: '101010101010101010101010',
    mixedContent: 'Compression is useful! Compression, compression, compression works well for repetitive data.'
  };
  
  // Stop animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  
  // Reset animation when input or algorithm changes
  useEffect(() => {
    stopAnimation();
    setSteps([]);
    setCurrentStep(0);
    setCompressedOutput('');
    setDecompressedOutput('');
    setCompressionRatio(0);
    setBitstream('');
    setHuffmanTree(null);
    setHuffmanCodeMap({});
    setLzwDictionary({});
  }, [inputText, compressionAlgorithm]);
  
  // Calculate original size in bytes
  useEffect(() => {
    setOriginalSize(inputText.length);
    // In a real system, we'd calculate byte size more accurately
  }, [inputText]);
  
  // Add a step to the visualization
  const addStep = (step) => {
    setSteps(prevSteps => [...prevSteps, step]);
  };
  
  // Run the selected compression algorithm
  const runCompression = () => {
    setSteps([]);
    setCurrentStep(0);
    
    let result;
    
    switch (compressionAlgorithm) {
      case 'runlength':
        result = runLengthEncode(inputText, addStep);
        setCompressedOutput(result.encoded);
        setCompressionRatio(result.compressionRatio);
        setCompressedSize(result.encoded.length);
        break;
        
      case 'huffman':
        result = huffmanEncode(inputText, addStep);
        setCompressedOutput(result.encoded);
        setHuffmanTree(result.tree);
        setHuffmanCodeMap(result.codeMap);
        setBitstream(result.bitstream);
        setCompressionRatio(result.compressionRatio);
        // Calculate compressed size in bits
        setCompressedSize(Math.ceil(result.bitstream.length / 8));
        break;
        
      case 'lzw':
        result = lzwEncode(inputText, addStep);
        setCompressedOutput(JSON.stringify(result.encoded));
        setLzwDictionary(result.dictionary);
        setCompressionRatio(result.compressionRatio);
        // For LZW, we need to calculate the bit size more carefully
        const dictionarySize = Object.keys(result.dictionary).length;
        const bitsPerCode = Math.ceil(Math.log2(dictionarySize));
        setCompressedSize(Math.ceil((result.encoded.length * bitsPerCode) / 8));
        break;
        
      default:
        break;
    }
  };
  
  // Decompress the compressed output
  const runDecompression = () => {
    let result = '';
    
    switch (compressionAlgorithm) {
      case 'runlength':
        result = runLengthDecode(compressedOutput);
        break;
        
      case 'huffman':
        if (huffmanTree) {
          result = huffmanDecode(bitstream, huffmanTree);
        }
        break;
        
      case 'lzw':
        try {
          const encoded = JSON.parse(compressedOutput);
          result = lzwDecode(encoded);
        } catch (e) {
          result = 'Error parsing LZW encoded data';
        }
        break;
        
      default:
        break;
    }
    
    setDecompressedOutput(result);
  };
  
  // Start animation of the compression process
  const startAnimation = () => {
    if (steps.length === 0) {
      runCompression();
      return;
    }
    
    setIsAnimating(true);
    setCurrentStep(0);
    
    const animateSteps = (stepIndex) => {
      if (stepIndex >= steps.length) {
        setIsAnimating(false);
        return;
      }
      
      setCurrentStep(stepIndex);
      
      animationRef.current = setTimeout(() => {
        animateSteps(stepIndex + 1);
      }, animationSpeed);
    };
    
    animateSteps(0);
  };
  
  // Stop the animation
  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  };
  
  // Handle algorithm change
  const handleAlgorithmChange = (e) => {
    setCompressionAlgorithm(e.target.value);
  };
  
  // Get the current visualization step
  const currentVisualizationStep = steps[currentStep] || null;
  
  // Render character with highlighting
  const renderHighlightedText = (text, highlight) => {
    if (!highlight || highlight.start === undefined || highlight.end === undefined) {
      return text;
    }
    
    return (
      <>
        {text.substring(0, highlight.start)}
        <span className="bg-yellow-300 font-bold">
          {text.substring(highlight.start, highlight.end + 1)}
        </span>
        {text.substring(highlight.end + 1)}
      </>
    );
  };
  
  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (compressionAlgorithm) {
      case 'runlength':
        return {
          name: 'Run-Length Encoding (RLE)',
          description: 'Replaces sequences of the same character with a count followed by the character.',
          howItWorks: 'RLE works by counting consecutive repeated characters and replacing them with a count followed by the character. For example, "AAABBC" becomes "3A2B1C" or simply "3A2BC".',
          bestFor: 'Data with long sequences of identical values (like simple images, certain types of sensor data).',
          limitations: 'Can actually increase the size of data without many repeated sequences.'
        };
      case 'huffman':
        return {
          name: 'Huffman Coding',
          description: 'Creates variable-length codes for each character, with shorter codes for more frequent characters.',
          howItWorks: 'Huffman coding builds a binary tree based on character frequencies, then assigns shorter bit codes to more frequent characters and longer codes to less frequent ones.',
          bestFor: 'Text with varying character frequencies, like natural language.',
          limitations: 'Requires transmitting the encoding table (tree) along with the compressed data.'
        };
      case 'lzw':
        return {
          name: 'Lempel-Ziv-Welch (LZW)',
          description: 'Builds a dictionary of sequences found in the data and replaces them with codes.',
          howItWorks: 'LZW dynamically builds a dictionary of subsequences as it processes the input, replacing longer and longer patterns with single codes.',
          bestFor: 'Text and data with recurring patterns and phrases.',
          limitations: 'Less effective on random or already compressed data.'
        };
      default:
        return {
          name: 'Unknown Algorithm',
          description: 'No description available.',
          howItWorks: '',
          bestFor: '',
          limitations: ''
        };
    }
  };
  
  const algorithmInfo = getAlgorithmDescription();
  
  // Render Huffman Tree visualization
  const renderHuffmanTree = (node, prefix = '', isLeft = true) => {
    if (!node) return null;
    
    // Render leaf node
    if (!node.left && !node.right) {
      return (
        <div className="huffman-node leaf-node">
          <div className="p-2 rounded-lg bg-green-100 border border-green-300 inline-block">
            <span className="font-mono">{node.char === ' ' ? '␣' : node.char}</span>
            <span className="text-xs ml-2">({node.freq})</span>
            <div className="text-xs mt-1">Code: {prefix}</div>
          </div>
        </div>
      );
    }
    
    // Render internal node
    return (
      <div className="huffman-node">
        <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 inline-block">
          <span className="text-xs">Freq: {node.freq}</span>
        </div>
        <div className="flex mt-4 space-x-4">
          <div className="flex flex-col items-center">
            <div className="text-xs mb-1">0</div>
            {renderHuffmanTree(node.left, prefix + '0', true)}
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs mb-1">1</div>
            {renderHuffmanTree(node.right, prefix + '1', false)}
          </div>
        </div>
      </div>
    );
  };
  
  // Render code table for Huffman coding
  const renderHuffmanCodeTable = () => {
    if (!huffmanCodeMap || Object.keys(huffmanCodeMap).length === 0) {
      return null;
    }
    
    return (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Character</th>
              <th className="p-2 border">Frequency</th>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Bits</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(huffmanCodeMap).map(([char, code]) => (
              <tr key={char}>
                <td className="p-2 border font-mono text-center">
                  {char === ' ' ? '␣' : char}
                </td>
                <td className="p-2 border text-center">
                  {huffmanTree ? countCharFrequency(inputText, char) : '—'}
                </td>
                <td className="p-2 border font-mono text-center">{code}</td>
                <td className="p-2 border text-center">{code.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper to count character frequency
  const countCharFrequency = (text, char) => {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === char) count++;
    }
    return count;
  };
  
  // Render LZW Dictionary visualization
  const renderLzwDictionary = () => {
    if (!lzwDictionary || Object.keys(lzwDictionary).length === 0) {
      return null;
    }
    
    // Only show a subset of the dictionary to avoid overwhelming the user
    // Show ASCII characters separately from the dynamically added entries
    const asciiEntries = {};
    const dynamicEntries = {};
    
    Object.entries(lzwDictionary).forEach(([key, value]) => {
      if (value < 256) {
        // Only include visible ASCII characters
        if (key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126) {
          asciiEntries[key] = value;
        }
      } else {
        dynamicEntries[key] = value;
      }
    });
    
    return (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Dictionary</h4>
        
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-1">Predefined ASCII Entries (showing visible characters)</h5>
          <div className="flex flex-wrap gap-1">
            {Object.entries(asciiEntries).map(([key, value]) => (
              <div key={key} className="px-2 py-1 bg-gray-100 rounded text-xs">
                '{key}' → {value}
              </div>
            ))}
            <div className="px-2 py-1 bg-gray-100 rounded text-xs">
              ...and other ASCII characters
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium mb-1">Dynamic Entries</h5>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
            {Object.entries(dynamicEntries).slice(0, 50).map(([key, value]) => (
              <div key={value} className="px-2 py-1 bg-blue-100 rounded text-xs">
                '{key}' → {value}
              </div>
            ))}
            {Object.keys(dynamicEntries).length > 50 && (
              <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                ...and {Object.keys(dynamicEntries).length - 50} more entries
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // String to binary representation for visualization
  const stringToBinary = (str) => {
    return str.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };
  
  // Format output for display
  const formatOutput = (output) => {
    if (!output) return '';
    
    // For Huffman, show the bitstream
    if (compressionAlgorithm === 'huffman') {
      return bitstream;
    }
    
    // For LZW, show the codes
    if (compressionAlgorithm === 'lzw') {
      try {
        return JSON.parse(output).join(' ');
      } catch (e) {
        return output;
      }
    }
    
    return output;
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{algorithmInfo.name}</h2>
            <p className="text-gray-600">{algorithmInfo.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
            <button
              onClick={isAnimating ? stopAnimation : startAnimation}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isAnimating
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isAnimating ? 'Stop Animation' : steps.length > 0 ? 'Restart Animation' : 'Visualize Compression'}
            </button>
            
            <button
              onClick={runDecompression}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
              disabled={!compressedOutput}
            >
              Decompress
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                placeholder="Enter text to compress..."
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setInputText(exampleTexts.repetitive)} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Repetitive Example
              </button>
              <button 
                onClick={() => setInputText(exampleTexts.text)} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Text Example
              </button>
              <button 
                onClick={() => setInputText(exampleTexts.structured)} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Structured Example
              </button>
              <button 
                onClick={() => setInputText(exampleTexts.binary)} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Binary Example
              </button>
              <button 
                onClick={() => setInputText(exampleTexts.mixedContent)} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Mixed Content
              </button>
            </div>
            
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showBinary"
                checked={showBinary}
                onChange={() => setShowBinary(!showBinary)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showBinary" className="ml-2 block text-sm text-gray-700">
                Show binary representation
              </label>
            </div>
            
            {showBinary && (
              <div className="p-2 bg-gray-50 rounded border overflow-x-auto">
                <code className="text-xs font-mono break-all">
                  {stringToBinary(inputText)}
                </code>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression Algorithm:
              </label>
              <select
                value={compressionAlgorithm}
                onChange={handleAlgorithmChange}
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="runlength">Run-Length Encoding (RLE)</option>
                <option value="huffman">Huffman Coding</option>
                <option value="lzw">Lempel-Ziv-Welch (LZW)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="100"
                max="3000"
                step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showExplanation"
                checked={showExplanation}
                onChange={() => setShowExplanation(!showExplanation)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showExplanation" className="ml-2 block text-sm text-gray-700">
                Show algorithm explanation
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-2 bg-blue-50 rounded">
                <span className="font-semibold">Original Size:</span> {originalSize} bytes
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <span className="font-semibold">Compressed Size:</span> {compressedSize} {compressionAlgorithm === 'huffman' ? 'bytes (from bits)' : 'bytes'}
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <span className="font-semibold">Compression Ratio:</span> {compressionRatio.toFixed(2)}%
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <span className="font-semibold">Current Step:</span> {currentStep + 1} / {steps.length}
              </div>
            </div>
          </div>
        </div>
        
        {showExplanation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">How {algorithmInfo.name} Works</h3>
            <p className="mb-2">{algorithmInfo.howItWorks}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h4 className="font-medium">Best For:</h4>
                <p className="text-sm">{algorithmInfo.bestFor}</p>
              </div>
              <div>
                <h4 className="font-medium">Limitations:</h4>
                <p className="text-sm">{algorithmInfo.limitations}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualization Area */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Compression Process</h3>
          
          {currentVisualizationStep ? (
            <div>
              <div className="p-3 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium">{currentVisualizationStep.message}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Original Input:</h4>
                <div className="p-2 bg-gray-50 rounded border font-mono break-all">
                  {renderHighlightedText(inputText, currentVisualizationStep.highlight)}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Current Output:</h4>
                <div className="p-2 bg-gray-50 rounded border font-mono break-all">
                  {compressionAlgorithm === 'runlength' && currentVisualizationStep.intermediate}
                  
                  {compressionAlgorithm === 'huffman' && currentVisualizationStep.state && (
                    <>
                      {currentVisualizationStep.state.stage === 'frequency' && (
                        <div>
                          <div className="mb-2">Building frequency table:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(currentVisualizationStep.state.frequencies).map(([char, freq]) => (
                              <div key={char} className="px-2 py-1 bg-blue-100 rounded text-sm">
                                '{char === ' ' ? '␣' : char}': {freq}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {currentVisualizationStep.state.stage === 'encoding' && (
                        <div className="break-all">
                          Bitstream: {currentVisualizationStep.state.bitstream}
                        </div>
                      )}
                      
                      {(currentVisualizationStep.state.stage === 'complete' || 
                       currentVisualizationStep.state.stage === 'encoding') && (
                        <div className="mt-2">
                          <div className="mb-1">Code Mappings:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(currentVisualizationStep.state.codeMap).map(([char, code]) => (
                              <div key={char} className="px-2 py-1 bg-green-100 rounded text-sm">
                                '{char === ' ' ? '␣' : char}': {code}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {compressionAlgorithm === 'lzw' && currentVisualizationStep.encoded && (
                    <div>
                      <div className="mb-1">Current Encoded Output:</div>
                      <div className="font-mono">{currentVisualizationStep.encoded.join(' ')}</div>
                      
                      {currentVisualizationStep.dictionary && Object.keys(currentVisualizationStep.dictionary).length > 256 && (
                        <div className="mt-3">
                          <div className="mb-1">Dictionary Entries (dynamic only):</div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(currentVisualizationStep.dictionary)
                              .filter(([_, value]) => value >= 256)
                              .slice(0, 15)
                              .map(([key, value]) => (
                                <div key={value} className="px-2 py-1 bg-blue-100 rounded text-xs">
                                  '{key}' → {value}
                                </div>
                              ))}
                            {Object.entries(currentVisualizationStep.dictionary).filter(([_, v]) => v >= 256).length > 15 && (
                              <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                                ...and more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {compressionAlgorithm === 'huffman' && currentVisualizationStep.state && currentVisualizationStep.state.tree && (
                <div className="mb-4 overflow-auto" style={{ maxHeight: '300px' }}>
                  <h4 className="text-sm font-medium mb-2">Huffman Tree:</h4>
                  <div className="flex justify-center p-4">
                    {renderHuffmanTree(currentVisualizationStep.state.tree, '')}
                  </div>
                </div>
              )}
              
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(currentStep + 1) / steps.length * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 text-right">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              {steps.length === 0 ? (
                <p>Click "Visualize Compression" to start the animation</p>
              ) : (
                <p>Animation completed</p>
              )}
            </div>
          )}
        </div>
        
        {/* Results Area */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Compression Results</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Original Input */}
            <div>
              <h4 className="text-sm font-medium mb-2">Original Input ({originalSize} bytes):</h4>
              <div className="p-2 h-24 overflow-auto bg-gray-50 rounded border font-mono break-all">
                {inputText}
              </div>
              {showBinary && (
                <div className="mt-1 p-2 h-16 overflow-auto bg-gray-50 rounded border">
                  <code className="text-xs font-mono break-all">
                    {stringToBinary(inputText)}
                  </code>
                </div>
              )}
            </div>
            
            {/* Compressed Output */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Compressed Output ({compressedSize} {compressionAlgorithm === 'huffman' ? 'bytes (from bits)' : 'bytes'}):
              </h4>
              <div className="p-2 h-24 overflow-auto bg-gray-50 rounded border font-mono break-all">
                {formatOutput(compressedOutput)}
              </div>
              {compressionAlgorithm === 'huffman' && (
                <div className="mt-1 text-xs text-gray-600">
                  * For Huffman coding, showing the bitstream for visualization purposes.
                  Actual storage would be more compact using bit packing.
                </div>
              )}
            </div>
            
            {/* Decompressed Output */}
            {decompressedOutput && (
              <div>
                <h4 className="text-sm font-medium mb-2">Decompressed Output:</h4>
                <div className="p-2 h-24 overflow-auto bg-gray-50 rounded border font-mono break-all">
                  {decompressedOutput}
                </div>
                <div className="mt-1">
                  <span className={decompressedOutput === inputText ? 'text-green-600' : 'text-red-600'}>
                    {decompressedOutput === inputText ? '✓ Successfully decompressed' : '× Decompression error'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Algorithm-specific visualizations */}
            {compressionAlgorithm === 'huffman' && Object.keys(huffmanCodeMap).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Huffman Code Table:</h4>
                {renderHuffmanCodeTable()}
              </div>
            )}
            
            {compressionAlgorithm === 'lzw' && Object.keys(lzwDictionary).length > 0 && (
              <div>
                {renderLzwDictionary()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Using This Visualization</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Enter text or use the provided examples to see how different algorithms compress data</li>
          <li>Click "Visualize Compression" to see the step-by-step compression process</li>
          <li>Adjust the animation speed to control how quickly the steps progress</li>
          <li>Try different types of data to see how the compression effectiveness varies</li>
          <li>Compare the compression ratios between different algorithms</li>
          <li>Click "Decompress" to verify that the compression is lossless</li>
        </ul>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-2">Pro Tips:</h4>
          <ul className="list-disc list-inside text-gray-700">
            <li>Run-Length Encoding works best with long sequences of repeated characters</li>
            <li>Huffman Coding is optimal for text with uneven character distributions</li>
            <li>LZW is excellent for text with recurring patterns and phrases</li>
            <li>Try compressing already-compressed data to see diminishing returns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompressionAlgorithmVisualizer;