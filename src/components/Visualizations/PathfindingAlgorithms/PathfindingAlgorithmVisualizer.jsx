import React, { useState, useEffect, useRef } from 'react';
import { dijkstra, aStar, bfs, dfs, greedyBestFirstSearch } from './pathfindingAlgorithms';

// Constants for visualization
const DEFAULT_GRID_ROWS = 20;
const DEFAULT_GRID_COLS = 40;
const DEFAULT_ANIMATION_SPEED = 20; // milliseconds

const PathfindingAlgorithmVisualizer = () => {
  // State for visualization parameters
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [startNodePos, setStartNodePos] = useState({ row: 10, col: 5 });
  const [finishNodePos, setFinishNodePos] = useState({ row: 10, col: 35 });
  const [currentAlgorithm, setCurrentAlgorithm] = useState('dijkstra');
  const [isRunning, setIsRunning] = useState(false);
  const [isMovingStart, setIsMovingStart] = useState(false);
  const [isMovingFinish, setIsMovingFinish] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_ANIMATION_SPEED);
  const [showAlgorithmDescription, setShowAlgorithmDescription] = useState(true);
  const [gridSize, setGridSize] = useState({ rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS });
  const [stats, setStats] = useState({ nodesExplored: 0 });
  const [algorithmComplete, setAlgorithmComplete] = useState(false);
  const [pathFound, setPathFound] = useState(false);
  
  const animationsTimeoutsRef = useRef([]);
  
  // Initialize and reset grid
  const initializeGrid = () => {
    const newGrid = [];
    for (let row = 0; row < gridSize.rows; row++) {
      const currentRow = [];
      for (let col = 0; col < gridSize.cols; col++) {
        currentRow.push(createNode(row, col));
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  };
  
  // Create a node with initial properties
  const createNode = (row, col) => {
    return {
      row,
      col,
      isStart: row === startNodePos.row && col === startNodePos.col,
      isFinish: row === finishNodePos.row && col === finishNodePos.col,
      distance: Infinity,
      fScore: Infinity,
      heuristic: Infinity, 
      isVisited: false,
      isWall: false,
      isPath: false,
      previousNode: null,
    };
  };
  
  // Initialize grid on component mount
  useEffect(() => {
    const initialGrid = initializeGrid();
    setGrid(initialGrid);
    return () => {
      // Clear all timeouts when component unmounts
      animationsTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [gridSize, startNodePos, finishNodePos]);
  
  // Reset the grid without walls
  const resetGrid = () => {
    setAlgorithmComplete(false);
    setPathFound(false);
    setStats({ nodesExplored: 0 });
    const newGrid = initializeGrid();
    setGrid(newGrid);
  };
  
  // Clear the visited and path visualization but keep walls
  const clearVisualization = () => {
    setAlgorithmComplete(false);
    setPathFound(false);
    setStats({ nodesExplored: 0 });
    const newGrid = grid.map(row => 
      row.map(node => {
        return {
          ...node,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          fScore: Infinity,
          heuristic: Infinity,
          previousNode: null,
        };
      })
    );
    setGrid(newGrid);
  };
  
  // Handle mouse down on a node
  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    
    // If we're clicking on start or finish node, prepare to move it
    if (grid[row][col].isStart) {
      setIsMovingStart(true);
      setMouseIsPressed(true);
      return;
    }
    
    if (grid[row][col].isFinish) {
      setIsMovingFinish(true);
      setMouseIsPressed(true);
      return;
    }
    
    // Otherwise, toggle wall
    const newGrid = toggleWall(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };
  
  // Handle mouse enter on a node (drag behavior)
  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isRunning) return;
    
    if (isMovingStart) {
      moveStartNode(row, col);
      return;
    }
    
    if (isMovingFinish) {
      moveFinishNode(row, col);
      return;
    }
    
    // If not moving start/finish, toggle wall
    const newGrid = toggleWall(grid, row, col);
    setGrid(newGrid);
  };
  
  // Handle mouse up (end of drag)
  const handleMouseUp = () => {
    setMouseIsPressed(false);
    setIsMovingStart(false);
    setIsMovingFinish(false);
  };
  
  // Toggle wall state for a node
  const toggleWall = (grid, row, col) => {
    // Don't allow walls on start or finish nodes
    if (grid[row][col].isStart || grid[row][col].isFinish) return grid;
    
    const newGrid = [...grid];
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };
  
  // Move the start node to a new position
  const moveStartNode = (row, col) => {
    // Don't allow moving to a wall or the finish node
    if (grid[row][col].isWall || grid[row][col].isFinish) return;
    
    const newGrid = grid.map(gridRow => 
      gridRow.map(node => {
        if (node.isStart) {
          return {
            ...node,
            isStart: false,
          };
        }
        if (node.row === row && node.col === col) {
          return {
            ...node,
            isStart: true,
          };
        }
        return node;
      })
    );
    
    setStartNodePos({ row, col });
    setGrid(newGrid);
  };
  
  // Move the finish node to a new position
  const moveFinishNode = (row, col) => {
    // Don't allow moving to a wall or the start node
    if (grid[row][col].isWall || grid[row][col].isStart) return;
    
    const newGrid = grid.map(gridRow => 
      gridRow.map(node => {
        if (node.isFinish) {
          return {
            ...node,
            isFinish: false,
          };
        }
        if (node.row === row && node.col === col) {
          return {
            ...node,
            isFinish: true,
          };
        }
        return node;
      })
    );
    
    setFinishNodePos({ row, col });
    setGrid(newGrid);
  };
  
  // Visualize the selected algorithm
  const visualizeAlgorithm = () => {
    if (isRunning) {
      stopVisualization();
      return;
    }
    
    clearVisualization();
    setIsRunning(true);
    setAlgorithmComplete(false);
    setPathFound(false);
    
    // Clear previous timeouts
    animationsTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationsTimeoutsRef.current = [];
    
    // Get start and finish nodes
    const startNode = grid[startNodePos.row][startNodePos.col];
    const finishNode = grid[finishNodePos.row][finishNodePos.col];
    
    // Initialize grid nodes for algorithm
    const gridCopy = grid.map(row => 
      row.map(node => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        fScore: Infinity,
        heuristic: Infinity,
        previousNode: null,
      }))
    );
    
    // Get the selected algorithm function
    let algorithmFunction;
    switch (currentAlgorithm) {
      case 'dijkstra':
        algorithmFunction = dijkstra;
        break;
      case 'aStar':
        algorithmFunction = aStar;
        break;
      case 'bfs':
        algorithmFunction = bfs;
        break;
      case 'dfs':
        algorithmFunction = dfs;
        break;
      case 'greedy':
        algorithmFunction = greedyBestFirstSearch;
        break;
      default:
        algorithmFunction = dijkstra;
        break;
    }
    
    // Run the algorithm and get animations
    const animations = [];
    // Get the correct node references from the copied grid
    const startNodeCopy = gridCopy[startNodePos.row][startNodePos.col];
    const finishNodeCopy = gridCopy[finishNodePos.row][finishNodePos.col];
    algorithmFunction(gridCopy, startNodeCopy, finishNodeCopy, animations);
    
    // Animate the algorithm
    animateAlgorithm(animations);
  };
  
  // Stop the current visualization
  const stopVisualization = () => {
    animationsTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationsTimeoutsRef.current = [];
    setIsRunning(false);
  };
  
  // Animate the algorithm process
  const animateAlgorithm = (animations) => {
    animations.forEach((animation, index) => {
      const timeout = setTimeout(() => {
        const { type, node, distance, previousNode, visitedNodes, path, pathFound: foundPath, stats: animationStats } = animation;
        
        if (type === 'visit') {
          // Visualize visited node
          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            const nodeToUpdate = newGrid[node.row][node.col];
            newGrid[node.row][node.col] = {
              ...nodeToUpdate,
              isVisited: true,
            };
            return newGrid;
          });
          
          // Update stats
          if (animationStats) {
            setStats(animationStats);
          }
        } else if (type === 'update') {
          // Update node's distance and previous node reference
          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            const nodeToUpdate = newGrid[node.row][node.col];
            newGrid[node.row][node.col] = {
              ...nodeToUpdate,
              distance: distance !== undefined ? distance : nodeToUpdate.distance,
              previousNode: previousNode || nodeToUpdate.previousNode,
            };
            return newGrid;
          });
        } else if (type === 'complete') {
          // Algorithm completed, visualize the path if found
          setAlgorithmComplete(true);
          setPathFound(foundPath);
          setStats(animationStats);
          
          if (foundPath && path) {
            // Animate path after a short delay
            const pathTimeout = setTimeout(() => {
              animatePath(path);
            }, 500);
            animationsTimeoutsRef.current.push(pathTimeout);
          } else {
            // If no path found, stop running state
            setIsRunning(false);
          }
        }
        
        // If this is the last animation and we're not showing a path, we're done
        if (index === animations.length - 1 && type !== 'complete') {
          setIsRunning(false);
        }
      }, index * animationSpeed);
      
      animationsTimeoutsRef.current.push(timeout);
    });
  };
  
  // Animate the shortest path
  const animatePath = (path) => {
    path.forEach((node, index) => {
      if (index === 0 || index === path.length - 1) return; // Skip start and finish nodes
      
      const timeout = setTimeout(() => {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          const nodeToUpdate = newGrid[node.row][node.col];
          newGrid[node.row][node.col] = {
            ...nodeToUpdate,
            isPath: true,
          };
          return newGrid;
        });
        
        // If this is the last node in path, we're done
        if (index === path.length - 2) {
          setIsRunning(false);
        }
      }, index * (animationSpeed * 2));
      
      animationsTimeoutsRef.current.push(timeout);
    });
  };
  
  // Generate random walls
  const generateRandomWalls = () => {
    if (isRunning) return;
    
    clearVisualization();
    
    const newGrid = grid.map(row => 
      row.map(node => {
        if (node.isStart || node.isFinish) return node;
        
        const random = Math.random();
        return {
          ...node,
          isWall: random < 0.28, // ~28% chance of being a wall
        };
      })
    );
    
    setGrid(newGrid);
  };
  
  // Generate a maze pattern
  const generateMaze = () => {
    if (isRunning) return;
    
    clearVisualization();
    
    // Create a grid with all walls
    let newGrid = grid.map(row => 
      row.map(node => {
        if (node.isStart || node.isFinish) return node;
        return {
          ...node,
          isWall: true,
        };
      })
    );
    
    // Simple recursive division maze algorithm (simplified version)
    const startRow = 0;
    const endRow = gridSize.rows - 1;
    const startCol = 0;
    const endCol = gridSize.cols - 1;
    
    // Carve passages
    for (let row = startRow; row <= endRow; row += 2) {
      for (let col = startCol; col <= endCol; col += 2) {
        if (row < gridSize.rows && col < gridSize.cols) {
          // Check if this is start or finish node
          if ((row === startNodePos.row && col === startNodePos.col) || 
              (row === finishNodePos.row && col === finishNodePos.col)) {
            continue;
          }
          
          // Make this cell a passage
          newGrid[row][col].isWall = false;
          
          // Randomly connect to adjacent passages
          const directions = [];
          if (row > startRow) directions.push('up');
          if (col > startCol) directions.push('left');
          
          if (directions.length > 0) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            
            if (direction === 'up' && row - 1 >= startRow) {
              newGrid[row - 1][col].isWall = false;
            } else if (direction === 'left' && col - 1 >= startCol) {
              newGrid[row][col - 1].isWall = false;
            }
          }
        }
      }
    }
    
    // Ensure there's a path around start and finish nodes
    const clearAroundNode = (row, col) => {
      for (let r = Math.max(0, row - 1); r <= Math.min(gridSize.rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(gridSize.cols - 1, col + 1); c++) {
          newGrid[r][c].isWall = false;
        }
      }
    };
    
    clearAroundNode(startNodePos.row, startNodePos.col);
    clearAroundNode(finishNodePos.row, finishNodePos.col);
    
    setGrid(newGrid);
  };
  
  // Handle algorithm change
  const handleAlgorithmChange = (e) => {
    if (isRunning) return;
    setCurrentAlgorithm(e.target.value);
  };
  
  // Handle animation speed change
  const handleSpeedChange = (e) => {
    setAnimationSpeed(parseInt(e.target.value));
  };
  
  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (currentAlgorithm) {
      case 'dijkstra':
        return {
          name: "Dijkstra's Algorithm",
          description: "Explores all possible paths, starting with the shortest ones, and guarantees the shortest path.",
          properties: "Weighted, Guarantees shortest path, Explores in all directions",
          complexity: "Time: O(V²) or O(E + V log V) with a priority queue | Space: O(V)",
          inventor: "Edsger W. Dijkstra, 1956"
        };
      case 'aStar':
        return {
          name: "A* Algorithm",
          description: "Uses a heuristic to estimate the distance to the goal, focusing the search toward the target.",
          properties: "Weighted, Guarantees shortest path (with admissible heuristic), Directed search",
          complexity: "Time: O(E) | Space: O(V)",
          inventor: "Peter Hart, Nils Nilsson, and Bertram Raphael, 1968"
        };
      case 'bfs':
        return {
          name: "Breadth-First Search",
          description: "Explores all neighboring nodes at the present depth before moving to nodes at the next depth level.",
          properties: "Unweighted, Guarantees shortest path (in unweighted graphs), Explores in concentric circles",
          complexity: "Time: O(V + E) | Space: O(V)",
          inventor: "Discovered independently by multiple researchers"
        };
      case 'dfs':
        return {
          name: "Depth-First Search",
          description: "Explores as far as possible along each branch before backtracking, often finding suboptimal paths.",
          properties: "Unweighted, Does not guarantee shortest path, Memory-efficient",
          complexity: "Time: O(V + E) | Space: O(V) worst case or O(h) with h being the maximum depth",
          inventor: "Attributed to French mathematician Charles Pierre Trémaux in the 19th century"
        };
      case 'greedy':
        return {
          name: "Greedy Best-First Search",
          description: "Always moves toward the goal based solely on heuristic, ignoring the cost of the path so far.",
          properties: "Weighted, Does not guarantee shortest path, Very directed search",
          complexity: "Time: O(E) | Space: O(V)",
          inventor: "Variations developed by multiple researchers"
        };
      default:
        return {
          name: "Unknown Algorithm",
          description: "No description available.",
          properties: "Unknown",
          complexity: "Unknown"
        };
    }
  };
  
  const algorithmInfo = getAlgorithmDescription();
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-2xl font-bold">{algorithmInfo.name}</h2>
            <p className="text-gray-600">{algorithmInfo.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={resetGrid}
              disabled={isRunning}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isRunning ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Clear Board
            </button>
            
            <button
              onClick={clearVisualization}
              disabled={isRunning}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isRunning ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              Clear Path
            </button>
            
            <button
              onClick={visualizeAlgorithm}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isRunning
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isRunning ? 'Stop' : algorithmComplete ? 'Run Again' : 'Visualize!'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Algorithm:
            </label>
            <select
              value={currentAlgorithm}
              onChange={handleAlgorithmChange}
              disabled={isRunning}
              className={`block w-full p-2 border border-gray-300 rounded-md ${
                isRunning ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="aStar">A* Search</option>
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
              <option value="greedy">Greedy Best-First Search</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Animation Speed: {animationSpeed}ms
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={animationSpeed}
              onChange={handleSpeedChange}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center mt-4">
          <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
            <button
              onClick={generateRandomWalls}
              disabled={isRunning}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isRunning ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              Random Walls
            </button>
            
            <button
              onClick={generateMaze}
              disabled={isRunning}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isRunning ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Generate Maze
            </button>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showDescription"
              checked={showAlgorithmDescription}
              onChange={() => setShowAlgorithmDescription(!showAlgorithmDescription)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showDescription" className="ml-2 block text-sm text-gray-700">
              Show Algorithm Details
            </label>
          </div>
        </div>
        
        {showAlgorithmDescription && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-2 bg-gray-50 rounded">
              <span className="font-semibold">Properties:</span> {algorithmInfo.properties}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="font-semibold">Complexity:</span> {algorithmInfo.complexity}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="font-semibold">Nodes Explored:</span> {stats.nodesExplored}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="font-semibold">Path Status:</span>{' '}
              {algorithmComplete 
                ? (pathFound ? 'Path found!' : 'No path possible!') 
                : 'Not calculated yet'}
            </div>
          </div>
        )}
      </div>
      
      <div className="visualization-container bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <div className="grid-container" style={{ display: 'inline-block', minWidth: '100%' }}>
          <div className="legend flex flex-wrap gap-4 mb-4 justify-center">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-sm">Start Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-sm mr-2"></div>
              <span className="text-sm">Finish Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-400 rounded-sm mr-2"></div>
              <span className="text-sm">Shortest Path</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-purple-300 rounded-sm mr-2"></div>
              <span className="text-sm">Visited Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-800 rounded-sm mr-2"></div>
              <span className="text-sm">Wall</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-white border border-gray-300 rounded-sm mr-2"></div>
              <span className="text-sm">Unvisited Node</span>
            </div>
          </div>
          
          <div 
            className="grid border border-gray-300"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${gridSize.cols}, 25px)`,
              gap: '1px'
            }}
          >
            {grid.map((row, rowIndex) => (
              row.map((node, colIndex) => {
                const {
                  row,
                  col,
                  isStart,
                  isFinish,
                  isWall,
                  isVisited,
                  isPath,
                } = node;
                
                // Determine the className for the node
                let nodeClassName = "h-6 w-full transition-colors duration-200";
                
                if (isStart) {
                  nodeClassName += " bg-blue-500";
                } else if (isFinish) {
                  nodeClassName += " bg-red-500";
                } else if (isWall) {
                  nodeClassName += " bg-gray-800";
                } else if (isPath) {
                  nodeClassName += " bg-green-400";
                } else if (isVisited) {
                  nodeClassName += " bg-purple-300";
                } else {
                  nodeClassName += " bg-white hover:bg-gray-100";
                }
                
                return (
                  <div
                    key={`${row}-${col}`}
                    className={nodeClassName}
                    onMouseDown={() => handleMouseDown(row, col)}
                    onMouseEnter={() => handleMouseEnter(row, col)}
                    onMouseUp={handleMouseUp}
                  ></div>
                );
              })
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">How to Use This Visualization</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Click and drag to create walls that block the path</li>
          <li>Click and drag the blue start node or red finish node to move them</li>
          <li>Select an algorithm from the dropdown menu</li>
          <li>Click "Visualize!" to see the algorithm in action</li>
          <li>Use "Random Walls" or "Generate Maze" for interesting patterns</li>
          <li>Adjust the animation speed slider to control visualization speed</li>
          <li>Click "Clear Path" to remove the visualization but keep walls</li>
          <li>Click "Clear Board" to reset the entire grid</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-semibold">About Pathfinding Algorithms</h4>
          <p className="mt-2 text-gray-700">
            Pathfinding algorithms are used to find the shortest or most efficient route between two points.
            They have applications in GPS navigation, robotics, video games, network routing, and many other fields.
            Different algorithms have different properties and trade-offs in terms of speed, memory usage, and optimality
            of the paths they find.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PathfindingAlgorithmVisualizer;