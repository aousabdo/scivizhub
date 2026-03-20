import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort } from './sortingAlgorithms';

const MIN_VALUE = 5;
const MAX_VALUE = 100;
const DEFAULT_ANIMATION_SPEED = 50; // milliseconds

const SortingAlgorithmVisualizer = () => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [isSorting, setIsSorting] = useState(false);
  const [sortingAlgorithm, setSortingAlgorithm] = useState('bubble');
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_ANIMATION_SPEED);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const animationTimeoutsRef = useRef([]);

  // Generate a new random array
  const generateRandomArray = (size = arraySize) => {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE);
    }
    setArray(newArray);
    setComparisons(0);
    setSwaps(0);
    setHighlightedIndices([]);
    setSortedIndices([]);
  };

  // Initialize array on component mount
  useEffect(() => {
    generateRandomArray();
    return () => {
      // Clear all timeouts when component unmounts
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Cancel ongoing sorting animation
  const cancelSorting = () => {
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationTimeoutsRef.current = [];
    setIsSorting(false);
    setHighlightedIndices([]);
  };

  // Start sorting
  const startSorting = async () => {
    if (isSorting) {
      cancelSorting();
      return;
    }

    // Clear previous timeouts
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationTimeoutsRef.current = [];

    setIsSorting(true);
    setComparisons(0);
    setSwaps(0);

    // Get the appropriate sorting algorithm
    let sortFunction;
    switch (sortingAlgorithm) {
      case 'bubble':
        sortFunction = bubbleSort;
        break;
      case 'selection':
        sortFunction = selectionSort;
        break;
      case 'insertion':
        sortFunction = insertionSort;
        break;
      case 'merge':
        sortFunction = mergeSort;
        break;
      case 'quick':
        sortFunction = quickSort;
        break;
      default:
        sortFunction = bubbleSort;
        break;
    }

    // Run the sorting algorithm to get animations
    const animations = [];
    const arrayCopy = [...array];
    await sortFunction(arrayCopy, animations);

    // Play the animations
    animateSort(animations);
  };

  // Animate the sorting process
  const animateSort = (animations) => {
    animations.forEach((animation, index) => {
      const timeout = setTimeout(() => {
        const { type, indices, values, stats } = animation;

        // Update stats if provided
        if (stats) {
          if (stats.comparisons !== undefined) setComparisons(stats.comparisons);
          if (stats.swaps !== undefined) setSwaps(stats.swaps);
        }

        if (type === 'comparison') {
          // Highlight compared indices via React state
          setHighlightedIndices(indices);
        } else if (type === 'swap' || type === 'replace') {
          // Update the array for swap or replacements
          setHighlightedIndices(indices);
          setArray(prevArray => {
            const newArray = [...prevArray];
            indices.forEach((idx, i) => {
              if (idx !== undefined && values[i] !== undefined) {
                newArray[idx] = values[i];
              }
            });
            return newArray;
          });
        }

        // If this is the last animation, mark all as sorted
        if (index === animations.length - 1) {
          setIsSorting(false);
          setHighlightedIndices([]);
          setSortedIndices(Array.from({ length: array.length }, (_, i) => i));
        }
      }, index * animationSpeed);

      animationTimeoutsRef.current.push(timeout);
    });
  };

  // Handle algorithm change
  const handleAlgorithmChange = (e) => {
    if (!isSorting) {
      setSortingAlgorithm(e.target.value);
    }
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    setAnimationSpeed(parseInt(e.target.value));
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (sortingAlgorithm) {
      case 'bubble':
        return {
          name: 'Bubble Sort',
          description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
          timeComplexity: <InlineMath>{"\\mathcal{O}(n^2)"}</InlineMath>,
          spaceComplexity: <InlineMath>{"\\mathcal{O}(1)"}</InlineMath>
        };
      case 'selection':
        return {
          name: 'Selection Sort',
          description: 'Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.',
          timeComplexity: <InlineMath>{"\\mathcal{O}(n^2)"}</InlineMath>,
          spaceComplexity: <InlineMath>{"\\mathcal{O}(1)"}</InlineMath>
        };
      case 'insertion':
        return {
          name: 'Insertion Sort',
          description: 'Builds the sorted array one item at a time by shifting elements as necessary.',
          timeComplexity: <InlineMath>{"\\mathcal{O}(n^2)"}</InlineMath>,
          spaceComplexity: <InlineMath>{"\\mathcal{O}(1)"}</InlineMath>
        };
      case 'merge':
        return {
          name: 'Merge Sort',
          description: 'Divides the array into halves, sorts them, and then merges them back together.',
          timeComplexity: <InlineMath>{"\\mathcal{O}(n \\log n)"}</InlineMath>,
          spaceComplexity: <InlineMath>{"\\mathcal{O}(n)"}</InlineMath>
        };
      case 'quick':
        return {
          name: 'Quick Sort',
          description: 'Picks a pivot element and partitions the array around it, recursively sorting the sub-arrays.',
          timeComplexity: <span><InlineMath>{"\\mathcal{O}(n \\log n)"}</InlineMath> average, <InlineMath>{"\\mathcal{O}(n^2)"}</InlineMath> worst case</span>,
          spaceComplexity: <InlineMath>{"\\mathcal{O}(\\log n)"}</InlineMath>
        };
      default:
        return {
          name: 'Unknown Algorithm',
          description: 'No description available.',
          timeComplexity: 'Unknown',
          spaceComplexity: 'Unknown'
        };
    }
  };

  const algorithmInfo = getAlgorithmDescription();

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
              onClick={generateRandomArray}
              disabled={isSorting}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isSorting ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              New Array
            </button>
            
            <button
              onClick={startSorting}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isSorting
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isSorting ? 'Stop' : 'Sort!'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Algorithm:
            </label>
            <select
              value={sortingAlgorithm}
              onChange={handleAlgorithmChange}
              disabled={isSorting}
              className={`block w-full p-2 border border-gray-300 rounded-md ${
                isSorting ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Array Size: {arraySize}
            </label>
            <input
              type="range"
              min="10"
              max="150"
              value={arraySize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setArraySize(newSize);
                if (!isSorting) generateRandomArray(newSize);
              }}
              disabled={isSorting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Animation Speed: {animationSpeed}ms
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={animationSpeed}
              onChange={handleSpeedChange}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-semibold">Time Complexity:</span> {algorithmInfo.timeComplexity}
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-semibold">Space Complexity:</span> {algorithmInfo.spaceComplexity}
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-semibold">Comparisons:</span> {comparisons}
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-semibold">Swaps/Writes:</span> {swaps}
          </div>
        </div>
      </div>
      
      <div className="visualization-container bg-white p-4 rounded-lg shadow-md">
        <div className="array-container flex items-end justify-center h-64 border-b border-gray-300">
          {array.map((value, idx) => {
            const isHighlighted = highlightedIndices.includes(idx);
            const isSorted = sortedIndices.includes(idx);
            const bgColor = isHighlighted
              ? '#EF4444'
              : isSorted
                ? '#10B981'
                : '#40E0D0';
            return (
              <div
                key={idx}
                className="mx-px"
                style={{
                  height: `${value * 2.5}px`,
                  width: `${100 / arraySize}%`,
                  backgroundColor: bgColor,
                  transition: 'height 0.1s ease, background-color 0.15s ease'
                }}
              />
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">How This Visualization Works</h3>
        <p className="text-gray-700 mb-4">
          Each bar represents a value in an array. The height of the bar corresponds to the value.
          When sorting, bars being compared are highlighted in red, and you can see them swap positions
          when the algorithm determines they need to be reordered.
        </p>
        
        <h3 className="text-lg font-semibold mb-2">Tips</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Click "New Array" to generate a new random set of values</li>
          <li>Select different algorithms from the dropdown to see how they perform</li>
          <li>Adjust the animation speed slider to speed up or slow down the visualization</li>
          <li>Watch the comparison and swap counts to understand algorithm efficiency</li>
          <li>Click "Stop" at any time to cancel the current sorting operation</li>
        </ul>
      </div>
    </div>
  );
};

export default SortingAlgorithmVisualizer;