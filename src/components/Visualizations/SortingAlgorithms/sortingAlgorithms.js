/**
 * Sorting Algorithms for the Visualization
 * Each algorithm returns animations that can be used to visualize the sorting process
 */

let compareCount = 0;
let swapCount = 0;

const resetCounts = () => {
  compareCount = 0;
  swapCount = 0;
};

// Bubble Sort
export const bubbleSort = async (array, animations) => {
  resetCounts();
  const n = array.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Add comparison animation
      animations.push({
        type: 'comparison',
        indices: [j, j + 1],
        stats: { comparisons: ++compareCount, swaps: swapCount }
      });
      
      // If the current element is greater than the next element, swap them
      if (array[j] > array[j + 1]) {
        // Add swap animation
        animations.push({
          type: 'swap',
          indices: [j, j + 1],
          values: [array[j + 1], array[j]],
          stats: { comparisons: compareCount, swaps: ++swapCount }
        });
        
        // Actually swap the elements
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
  
  return array;
};

// Selection Sort
export const selectionSort = async (array, animations) => {
  resetCounts();
  const n = array.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    
    // Find the minimum element in the unsorted part of the array
    for (let j = i + 1; j < n; j++) {
      // Add comparison animation
      animations.push({
        type: 'comparison',
        indices: [minIndex, j],
        stats: { comparisons: ++compareCount, swaps: swapCount }
      });
      
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    
    // If the minimum element is not at the current position, swap
    if (minIndex !== i) {
      // Add swap animation
      animations.push({
        type: 'swap',
        indices: [i, minIndex],
        values: [array[minIndex], array[i]],
        stats: { comparisons: compareCount, swaps: ++swapCount }
      });
      
      // Actually swap the elements
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
  }
  
  return array;
};

// Insertion Sort
export const insertionSort = async (array, animations) => {
  resetCounts();
  const n = array.length;
  
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    
    // Compare key with each element on the left until a smaller element is found
    while (j >= 0) {
      // Add comparison animation
      animations.push({
        type: 'comparison',
        indices: [j, i],
        stats: { comparisons: ++compareCount, swaps: swapCount }
      });
      
      if (array[j] > key) {
        // Move elements that are greater than key to one position ahead
        animations.push({
          type: 'replace',
          indices: [j + 1],
          values: [array[j]],
          stats: { comparisons: compareCount, swaps: ++swapCount }
        });
        
        array[j + 1] = array[j];
        j--;
      } else {
        break;
      }
    }
    
    // Place key at the correct position
    if (j + 1 !== i) {
      animations.push({
        type: 'replace',
        indices: [j + 1],
        values: [key],
        stats: { comparisons: compareCount, swaps: swapCount } // No increment as this is part of the same swap
      });
      
      array[j + 1] = key;
    }
  }
  
  return array;
};

// Merge Sort
export const mergeSort = async (array, animations) => {
  resetCounts();
  const auxiliaryArray = array.slice();
  
  await mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations);
  
  return array;
};

const mergeSortHelper = async (
  mainArray,
  startIdx,
  endIdx,
  auxiliaryArray,
  animations
) => {
  if (startIdx === endIdx) return;
  
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  await mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  await mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  await merge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
};

const merge = async (
  mainArray,
  startIdx,
  middleIdx,
  endIdx,
  auxiliaryArray,
  animations
) => {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  
  while (i <= middleIdx && j <= endIdx) {
    // Compare values at i and j
    animations.push({
      type: 'comparison',
      indices: [i, j],
      stats: { comparisons: ++compareCount, swaps: swapCount }
    });
    
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      // Replace value at position k with value at position i
      animations.push({
        type: 'replace',
        indices: [k],
        values: [auxiliaryArray[i]],
        stats: { comparisons: compareCount, swaps: ++swapCount }
      });
      
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      // Replace value at position k with value at position j
      animations.push({
        type: 'replace',
        indices: [k],
        values: [auxiliaryArray[j]],
        stats: { comparisons: compareCount, swaps: ++swapCount }
      });
      
      mainArray[k++] = auxiliaryArray[j++];
    }
  }
  
  // Copy any remaining elements from the left subarray
  while (i <= middleIdx) {
    animations.push({
      type: 'replace',
      indices: [k],
      values: [auxiliaryArray[i]],
      stats: { comparisons: compareCount, swaps: ++swapCount }
    });
    
    mainArray[k++] = auxiliaryArray[i++];
  }
  
  // Copy any remaining elements from the right subarray
  while (j <= endIdx) {
    animations.push({
      type: 'replace',
      indices: [k],
      values: [auxiliaryArray[j]],
      stats: { comparisons: compareCount, swaps: ++swapCount }
    });
    
    mainArray[k++] = auxiliaryArray[j++];
  }
};

// Quick Sort
export const quickSort = async (array, animations) => {
  resetCounts();
  
  await quickSortHelper(array, 0, array.length - 1, animations);
  
  return array;
};

const quickSortHelper = async (array, low, high, animations) => {
  if (low < high) {
    // Partition the array and get the pivot index
    const pivotIndex = await partition(array, low, high, animations);
    
    // Recursively sort the subarrays
    await quickSortHelper(array, low, pivotIndex - 1, animations);
    await quickSortHelper(array, pivotIndex + 1, high, animations);
  }
};

const partition = async (array, low, high, animations) => {
  // Choose the rightmost element as the pivot
  const pivot = array[high];
  
  // Index of the smaller element
  let i = low - 1;
  
  for (let j = low; j <= high - 1; j++) {
    // Add comparison animation
    animations.push({
      type: 'comparison',
      indices: [j, high], // Compare current element with pivot
      stats: { comparisons: ++compareCount, swaps: swapCount }
    });
    
    // If the current element is smaller than the pivot
    if (array[j] < pivot) {
      i++;
      
      // Add swap animation
      animations.push({
        type: 'swap',
        indices: [i, j],
        values: [array[j], array[i]],
        stats: { comparisons: compareCount, swaps: ++swapCount }
      });
      
      // Swap elements
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Place the pivot element in its correct position
  animations.push({
    type: 'swap',
    indices: [i + 1, high],
    values: [array[high], array[i + 1]],
    stats: { comparisons: compareCount, swaps: ++swapCount }
  });
  
  // Swap pivot to its final position
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  
  return i + 1; // Return the pivot index
};