import React, { useState, useEffect, useRef } from 'react';

const MazeGenerationVisualizer = () => {
  // Grid configuration
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 40 });
  const [cellSize, setCellSize] = useState(18);
  
  // Algorithm configuration
  const [algorithm, setAlgorithm] = useState('recursiveBacktracking');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(20); // milliseconds
  const [showExplanation, setShowExplanation] = useState(true);
  
  // Maze state
  const [grid, setGrid] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [visitedCells, setVisitedCells] = useState(0);
  const [totalCells, setTotalCells] = useState(0);
  
  // Animation refs
  const animationTimerRef = useRef(null);
  const animationStepsRef = useRef([]);
  const currentStepRef = useRef(0);
  
  // For recursive algorithms
  const stackRef = useRef([]);
  
  // For Kruskal's algorithm
  const setsRef = useRef([]);
  const edgesRef = useRef([]);
  
  // Initialize grid
  useEffect(() => {
    initializeGrid();
    
    return () => {
      // Clean up any running animations
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [gridSize]);
  
  // Cell directions for navigation
  const directions = [
    { name: 'North', dy: -1, dx: 0, opposite: 'South', bit: 1 },
    { name: 'East', dy: 0, dx: 1, opposite: 'West', bit: 2 },
    { name: 'South', dy: 1, dx: 0, opposite: 'North', bit: 4 },
    { name: 'West', dy: 0, dx: -1, opposite: 'East', bit: 8 }
  ];
  
  // Initialize empty grid with cells
  const initializeGrid = () => {
    const newGrid = [];
    const totalRows = gridSize.rows;
    const totalCols = gridSize.cols;
    
    for (let row = 0; row < totalRows; row++) {
      const currentRow = [];
      for (let col = 0; col < totalCols; col++) {
        currentRow.push({
          row,
          col,
          walls: { North: true, East: true, South: true, West: true },
          visited: false,
          inCurrentPath: false,
          set: row * totalCols + col, // For Kruskal's algorithm
          // Additional properties for visualization
          highlight: false,
          isStart: false,
          isEnd: false
        });
      }
      newGrid.push(currentRow);
    }
    
    setGrid(newGrid);
    setTotalCells(totalRows * totalCols);
    setVisitedCells(0);
    setCurrentCell(null);
    setIsGenerated(false);
    
    // Reset algorithm state
    stackRef.current = [];
    setsRef.current = [];
    edgesRef.current = [];
    animationStepsRef.current = [];
    currentStepRef.current = 0;
  };
  
  // Get valid neighbors that haven't been visited
  const getUnvisitedNeighbors = (row, col, grid) => {
    const neighbors = [];
    
    for (const dir of directions) {
      const newRow = row + dir.dy;
      const newCol = col + dir.dx;
      
      // Check if the new position is within the grid
      if (
        newRow >= 0 && newRow < gridSize.rows &&
        newCol >= 0 && newCol < gridSize.cols &&
        !grid[newRow][newCol].visited
      ) {
        neighbors.push({
          cell: grid[newRow][newCol],
          direction: dir.name,
          opposite: dir.opposite
        });
      }
    }
    
    return neighbors;
  };
  
  // Remove wall between two cells
  const removeWall = (grid, currentCell, nextCell, direction, oppositeDirection) => {
    const newGrid = [...grid];
    newGrid[currentCell.row][currentCell.col].walls[direction] = false;
    newGrid[nextCell.row][nextCell.col].walls[oppositeDirection] = false;
    return newGrid;
  };
  
  // Recursive Backtracking Algorithm
  const generateMazeRecursiveBacktracking = () => {
    setIsGenerating(true);
    setIsGenerated(false);
    
    // Reset animation state
    animationStepsRef.current = [];
    currentStepRef.current = 0;
    
    // Initialize with a random starting point
    const startRow = Math.floor(Math.random() * gridSize.rows);
    const startCol = Math.floor(Math.random() * gridSize.cols);
    
    // Create a deep copy of the grid to avoid modifying state directly
    let newGrid = JSON.parse(JSON.stringify(grid));
    newGrid[startRow][startCol].visited = true;
    newGrid[startRow][startCol].isStart = true;
    
    // Stack for backtracking
    const stack = [{ row: startRow, col: startCol }];
    stackRef.current = stack;
    
    let visitedCount = 1;
    
    // Generate steps for animation
    const steps = [];
    steps.push({
      grid: JSON.parse(JSON.stringify(newGrid)),
      currentCell: { row: startRow, col: startCol },
      visitedCount,
      stack: [...stack]
    });
    
    while (stack.length > 0) {
      // Get the current cell from the stack
      const { row, col } = stack[stack.length - 1];
      
      // Find unvisited neighbors
      const neighbors = getUnvisitedNeighbors(row, col, newGrid);
      
      // If no unvisited neighbors, backtrack
      if (neighbors.length === 0) {
        stack.pop();
        
        // If stack is not empty, mark the new current cell
        if (stack.length > 0) {
          const current = stack[stack.length - 1];
          steps.push({
            grid: JSON.parse(JSON.stringify(newGrid)),
            currentCell: current,
            visitedCount,
            stack: [...stack]
          });
        }
        continue;
      }
      
      // Choose a random unvisited neighbor
      const randomIndex = Math.floor(Math.random() * neighbors.length);
      const { cell: nextCell, direction, opposite } = neighbors[randomIndex];
      
      // Remove the wall between current cell and the chosen neighbor
      newGrid = removeWall(newGrid, { row, col }, nextCell, direction, opposite);
      
      // Mark the neighbor as visited
      newGrid[nextCell.row][nextCell.col].visited = true;
      visitedCount++;
      
      // Push the neighbor to the stack
      stack.push({ row: nextCell.row, col: nextCell.col });
      
      // Record this step for animation
      steps.push({
        grid: JSON.parse(JSON.stringify(newGrid)),
        currentCell: { row: nextCell.row, col: nextCell.col },
        visitedCount,
        stack: [...stack]
      });
    }
    
    // Mark the last cell as the end point
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      const lastGrid = JSON.parse(JSON.stringify(lastStep.grid));
      const endRow = Math.floor(Math.random() * gridSize.rows);
      const endCol = Math.floor(Math.random() * gridSize.cols);
      
      // Ensure it's not the same as the start
      if (endRow !== startRow || endCol !== startCol) {
        lastGrid[endRow][endCol].isEnd = true;
        
        steps.push({
          grid: lastGrid,
          currentCell: null,
          visitedCount,
          stack: []
        });
      }
    }
    
    // Set the animation steps
    animationStepsRef.current = steps;
    
    // Start the animation
    animateMazeGeneration();
  };
  
  // Kruskal's Algorithm for maze generation
  const generateMazeKruskal = () => {
    setIsGenerating(true);
    setIsGenerated(false);
    
    // Reset animation state
    animationStepsRef.current = [];
    currentStepRef.current = 0;
    
    // Create a deep copy of the grid to avoid modifying state directly
    let newGrid = JSON.parse(JSON.stringify(grid));
    
    // Initialize disjoint-set for each cell
    const sets = Array(gridSize.rows * gridSize.cols).fill().map((_, i) => i);
    setsRef.current = sets;
    
    // Create a list of all walls (edges)
    const edges = [];
    
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const cellIndex = row * gridSize.cols + col;
        
        // Add horizontal walls (East)
        if (col < gridSize.cols - 1) {
          edges.push({
            fromRow: row,
            fromCol: col,
            toRow: row,
            toCol: col + 1,
            direction: 'East',
            opposite: 'West'
          });
        }
        
        // Add vertical walls (South)
        if (row < gridSize.rows - 1) {
          edges.push({
            fromRow: row,
            fromCol: col,
            toRow: row + 1,
            toCol: col,
            direction: 'South',
            opposite: 'North'
          });
        }
      }
    }
    
    // Shuffle the edges
    for (let i = edges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [edges[i], edges[j]] = [edges[j], edges[i]];
    }
    
    edgesRef.current = edges;
    
    // Set a random start and end cell
    const startRow = Math.floor(Math.random() * gridSize.rows);
    const startCol = Math.floor(Math.random() * gridSize.cols);
    newGrid[startRow][startCol].isStart = true;
    
    let endRow, endCol;
    do {
      endRow = Math.floor(Math.random() * gridSize.rows);
      endCol = Math.floor(Math.random() * gridSize.cols);
    } while (endRow === startRow && endCol === startCol);
    
    newGrid[endRow][endCol].isEnd = true;
    
    // Generate steps for animation
    const steps = [];
    steps.push({
      grid: JSON.parse(JSON.stringify(newGrid)),
      currentCell: null,
      visitedCount: 0,
      sets: [...sets],
      edges: [...edges]
    });
    
    // Kruskal's algorithm
    let visitedCount = 0;
    
    edges.forEach((edge, index) => {
      const { fromRow, fromCol, toRow, toCol, direction, opposite } = edge;
      
      const fromSet = findSet(sets, fromRow * gridSize.cols + fromCol);
      const toSet = findSet(sets, toRow * gridSize.cols + toCol);
      
      // If the cells are in different sets, union them
      if (fromSet !== toSet) {
        // Union the sets
        unionSets(sets, fromSet, toSet);
        
        // Remove the wall
        newGrid = removeWall(
          newGrid,
          { row: fromRow, col: fromCol },
          { row: toRow, col: toCol },
          direction,
          opposite
        );
        
        // Mark as visited
        if (!newGrid[fromRow][fromCol].visited) {
          newGrid[fromRow][fromCol].visited = true;
          visitedCount++;
        }
        
        if (!newGrid[toRow][toCol].visited) {
          newGrid[toRow][toCol].visited = true;
          visitedCount++;
        }
        
        // Highlight current cells being processed
        const gridCopy = JSON.parse(JSON.stringify(newGrid));
        gridCopy[fromRow][fromCol].highlight = true;
        gridCopy[toRow][toCol].highlight = true;
        
        // Record this step for animation
        steps.push({
          grid: gridCopy,
          currentCell: { row: toRow, col: toCol },
          visitedCount,
          sets: [...sets],
          edges: edges.slice(index + 1)
        });
        
        // Remove highlight for next step
        newGrid[fromRow][fromCol].highlight = false;
        newGrid[toRow][toCol].highlight = false;
      }
    });
    
    // Set the animation steps
    animationStepsRef.current = steps;
    
    // Start the animation
    animateMazeGeneration();
  };
  
  // Prim's Algorithm for maze generation
  const generateMazePrim = () => {
    setIsGenerating(true);
    setIsGenerated(false);
    
    // Reset animation state
    animationStepsRef.current = [];
    currentStepRef.current = 0;
    
    // Create a deep copy of the grid to avoid modifying state directly
    let newGrid = JSON.parse(JSON.stringify(grid));
    
    // Start with a random cell
    const startRow = Math.floor(Math.random() * gridSize.rows);
    const startCol = Math.floor(Math.random() * gridSize.cols);
    
    newGrid[startRow][startCol].visited = true;
    newGrid[startRow][startCol].isStart = true;
    
    // Set a random end cell
    let endRow, endCol;
    do {
      endRow = Math.floor(Math.random() * gridSize.rows);
      endCol = Math.floor(Math.random() * gridSize.cols);
    } while (endRow === startRow && endCol === startCol);
    
    newGrid[endRow][endCol].isEnd = true;
    
    // List of walls to consider
    const walls = [];
    
    // Add walls of the starting cell
    for (const dir of directions) {
      const newRow = startRow + dir.dy;
      const newCol = startCol + dir.dx;
      
      if (
        newRow >= 0 && newRow < gridSize.rows &&
        newCol >= 0 && newCol < gridSize.cols
      ) {
        walls.push({
          fromRow: startRow,
          fromCol: startCol,
          toRow: newRow,
          toCol: newCol,
          direction: dir.name,
          opposite: dir.opposite
        });
      }
    }
    
    // Generate steps for animation
    const steps = [];
    steps.push({
      grid: JSON.parse(JSON.stringify(newGrid)),
      currentCell: { row: startRow, col: startCol },
      visitedCount: 1,
      walls: [...walls]
    });
    
    let visitedCount = 1;
    
    // Prim's algorithm
    while (walls.length > 0) {
      // Choose a random wall
      const randomIndex = Math.floor(Math.random() * walls.length);
      const wall = walls[randomIndex];
      
      // Remove this wall from the list
      walls.splice(randomIndex, 1);
      
      const { fromRow, fromCol, toRow, toCol, direction, opposite } = wall;
      
      // If the cell on the opposite side of the wall has not been visited
      if (!newGrid[toRow][toCol].visited) {
        // Remove the wall
        newGrid = removeWall(
          newGrid,
          { row: fromRow, col: fromCol },
          { row: toRow, col: toCol },
          direction,
          opposite
        );
        
        // Mark the cell as visited
        newGrid[toRow][toCol].visited = true;
        visitedCount++;
        
        // Add the walls of the newly visited cell
        for (const dir of directions) {
          const nextRow = toRow + dir.dy;
          const nextCol = toCol + dir.dx;
          
          if (
            nextRow >= 0 && nextRow < gridSize.rows &&
            nextCol >= 0 && nextCol < gridSize.cols &&
            !newGrid[nextRow][nextCol].visited
          ) {
            walls.push({
              fromRow: toRow,
              fromCol: toCol,
              toRow: nextRow,
              toCol: nextCol,
              direction: dir.name,
              opposite: dir.opposite
            });
          }
        }
        
        // Highlight current cells being processed
        const gridCopy = JSON.parse(JSON.stringify(newGrid));
        gridCopy[fromRow][fromCol].highlight = true;
        gridCopy[toRow][toCol].highlight = true;
        
        // Record this step for animation
        steps.push({
          grid: gridCopy,
          currentCell: { row: toRow, col: toCol },
          visitedCount,
          walls: [...walls]
        });
        
        // Remove highlight for next step
        newGrid[fromRow][fromCol].highlight = false;
        newGrid[toRow][toCol].highlight = false;
      }
    }
    
    // Set the animation steps
    animationStepsRef.current = steps;
    
    // Start the animation
    animateMazeGeneration();
  };
  
  // Cellular Automaton (randomized binary partition) for maze generation
  const generateMazeDivision = () => {
    setIsGenerating(true);
    setIsGenerated(false);
    
    // Reset animation state
    animationStepsRef.current = [];
    currentStepRef.current = 0;
    
    // Create a deep copy of the grid to avoid modifying state directly
    let newGrid = JSON.parse(JSON.stringify(grid));
    
    // For recursive division, we start with all walls removed
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        for (const dir of directions) {
          newGrid[row][col].walls[dir.name] = false;
        }
        // Keep the outer walls
        if (row === 0) newGrid[row][col].walls.North = true;
        if (col === 0) newGrid[row][col].walls.West = true;
        if (row === gridSize.rows - 1) newGrid[row][col].walls.South = true;
        if (col === gridSize.cols - 1) newGrid[row][col].walls.East = true;
        
        // Mark as visited since we're starting with an open grid
        newGrid[row][col].visited = true;
      }
    }
    
    // Set a random start and end cell on the perimeter
    let startRow, startCol, endRow, endCol;
    
    // Choose random perimeter positions
    const side1 = Math.floor(Math.random() * 4); // 0 = North, 1 = East, 2 = South, 3 = West
    
    if (side1 === 0) { // North
      startRow = 0;
      startCol = Math.floor(Math.random() * gridSize.cols);
      newGrid[startRow][startCol].walls.North = false;
    } else if (side1 === 1) { // East
      startRow = Math.floor(Math.random() * gridSize.rows);
      startCol = gridSize.cols - 1;
      newGrid[startRow][startCol].walls.East = false;
    } else if (side1 === 2) { // South
      startRow = gridSize.rows - 1;
      startCol = Math.floor(Math.random() * gridSize.cols);
      newGrid[startRow][startCol].walls.South = false;
    } else { // West
      startRow = Math.floor(Math.random() * gridSize.rows);
      startCol = 0;
      newGrid[startRow][startCol].walls.West = false;
    }
    
    newGrid[startRow][startCol].isStart = true;
    
    // Make sure end is on a different side
    let side2;
    do {
      side2 = Math.floor(Math.random() * 4);
    } while (side2 === side1);
    
    if (side2 === 0) { // North
      endRow = 0;
      endCol = Math.floor(Math.random() * gridSize.cols);
      newGrid[endRow][endCol].walls.North = false;
    } else if (side2 === 1) { // East
      endRow = Math.floor(Math.random() * gridSize.rows);
      endCol = gridSize.cols - 1;
      newGrid[endRow][endCol].walls.East = false;
    } else if (side2 === 2) { // South
      endRow = gridSize.rows - 1;
      endCol = Math.floor(Math.random() * gridSize.cols);
      newGrid[endRow][endCol].walls.South = false;
    } else { // West
      endRow = Math.floor(Math.random() * gridSize.rows);
      endCol = 0;
      newGrid[endRow][endCol].walls.West = false;
    }
    
    newGrid[endRow][endCol].isEnd = true;
    
    // Generate steps for animation
    const steps = [];
    steps.push({
      grid: JSON.parse(JSON.stringify(newGrid)),
      currentCell: null,
      visitedCount: gridSize.rows * gridSize.cols
    });
    
    // Chambers to divide - each chamber is defined by its top-left and bottom-right coordinates
    const chambers = [
      { x1: 0, y1: 0, x2: gridSize.cols - 1, y2: gridSize.rows - 1 }
    ];
    
    while (chambers.length > 0) {
      // Get the next chamber to divide
      const chamber = chambers.pop();
      const { x1, y1, x2, y2 } = chamber;
      
      // Skip chambers that are too small
      if (x2 - x1 < 1 || y2 - y1 < 1) continue;
      
      // Decide whether to divide horizontally or vertically
      // Prefer dividing along the longer axis
      const horizontalLength = x2 - x1;
      const verticalLength = y2 - y1;
      
      let divideHorizontally;
      
      if (horizontalLength < 2 && verticalLength < 2) {
        // Too small to divide meaningfully
        continue;
      } else if (horizontalLength < 2) {
        divideHorizontally = false;
      } else if (verticalLength < 2) {
        divideHorizontally = true;
      } else {
        // If more than double in one dimension, bias towards that
        if (horizontalLength > 2 * verticalLength) {
          divideHorizontally = true;
        } else if (verticalLength > 2 * horizontalLength) {
          divideHorizontally = false;
        } else {
          divideHorizontally = Math.random() < 0.5;
        }
      }
      
      if (divideHorizontally) {
        // Choose a point to divide (not at the edges)
        const divisionX = x1 + 1 + Math.floor(Math.random() * (horizontalLength - 1));
        
        // Create a passage at a random point
        const passageY = y1 + Math.floor(Math.random() * (verticalLength + 1));
        
        // Add walls at the division, except at the passage
        for (let y = y1; y <= y2; y++) {
          if (y !== passageY) {
            // Add a vertical wall between cells
            newGrid[y][divisionX - 1].walls.East = true;
            newGrid[y][divisionX].walls.West = true;
            
            // Highlight the cells being walled
            newGrid[y][divisionX - 1].highlight = true;
            newGrid[y][divisionX].highlight = true;
          }
        }
        
        // Record this step
        steps.push({
          grid: JSON.parse(JSON.stringify(newGrid)),
          currentCell: null,
          visitedCount: gridSize.rows * gridSize.cols,
          chamber: { x1, y1, x2, y2, divisionX, divideHorizontally, passageY }
        });
        
        // Remove highlights
        for (let y = y1; y <= y2; y++) {
          newGrid[y][divisionX - 1].highlight = false;
          newGrid[y][divisionX].highlight = false;
        }
        
        // Add the two new chambers to the list
        chambers.push({ x1, y1, x2: divisionX - 1, y2 }); // Left chamber
        chambers.push({ x1: divisionX, y1, x2, y2 });    // Right chamber
      } else {
        // Choose a point to divide (not at the edges)
        const divisionY = y1 + 1 + Math.floor(Math.random() * (verticalLength - 1));
        
        // Create a passage at a random point
        const passageX = x1 + Math.floor(Math.random() * (horizontalLength + 1));
        
        // Add walls at the division, except at the passage
        for (let x = x1; x <= x2; x++) {
          if (x !== passageX) {
            // Add a horizontal wall between cells
            newGrid[divisionY - 1][x].walls.South = true;
            newGrid[divisionY][x].walls.North = true;
            
            // Highlight the cells being walled
            newGrid[divisionY - 1][x].highlight = true;
            newGrid[divisionY][x].highlight = true;
          }
        }
        
        // Record this step
        steps.push({
          grid: JSON.parse(JSON.stringify(newGrid)),
          currentCell: null,
          visitedCount: gridSize.rows * gridSize.cols,
          chamber: { x1, y1, x2, y2, divisionY, divideHorizontally, passageX }
        });
        
        // Remove highlights
        for (let x = x1; x <= x2; x++) {
          newGrid[divisionY - 1][x].highlight = false;
          newGrid[divisionY][x].highlight = false;
        }
        
        // Add the two new chambers to the list
        chambers.push({ x1, y1, x2, y2: divisionY - 1 }); // Top chamber
        chambers.push({ x1, y1: divisionY, x2, y2 });    // Bottom chamber
      }
    }
    
    // Set the animation steps
    animationStepsRef.current = steps;
    
    // Start the animation
    animateMazeGeneration();
  };
  
  // Animate maze generation one step at a time
  const animateMazeGeneration = () => {
    // Use a reference variable to track the current step in the animation
    const stepRef = { current: 0 };
    const steps = animationStepsRef.current;
    
    const animate = () => {
      if (stepRef.current < steps.length) {
        const step = steps[stepRef.current];
        
        // Update grid state
        setGrid(step.grid);
        
        // Update current cell
        setCurrentCell(step.currentCell);
        
        // Update visited count
        setVisitedCells(step.visitedCount);
        
        // Increment step counter
        stepRef.current++;
        
        // Schedule next animation frame
        animationTimerRef.current = setTimeout(animate, animationSpeed);
      } else {
        // Animation complete
        setIsGenerating(false);
        setIsGenerated(true);
        setCurrentCell(null);
      }
    };
    
    // Start animation
    animate();
  };
  
  // Run the selected algorithm
  const runAlgorithm = () => {
    // Stop any running animation
    if (isGenerating) {
      stopAnimation();
      return;
    }
    
    switch (algorithm) {
      case 'recursiveBacktracking':
        generateMazeRecursiveBacktracking();
        break;
      case 'kruskal':
        generateMazeKruskal();
        break;
      case 'prim':
        generateMazePrim();
        break;
      case 'recursiveDivision':
        generateMazeDivision();
        break;
      default:
        generateMazeRecursiveBacktracking();
    }
  };
  
  // Stop the animation
  const stopAnimation = () => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    
    setIsGenerating(false);
    
    // If animation was in progress, show the final maze
    if (animationStepsRef.current.length > 0) {
      const finalStep = animationStepsRef.current[animationStepsRef.current.length - 1];
      setGrid(finalStep.grid);
      setVisitedCells(finalStep.visitedCount);
      setIsGenerated(true);
    }
  };
  
  // Helper functions for Kruskal's algorithm
  const findSet = (sets, index) => {
    if (sets[index] !== index) {
      sets[index] = findSet(sets, sets[index]);
    }
    return sets[index];
  };
  
  const unionSets = (sets, a, b) => {
    const rootA = findSet(sets, a);
    const rootB = findSet(sets, b);
    sets[rootB] = rootA;
  };
  
  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'recursiveBacktracking':
        return {
          name: 'Recursive Backtracking',
          description: 'A depth-first algorithm that "carves" passages by randomly breaking walls, backtracking when it reaches a dead end.',
          steps: '1. Start from a random cell\n2. Choose a random unvisited neighbor\n3. Remove the wall between the current cell and the chosen neighbor\n4. Move to the chosen neighbor\n5. Repeat steps 2-4 until all cells are visited or no valid moves remain\n6. Backtrack if no unvisited neighbors exist',
          characteristics: 'Produces mazes with long, winding passages. Tends to create many dead ends and few loops.',
          complexity: 'Time: O(n) | Space: O(n) (for the stack)',
        };
      case 'kruskal':
        return {
          name: 'Kruskal\'s Algorithm',
          description: 'A minimum spanning tree algorithm that works by selecting edges randomly and connecting disjoint sets of cells.',
          steps: '1. Start with all walls intact\n2. Assign each cell to its own set\n3. Randomly select walls (edges)\n4. If the cells separated by the wall are in different sets, remove the wall and merge the sets\n5. Repeat until all cells are in the same set',
          characteristics: 'Creates mazes with a more branching, "river-like" structure. Tends to have a balanced mix of passages and dead ends.',
          complexity: 'Time: O(E log E) | Space: O(V + E)',
        };
      case 'prim':
        return {
          name: 'Prim\'s Algorithm',
          description: 'Another minimum spanning tree algorithm that builds a maze by adding random walls to a growing region.',
          steps: '1. Start with a random cell in the maze\n2. Add the walls of this cell to a list\n3. While there are walls in the list:\n4.   Pick a random wall that connects a visited cell to an unvisited cell\n5.   Remove the wall, mark the unvisited cell as part of the maze\n6.   Add the walls of the new cell to the list',
          characteristics: 'Produces mazes with a "branching tree" appearance. Often has short, winding passages with many dead ends.',
          complexity: 'Time: O(E log V) | Space: O(V + E)',
        };
      case 'recursiveDivision':
        return {
          name: 'Recursive Division',
          description: 'A divide-and-conquer algorithm that recursively divides the grid into chambers, adding walls with passages.',
          steps: '1. Start with an empty grid (no walls)\n2. Recursively divide the grid into two sub-chambers by adding a wall with a single passage\n3. Continue dividing until chambers are too small to divide further',
          characteristics: 'Creates mazes with long, straight corridors. Tends to have a more structured, geometric appearance.',
          complexity: 'Time: O(n log n) | Space: O(log n) (for the recursion stack)',
        };
      default:
        return {
          name: 'Select an Algorithm',
          description: '',
          steps: '',
          characteristics: '',
          complexity: '',
        };
    }
  };
  
  const algorithmInfo = getAlgorithmDescription();
  
  // Render a cell
  const renderCell = (cell) => {
    const cellStyle = {
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      position: 'relative',
      borderTop: cell.walls.North ? '2px solid #333' : '2px solid transparent',
      borderRight: cell.walls.East ? '2px solid #333' : '2px solid transparent',
      borderBottom: cell.walls.South ? '2px solid #333' : '2px solid transparent',
      borderLeft: cell.walls.West ? '2px solid #333' : '2px solid transparent',
      backgroundColor: cell.highlight 
        ? '#ffeb3b' 
        : cell.isStart 
          ? '#4caf50' 
          : cell.isEnd 
            ? '#f44336' 
            : cell.inCurrentPath
              ? '#bbdefb'
              : 'white',
      transition: 'background-color 0.2s ease-in-out',
    };
    
    // Add highlight for the current cell in the animation
    if (currentCell && cell.row === currentCell.row && cell.col === currentCell.col) {
      cellStyle.backgroundColor = '#2196f3';
    }
    
    return (
      <div 
        key={`${cell.row}-${cell.col}`} 
        className="maze-cell" 
        style={cellStyle}
      >
        {/* Optionally show cell coordinates for debugging */}
        {/* <span style={{ fontSize: '8px', position: 'absolute', top: '1px', left: '1px', color: '#999' }}>
          {cell.row},{cell.col}
        </span> */}
      </div>
    );
  };
  
  // Calculate ideal cell size based on current container width
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.maze-container');
      if (container) {
        const containerWidth = container.clientWidth;
        // Set cell size so we can fit the entire maze
        const idealCellSize = Math.floor(containerWidth / (gridSize.cols + 2)); // +2 for some padding
        setCellSize(Math.min(Math.max(idealCellSize, 10), 30)); // Keep cell size between 10 and 30px
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSize]);
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Maze Generation Algorithms</h2>
            <p className="text-gray-600 max-w-2xl">
              Maze generation algorithms create complex labyrinths by systematically adding or removing walls according to specific rules,
              resulting in different patterns and difficulty levels.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => initializeGrid()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
              disabled={isGenerating}
            >
              Reset Grid
            </button>
            
            <button
              onClick={runAlgorithm}
              className={`px-4 py-2 ${isGenerating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md font-medium transition-colors`}
            >
              {isGenerating ? 'Stop' : isGenerated ? 'Regenerate' : 'Generate Maze'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Algorithm:
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
                disabled={isGenerating}
              >
                <option value="recursiveBacktracking">Recursive Backtracking</option>
                <option value="kruskal">Kruskal's Algorithm</option>
                <option value="prim">Prim's Algorithm</option>
                <option value="recursiveDivision">Recursive Division</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid Size: {gridSize.rows} × {gridSize.cols}
              </label>
              <div className="flex gap-2">
                <select
                  value={gridSize.rows}
                  onChange={(e) => setGridSize(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  disabled={isGenerating}
                >
                  {[10, 15, 20, 25, 30, 40, 50].map(size => (
                    <option key={size} value={size}>{size} rows</option>
                  ))}
                </select>
                <select
                  value={gridSize.cols}
                  onChange={(e) => setGridSize(prev => ({ ...prev, cols: parseInt(e.target.value) }))}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  disabled={isGenerating}
                >
                  {[10, 15, 20, 25, 30, 40, 50, 60].map(size => (
                    <option key={size} value={size}>{size} columns</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="5"
                max="200"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="showExplanation"
                checked={showExplanation}
                onChange={() => setShowExplanation(!showExplanation)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showExplanation" className="ml-2 block text-sm text-gray-700">
                Show Algorithm Explanation
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            {showExplanation && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold">{algorithmInfo.name}</h3>
                <p className="text-sm mt-1">{algorithmInfo.description}</p>
                
                {algorithmInfo.complexity && (
                  <p className="text-sm mt-2"><strong>Complexity:</strong> {algorithmInfo.complexity}</p>
                )}
                
                {algorithmInfo.characteristics && (
                  <p className="text-sm mt-2"><strong>Characteristics:</strong> {algorithmInfo.characteristics}</p>
                )}
              </div>
            )}
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-sm">Progress</h4>
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${(visitedCells / totalCells) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {isGenerating ? 'Generating maze...' : isGenerated ? 'Maze generated!' : 'Ready to generate'}
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-1.5 bg-white rounded">
                  <span className="font-medium">Cells processed:</span> {visitedCells} / {totalCells}
                </div>
                <div className="p-1.5 bg-white rounded">
                  <span className="font-medium">Completion:</span> {Math.round((visitedCells / totalCells) * 100)}%
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                <span>Start Point</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                <span>End Point</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                <span>Current Cell</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-sm mr-2"></div>
                <span>Highlighted Cell</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="maze-container overflow-auto">
          <div
            className="maze-grid inline-block"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`,
              gap: '0px',
              border: '2px solid #333'
            }}
          >
            {grid.map(row => row.map(cell => renderCell(cell)))}
          </div>
        </div>
      </div>
      
      {algorithmInfo.steps && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-2">Algorithm Steps</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{algorithmInfo.steps}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Understanding Maze Generation</h3>
        
        <div className="prose max-w-none">
          <p>
            Maze generation is a fascinating area of computational geometry and graph theory. The algorithms create complex labyrinths
            by systematically adding or removing walls according to specific rules. Different algorithms produce different types of mazes
            with varying characteristics, difficulty levels, and visual patterns.
          </p>
          
          <h4 className="text-md font-semibold mt-4">Types of Maze Algorithms</h4>
          
          <p>
            Maze generation algorithms can be broadly categorized into a few approaches:
          </p>
          
          <ul className="list-disc ml-6 mt-2 mb-4">
            <li><strong>Tree-based algorithms</strong> (like Recursive Backtracking, Prim's, and Kruskal's) create "perfect" mazes with exactly one path between any two points</li>
            <li><strong>Division methods</strong> (like Recursive Division) recursively divide space and add walls with passages</li>
            <li><strong>Cellular automata</strong> follow simple rules to create organic-looking maze patterns</li>
            <li><strong>Growth algorithms</strong> start with a solid grid and carve out passages</li>
            <li><strong>Hunt-and-kill algorithms</strong> combine aspects of randomized depth-first search with random walks</li>
          </ul>
          
          <h4 className="text-md font-semibold mt-4">Maze Properties</h4>
          
          <p>
            Different algorithms produce mazes with distinct properties:
          </p>
          
          <ul className="list-disc ml-6 mt-2 mb-4">
            <li><strong>Perfect mazes</strong> have exactly one path between any two cells, with no loops or isolated areas</li>
            <li><strong>Braided mazes</strong> intentionally contain loops and multiple paths between points</li>
            <li><strong>Bias</strong> refers to the tendency of an algorithm to create long passages in certain directions</li>
            <li><strong>River factor</strong> measures how often passages turn versus continue straight</li>
            <li><strong>Difficulty</strong> can be measured by the length of the solution path and number of dead ends</li>
          </ul>
          
          <h4 className="text-md font-semibold mt-4">Applications</h4>
          
          <p>
            Maze generation algorithms have applications beyond puzzles:
          </p>
          
          <ul className="list-disc ml-6 mt-2 mb-4">
            <li>Video game level design</li>
            <li>Procedural content generation</li>
            <li>Network and circuit design</li>
            <li>Urban planning and architectural layout</li>
            <li>Simulating natural growth patterns</li>
            <li>Educational tools for teaching algorithms</li>
          </ul>
          
          <p className="text-sm text-gray-600 mt-4">
            Try different algorithms and grid sizes to see how they affect the generated mazes. 
            Watching the generation process provides insight into how each algorithm works and the
            types of patterns it creates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MazeGenerationVisualizer;