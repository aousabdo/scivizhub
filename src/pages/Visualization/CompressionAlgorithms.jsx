import React from 'react';
import CompressionAlgorithmVisualizer from '../../components/Visualizations/CompressionAlgorithms/CompressionAlgorithmVisualizer';

const CompressionAlgorithmsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Data Compression Algorithms</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Data compression algorithms reduce the size of files and data by encoding information more efficiently.
          This visualization demonstrates how different compression techniques work, from simple Run-Length Encoding
          to more complex algorithms like Huffman Coding and LZW compression.
        </p>
        <p>
          Experiment with different input data and observe how each algorithm compresses the information,
          visualizing the process step-by-step and comparing compression ratios across different methods.
        </p>
      </div>
      
      <CompressionAlgorithmVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Data Compression</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Lossless vs. Lossy Compression</h3>
            <p>
              There are two fundamental approaches to data compression:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Lossless Compression:</strong> Preserves all original data exactly. When decompressed, 
                the result is identical to the original. Ideal for text, executable programs, and any data 
                where accuracy is critical.
              </li>
              <li>
                <strong>Lossy Compression:</strong> Discards some information to achieve higher compression ratios. 
                The decompressed result is an approximation of the original. Commonly used for images, audio, and 
                video where small quality reductions are acceptable.
              </li>
            </ul>
            <p className="mt-3">
              The visualizations here focus on lossless compression techniques, which are foundational 
              to understanding how data compression works.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Compression Principles</h3>
            <p>
              All compression algorithms use these key principles to reduce data size:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Redundancy Reduction:</strong> Replacing repetitive data with more compact representations</li>
              <li><strong>Statistical Coding:</strong> Using fewer bits for common symbols and more bits for rare symbols</li>
              <li><strong>Pattern Recognition:</strong> Identifying and efficiently encoding recurring patterns</li>
              <li><strong>Dictionary Building:</strong> Creating a reference of common sequences for more efficient encoding</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Real-World Applications</h3>
            <p>
              Compression algorithms are foundational to modern computing:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>File Formats:</strong> ZIP, PNG, JPEG, MP3, MP4 all rely on compression</li>
              <li><strong>Web Browsing:</strong> HTTP compression reduces page load times</li>
              <li><strong>Streaming Media:</strong> Enables efficient delivery of audio and video</li>
              <li><strong>Data Storage:</strong> Maximizes storage capacity of drives and databases</li>
              <li><strong>Network Bandwidth:</strong> Reduces data transmission requirements</li>
              <li><strong>Mobile Applications:</strong> Minimizes data usage and storage needs</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Compression Algorithm Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="p-2 border">Algorithm</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Compression Ratio</th>
                    <th className="p-2 border">Speed</th>
                    <th className="p-2 border">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Run-Length Encoding</td>
                    <td className="p-2 border">Lossless</td>
                    <td className="p-2 border">Low-Medium</td>
                    <td className="p-2 border">Very Fast</td>
                    <td className="p-2 border">Data with long sequences of identical values</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Huffman Coding</td>
                    <td className="p-2 border">Lossless</td>
                    <td className="p-2 border">Medium</td>
                    <td className="p-2 border">Fast</td>
                    <td className="p-2 border">Text with varying character frequencies</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">LZW</td>
                    <td className="p-2 border">Lossless</td>
                    <td className="p-2 border">Medium-High</td>
                    <td className="p-2 border">Medium</td>
                    <td className="p-2 border">Text and graphics with repeating patterns</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Deflate (ZIP)</td>
                    <td className="p-2 border">Lossless</td>
                    <td className="p-2 border">High</td>
                    <td className="p-2 border">Medium</td>
                    <td className="p-2 border">General-purpose, combines LZ77 and Huffman</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">The Information Theory Connection</h2>
          <p>
            Data compression is deeply linked to Claude Shannon's Information Theory, which provides the 
            theoretical foundation for how much information can be compressed. The core principle is that 
            the more predictable data is, the more compressible it becomes.
          </p>
          <p className="mt-3">
            Shannon's concept of entropy measures the unpredictability or "information content" of data. 
            Lower entropy means higher redundancy and greater potential for compression. The theoretical 
            limit for lossless compression is the entropy of the source data.
          </p>
          <p className="mt-3">
            This explains why random data compresses poorly: it has maximum entropy and minimal redundancy.
          </p>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The essence of compression is finding the shortest way to say the same thing. 
            It's about recognizing patterns and encoding them with elegant efficiency."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompressionAlgorithmsPage;