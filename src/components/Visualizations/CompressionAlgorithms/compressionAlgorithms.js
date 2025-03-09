/**
 * Compression Algorithms Implementation
 * 
 * This file contains various data compression algorithm implementations
 * for the Compression Algorithms Visualizer
 */

// Run-Length Encoding (RLE)
export function runLengthEncode(input, addStep) {
    const steps = [];
    let result = '';
    let currentChar = '';
    let count = 0;
    let compressionRatio = 0;
    
    // Helper function to add steps to the visualization
    const recordStep = (message, intermediate, highlight) => {
      if (addStep) {
        addStep({
          message,
          original: input,
          intermediate,
          highlight,
          compressionRatio
        });
      }
      steps.push({
        message,
        intermediate,
        highlight,
        compressionRatio
      });
    };
    
    // Return early if input is empty
    if (!input || input.length === 0) {
      return { 
        encoded: '',
        steps,
        compressionRatio: 0
      };
    }
    
    recordStep('Starting Run-Length Encoding process', '', null);
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      // Starting a new run
      if (char !== currentChar) {
        // Record the previous run (if any)
        if (count > 0) {
          const encodePart = count > 1 ? count + currentChar : currentChar;
          result += encodePart;
          
          // Calculate ongoing compression ratio
          compressionRatio = (1 - result.length / input.length) * 100;
          
          recordStep(
            `Encoding ${count} occurrence${count > 1 ? 's' : ''} of '${currentChar}'`,
            result,
            { start: i - count, end: i - 1 }
          );
        }
        
        // Start a new run
        currentChar = char;
        count = 1;
      } else {
        // Continue the current run
        count++;
      }
      
      // If at the end of input, record the last run
      if (i === input.length - 1) {
        const encodePart = count > 1 ? count + currentChar : currentChar;
        result += encodePart;
        
        // Calculate final compression ratio
        compressionRatio = (1 - result.length / input.length) * 100;
        
        recordStep(
          `Encoding ${count} occurrence${count > 1 ? 's' : ''} of '${currentChar}'`,
          result,
          { start: i - count + 1, end: i }
        );
      }
    }
    
    // Final step showing the result
    recordStep(
      `Run-Length Encoding complete. Compression ratio: ${compressionRatio.toFixed(2)}%`,
      result,
      null
    );
    
    return {
      encoded: result,
      steps,
      compressionRatio
    };
  }
  
  // Run-Length Decoding
  export function runLengthDecode(input) {
    let result = '';
    let i = 0;
    
    while (i < input.length) {
      // Check if the current character is a digit
      let count = '';
      while (i < input.length && !isNaN(parseInt(input[i]))) {
        count += input[i];
        i++;
      }
      
      // Get the character to repeat
      const char = input[i];
      i++;
      
      // Repeat the character
      if (count === '') {
        result += char;
      } else {
        result += char.repeat(parseInt(count));
      }
    }
    
    return result;
  }
  
  // Huffman Coding
  export function huffmanEncode(input, addStep) {
    const steps = [];
    let compressionRatio = 0;
    
    // Helper function to add steps to the visualization
    const recordStep = (message, state, highlight) => {
      if (addStep) {
        addStep({
          message,
          original: input,
          state,
          highlight,
          compressionRatio
        });
      }
      steps.push({
        message,
        state,
        highlight,
        compressionRatio
      });
    };
    
    // Return early if input is empty
    if (!input || input.length === 0) {
      return { 
        encoded: '',
        steps,
        tree: null,
        codeMap: {},
        compressionRatio: 0,
        bitstream: '' 
      };
    }
    
    recordStep('Starting Huffman Coding process', { stage: 'init' }, null);
    
    // Step 1: Calculate character frequencies
    const frequencies = {};
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
      
      recordStep(
        `Counting frequency of character '${char}'`,
        { stage: 'frequency', frequencies: { ...frequencies } },
        { start: i, end: i }
      );
    }
    
    // Step 2: Create leaf nodes for each character
    const nodes = Object.keys(frequencies).map(char => ({
      char,
      freq: frequencies[char],
      left: null,
      right: null
    }));
    
    recordStep(
      'Created initial leaf nodes based on character frequencies',
      { stage: 'nodes', nodes: [...nodes] },
      null
    );
    
    // Step 3: Build the Huffman tree
    while (nodes.length > 1) {
      // Sort nodes by frequency
      nodes.sort((a, b) => a.freq - b.freq);
      
      // Take the two nodes with lowest frequencies
      const left = nodes.shift();
      const right = nodes.shift();
      
      // Create a new internal node with these two nodes as children
      const parent = {
        char: left.char + right.char,
        freq: left.freq + right.freq,
        left,
        right
      };
      
      // Add the new node back to the list
      nodes.push(parent);
      
      recordStep(
        `Combined nodes (${left.char}: ${left.freq}) and (${right.char}: ${right.freq}) to create internal node`,
        { stage: 'tree', nodes: [...nodes] },
        null
      );
    }
    
    // The remaining node is the root of the Huffman tree
    const tree = nodes[0];
    
    // Step 4: Generate the code map by traversing the tree
    const codeMap = {};
    
    function traverseTree(node, code = '') {
      if (!node) return;
      
      // If it's a leaf node (single character)
      if (!node.left && !node.right && node.char.length === 1) {
        codeMap[node.char] = code;
        
        recordStep(
          `Assigned code '${code}' to character '${node.char}'`,
          { stage: 'codeMap', codeMap: { ...codeMap }, tree },
          null
        );
        return;
      }
      
      // Traverse left (add 0)
      traverseTree(node.left, code + '0');
      
      // Traverse right (add 1)
      traverseTree(node.right, code + '1');
    }
    
    traverseTree(tree);
    
    // Step 5: Encode the input string
    let encoded = '';
    let bitstream = '';
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const code = codeMap[char];
      bitstream += code;
      
      recordStep(
        `Encoding character '${char}' as '${code}'`,
        { 
          stage: 'encoding', 
          codeMap, 
          tree, 
          bitstream: bitstream 
        },
        { start: i, end: i }
      );
    }
    
    // Calculate the compression ratio
    // In a real implementation, we'd count bits, but for visualization purposes, 
    // we'll use the bit representation as a string
    const originalBits = input.length * 8; // Assuming 8 bits per character
    const compressedBits = bitstream.length;
    compressionRatio = (1 - compressedBits / originalBits) * 100;
    
    recordStep(
      `Huffman Coding complete. Compression ratio: ${compressionRatio.toFixed(2)}%`,
      { 
        stage: 'complete', 
        codeMap, 
        tree, 
        bitstream 
      },
      null
    );
    
    return {
      encoded: bitstream,
      steps,
      tree,
      codeMap,
      compressionRatio,
      bitstream
    };
  }
  
  // Huffman Decoding
  export function huffmanDecode(bitstream, tree) {
    if (!bitstream || !tree) return '';
    
    let result = '';
    let currentNode = tree;
    
    for (let i = 0; i < bitstream.length; i++) {
      // Navigate left or right based on bit
      if (bitstream[i] === '0') {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }
      
      // If we've reached a leaf node, add the character to the result
      if (!currentNode.left && !currentNode.right) {
        result += currentNode.char;
        currentNode = tree; // Reset to the root for the next character
      }
    }
    
    return result;
  }
  
  // Lempel-Ziv-Welch (LZW) Compression
  export function lzwEncode(input, addStep) {
    const steps = [];
    let compressionRatio = 0;
    
    // Helper function to add steps to the visualization
    const recordStep = (message, data, highlight) => {
      if (addStep) {
        addStep({
          message,
          original: input,
          ...data,
          highlight,
          compressionRatio
        });
      }
      steps.push({
        message,
        ...data,
        highlight,
        compressionRatio
      });
    };
    
    // Return early if input is empty
    if (!input || input.length === 0) {
      return { 
        encoded: [],
        steps,
        dictionary: {},
        compressionRatio: 0
      };
    }
    
    recordStep('Starting LZW Compression process', { dictionary: {}, encoded: [] }, null);
    
    // Initialize dictionary with single characters
    let dictionary = {};
    let dictionarySize = 256; // Start after the basic ASCII characters
    
    for (let i = 0; i < 256; i++) {
      dictionary[String.fromCharCode(i)] = i;
    }
    
    recordStep('Initialized dictionary with ASCII characters', 
      { dictionary: { ...dictionary }, encoded: [] }, null);
    
    let phrase = input[0];
    const result = [];
    
    for (let i = 1; i < input.length; i++) {
      const char = input[i];
      const combined = phrase + char;
      
      // If the combined string exists in the dictionary
      if (dictionary[combined] !== undefined) {
        phrase = combined;
        
        recordStep(`Found "${combined}" in dictionary, continuing to next character`,
          { dictionary: { ...dictionary }, encoded: [...result] },
          { start: i - phrase.length + 1, end: i });
      } else {
        // Output the code for the current phrase
        result.push(dictionary[phrase]);
        
        recordStep(`"${phrase}" not found with next char, outputting code ${dictionary[phrase]}`,
          { dictionary: { ...dictionary }, encoded: [...result] },
          { start: i - phrase.length, end: i - 1 });
        
        // Add the new phrase to the dictionary
        dictionary[combined] = dictionarySize++;
        
        recordStep(`Adding "${combined}" to dictionary with code ${dictionarySize - 1}`,
          { dictionary: { ...dictionary }, encoded: [...result] },
          { start: i - phrase.length, end: i });
        
        // Start a new phrase
        phrase = char;
      }
    }
    
    // Output the code for the last phrase
    if (phrase) {
      result.push(dictionary[phrase]);
      
      recordStep(`Outputting final phrase "${phrase}" as code ${dictionary[phrase]}`,
        { dictionary: { ...dictionary }, encoded: [...result] },
        { start: input.length - phrase.length, end: input.length - 1 });
    }
    
    // Calculate compression ratio
    const originalBits = input.length * 8; // Assuming 8 bits per character
    // For LZW, each code could require varying bits, but for visualization we'll use a simplified approach
    // Assuming each code requires log2(dictionarySize) bits
    const bitsPerCode = Math.ceil(Math.log2(dictionarySize));
    const compressedBits = result.length * bitsPerCode;
    compressionRatio = (1 - compressedBits / originalBits) * 100;
    
    recordStep(`LZW Compression complete. Compression ratio: ${compressionRatio.toFixed(2)}%`,
      { dictionary: { ...dictionary }, encoded: result },
      null);
    
    return {
      encoded: result,
      steps,
      dictionary,
      compressionRatio
    };
  }
  
  // LZW Decompression
  export function lzwDecode(encoded) {
    if (!encoded || encoded.length === 0) return '';
    
    // Initialize dictionary with single characters
    let dictionary = {};
    let dictionarySize = 256;
    
    for (let i = 0; i < 256; i++) {
      dictionary[i] = String.fromCharCode(i);
    }
    
    let result = '';
    let word = dictionary[encoded[0]];
    result += word;
    
    for (let i = 1; i < encoded.length; i++) {
      const code = encoded[i];
      let entry;
      
      // If the code exists in the dictionary
      if (dictionary[code] !== undefined) {
        entry = dictionary[code];
      } else {
        // Special case for when the code doesn't exist yet
        entry = word + word[0];
      }
      
      // Add the entry to the result
      result += entry;
      
      // Add a new dictionary entry (previous word + first char of current entry)
      dictionary[dictionarySize++] = word + entry[0];
      
      // Update the current word
      word = entry;
    }
    
    return result;
  }