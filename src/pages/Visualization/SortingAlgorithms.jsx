import React from 'react';
import SortingAlgorithmVisualizer from '../../components/Visualizations/SortingAlgorithms/SortingAlgorithmVisualizer';

const SortingAlgorithmsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Sorting Algorithms Visualizer</h1>
      
      <div className="prose max-w-6xl mx-auto mb-8">
        <p>
          Sorting algorithms are fundamental to computer science and are used to arrange elements in a specific order. 
          This interactive visualization demonstrates how different sorting algorithms work, helping you understand their 
          mechanisms and efficiency characteristics.
        </p>
        <p>
          Watch as the algorithms rearrange the bars in real-time, and observe how the number of comparisons and swaps 
          differs between algorithms. This provides an intuitive understanding of algorithm complexity beyond just 
          theoretical notation like O(n²) or O(n log n).
        </p>
      </div>
      
      <SortingAlgorithmVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Sorting Algorithms</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Algorithm Complexity</h3>
            <p>
              When discussing sorting algorithms, we often refer to their time and space complexity:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Time Complexity:</strong> How the runtime grows as the input size increases</li>
              <li><strong>Space Complexity:</strong> How much additional memory is needed beyond the input array</li>
              <li><strong>Best, Average, and Worst Case:</strong> Different scenarios that affect performance</li>
            </ul>
            <p className="mt-4">
              The most efficient general-purpose comparison-based sorting algorithms have a time complexity of 
              O(n log n), which is proven to be the theoretical lower bound for comparison-based sorting.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Why Different Algorithms?</h3>
            <p>
              If some algorithms are clearly more efficient than others, why do we need so many different sorting algorithms?
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Small Data Sets:</strong> For small arrays, simpler algorithms like Insertion Sort can be faster due to less overhead</li>
              <li><strong>Partially Sorted Data:</strong> Some algorithms perform better when data is already partially sorted</li>
              <li><strong>Memory Constraints:</strong> When memory is limited, in-place algorithms like Quick Sort may be preferred</li>
              <li><strong>Stability:</strong> Some applications require that equal elements maintain their original order</li>
              <li><strong>Parallel Processing:</strong> Some algorithms can be parallelized more effectively than others</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Real-World Applications</h3>
            <p>
              Sorting algorithms are used in countless real-world scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Databases:</strong> Sorting records for efficient searching and indexing</li>
              <li><strong>File Systems:</strong> Organizing files by various attributes</li>
              <li><strong>Search Engines:</strong> Ranking and presenting results</li>
              <li><strong>Graphics:</strong> Rendering objects in the correct depth order</li>
              <li><strong>Compression:</strong> Some compression algorithms sort data as a preprocessing step</li>
              <li><strong>AI and Machine Learning:</strong> Efficient data organization for training and inference</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 italic">
            "Sorting is a fundamental operation in computer science and forms the backbone of many complex algorithms and systems."
          </p>
        </div>
      </div>
    </div>
  );
};

export default SortingAlgorithmsPage;