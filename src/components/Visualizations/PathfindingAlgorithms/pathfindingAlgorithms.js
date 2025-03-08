/**
 * Pathfinding Algorithms for the Visualization
 * Each algorithm returns animations that can be used to visualize the pathfinding process
 */

// Helper function to get neighboring nodes
const getNeighbors = (grid, node) => {
    const neighbors = [];
    const { row, col } = node;
    const numRows = grid.length;
    const numCols = grid[0].length;
  
    // Up
    if (row > 0) neighbors.push(grid[row - 1][col]);
    // Right
    if (col < numCols - 1) neighbors.push(grid[row][col + 1]);
    // Down
    if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
    // Left
    if (col > 0) neighbors.push(grid[row][col - 1]);
  
    // Diagonal neighbors (comment out if you don't want diagonal movement)
    /*
    // Up-Right
    if (row > 0 && col < numCols - 1) neighbors.push(grid[row - 1][col + 1]);
    // Down-Right
    if (row < numRows - 1 && col < numCols - 1) neighbors.push(grid[row + 1][col + 1]);
    // Down-Left
    if (row < numRows - 1 && col > 0) neighbors.push(grid[row + 1][col - 1]);
    // Up-Left
    if (row > 0 && col > 0) neighbors.push(grid[row - 1][col - 1]);
    */
  
    return neighbors.filter(neighbor => !neighbor.isWall);
  };
  
  // Helper function to calculate Manhattan distance between two nodes
  const calculateManhattanDistance = (nodeA, nodeB) => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  };
  
  // Helper function to get the shortest path for visualization
  const getNodesInShortestPathOrder = (finishNode) => {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    
    // Make sure we have a finish node with a previousNode property
    if (!currentNode || currentNode.previousNode === undefined) {
      return nodesInShortestPathOrder;
    }
    
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  };
  
  // Dijkstra's Algorithm
  export function dijkstra(grid, startNode, finishNode, animations = []) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);
    
    let nodesExplored = 0;
    
    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();
      
      // If we encounter a wall, skip it
      if (closestNode.isWall) continue;
      
      // If the closest node is at a distance of infinity,
      // we're trapped and should stop
      if (closestNode.distance === Infinity) {
        animations.push({
          type: 'complete',
          pathFound: false,
          visitedNodes: visitedNodesInOrder,
          path: [],
          stats: { nodesExplored }
        });
        return visitedNodesInOrder;
      }
      
      // Mark node as visited
      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);
      animations.push({
        type: 'visit',
        node: closestNode,
        stats: { nodesExplored: ++nodesExplored }
      });
      
      // If we've reached the finish node, we're done (compare row/col instead of object reference)
      if (closestNode.row === finishNode.row && closestNode.col === finishNode.col) {
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        animations.push({
          type: 'complete',
          pathFound: true,
          visitedNodes: visitedNodesInOrder,
          path: nodesInShortestPathOrder,
          stats: { nodesExplored }
        });
        return visitedNodesInOrder;
      }
      
      // Update all neighbors
      updateUnvisitedNeighbors(closestNode, grid, animations);
    }
    
    // If we get here, there's no path to the finish node
    animations.push({
      type: 'complete',
      pathFound: false,
      visitedNodes: visitedNodesInOrder,
      path: [],
      stats: { nodesExplored }
    });
    return visitedNodesInOrder;
  }
  
  // Helper function to sort nodes by distance
  function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
  }
  
  // Helper function to update the unvisited neighbor nodes
  function updateUnvisitedNeighbors(node, grid, animations) {
    const neighbors = getNeighbors(grid, node);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        const newDistance = node.distance + 1;
        if (newDistance < neighbor.distance) {
          animations.push({
            type: 'update',
            node: neighbor,
            distance: newDistance,
            previousNode: node
          });
          neighbor.distance = newDistance;
          neighbor.previousNode = node;
        }
      }
    }
  }
  
  // Helper function to get all nodes in the grid
  function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }
  
  // A* Algorithm
  export function aStar(grid, startNode, finishNode, animations = []) {
    const openSet = [startNode];
    const closedSet = [];
    startNode.distance = 0;
    startNode.fScore = calculateManhattanDistance(startNode, finishNode);
    
    let nodesExplored = 0;
    
    while (openSet.length > 0) {
      // Sort the open set by fScore
      openSet.sort((a, b) => a.fScore - b.fScore);
      
      // Get the node with the lowest fScore
      const currentNode = openSet.shift();
      
      // If we've reached the finish node, we're done (compare row/col instead of object reference)
      if (currentNode.row === finishNode.row && currentNode.col === finishNode.col) {
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        animations.push({
          type: 'complete',
          pathFound: true,
          visitedNodes: closedSet,
          path: nodesInShortestPathOrder,
          stats: { nodesExplored }
        });
        return closedSet;
      }
      
      // Add current node to closed set
      closedSet.push(currentNode);
      currentNode.isVisited = true;
      animations.push({
        type: 'visit',
        node: currentNode,
        stats: { nodesExplored: ++nodesExplored }
      });
      
      // Check all neighbors
      const neighbors = getNeighbors(grid, currentNode);
      for (const neighbor of neighbors) {
        // Skip if neighbor is already evaluated
        if (closedSet.includes(neighbor)) continue;
        
        // Calculate g score (distance from start)
        const tentativeGScore = currentNode.distance + 1;
        
        // If neighbor is not in open set, add it
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } 
        // If this path to neighbor is worse, skip it
        else if (tentativeGScore >= neighbor.distance) {
          continue;
        }
        
        // This path is the best so far, record it
        animations.push({
          type: 'update',
          node: neighbor,
          distance: tentativeGScore,
          previousNode: currentNode
        });
        
        neighbor.previousNode = currentNode;
        neighbor.distance = tentativeGScore;
        neighbor.fScore = tentativeGScore + calculateManhattanDistance(neighbor, finishNode);
      }
    }
    
    // If we get here, there's no path to the finish node
    animations.push({
      type: 'complete',
      pathFound: false,
      visitedNodes: closedSet,
      path: [],
      stats: { nodesExplored }
    });
    return closedSet;
  }
  
  // Breadth-First Search (BFS)
  export function bfs(grid, startNode, finishNode, animations = []) {
    const visitedNodesInOrder = [];
    const queue = [startNode];
    startNode.isVisited = true;
    visitedNodesInOrder.push(startNode);
    
    let nodesExplored = 0;
    animations.push({
      type: 'visit',
      node: startNode,
      stats: { nodesExplored: ++nodesExplored }
    });
    
    while (queue.length) {
      const currentNode = queue.shift();
      
      // If we've reached the finish node, we're done (compare row/col instead of object reference)
      if (currentNode.row === finishNode.row && currentNode.col === finishNode.col) {
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        animations.push({
          type: 'complete',
          pathFound: true,
          visitedNodes: visitedNodesInOrder,
          path: nodesInShortestPathOrder,
          stats: { nodesExplored }
        });
        return visitedNodesInOrder;
      }
      
      // Get unvisited neighbors
      const neighbors = getNeighbors(grid, currentNode);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.isVisited = true;
          neighbor.previousNode = currentNode;
          visitedNodesInOrder.push(neighbor);
          queue.push(neighbor);
          
          animations.push({
            type: 'visit',
            node: neighbor,
            stats: { nodesExplored: ++nodesExplored }
          });
          
          animations.push({
            type: 'update',
            node: neighbor,
            distance: currentNode.distance + 1,
            previousNode: currentNode
          });
        }
      }
    }
    
    // If we get here, there's no path to the finish node
    animations.push({
      type: 'complete',
      pathFound: false,
      visitedNodes: visitedNodesInOrder,
      path: [],
      stats: { nodesExplored }
    });
    return visitedNodesInOrder;
  }
  
  // Depth-First Search (DFS)
  export function dfs(grid, startNode, finishNode, animations = []) {
    const visitedNodesInOrder = [];
    const stack = [startNode];
    
    let nodesExplored = 0;
    
    while (stack.length) {
      const currentNode = stack.pop();
      
      // Skip if already visited
      if (currentNode.isVisited) continue;
      
      // Mark as visited
      currentNode.isVisited = true;
      visitedNodesInOrder.push(currentNode);
      
      animations.push({
        type: 'visit',
        node: currentNode,
        stats: { nodesExplored: ++nodesExplored }
      });
      
      // If we've reached the finish node, we're done
      if (currentNode === finishNode) {
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        animations.push({
          type: 'complete',
          pathFound: true,
          visitedNodes: visitedNodesInOrder,
          path: nodesInShortestPathOrder,
          stats: { nodesExplored }
        });
        return visitedNodesInOrder;
      }
      
      // Get unvisited neighbors in reverse order for DFS behavior
      const neighbors = getNeighbors(grid, currentNode).reverse();
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.previousNode = currentNode;
          
          animations.push({
            type: 'update',
            node: neighbor,
            distance: currentNode.distance + 1,
            previousNode: currentNode
          });
          
          stack.push(neighbor);
        }
      }
    }
    
    // If we get here, there's no path to the finish node
    animations.push({
      type: 'complete',
      pathFound: false,
      visitedNodes: visitedNodesInOrder,
      path: [],
      stats: { nodesExplored }
    });
    return visitedNodesInOrder;
  }
  
  // Greedy Best-First Search
  export function greedyBestFirstSearch(grid, startNode, finishNode, animations = []) {
    const openSet = [startNode];
    const closedSet = [];
    startNode.distance = 0;
    startNode.heuristic = calculateManhattanDistance(startNode, finishNode);
    
    let nodesExplored = 0;
    
    while (openSet.length > 0) {
      // Sort by heuristic (not by f-score like A*)
      openSet.sort((a, b) => a.heuristic - b.heuristic);
      
      const currentNode = openSet.shift();
      
      // Skip if already in closed set
      if (closedSet.includes(currentNode)) continue;
      
      // Add to closed set
      closedSet.push(currentNode);
      currentNode.isVisited = true;
      
      animations.push({
        type: 'visit',
        node: currentNode,
        stats: { nodesExplored: ++nodesExplored }
      });
      
      // If we've reached the finish node, we're done
      if (currentNode === finishNode) {
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        animations.push({
          type: 'complete',
          pathFound: true,
          visitedNodes: closedSet,
          path: nodesInShortestPathOrder,
          stats: { nodesExplored }
        });
        return closedSet;
      }
      
      // Check all neighbors
      const neighbors = getNeighbors(grid, currentNode);
      for (const neighbor of neighbors) {
        // Skip if already evaluated
        if (closedSet.includes(neighbor)) continue;
        
        const gScore = currentNode.distance + 1;
        
        // Add to open set if not already in it
        if (!openSet.includes(neighbor)) {
          neighbor.previousNode = currentNode;
          neighbor.distance = gScore;
          neighbor.heuristic = calculateManhattanDistance(neighbor, finishNode);
          openSet.push(neighbor);
          
          animations.push({
            type: 'update',
            node: neighbor,
            distance: gScore,
            previousNode: currentNode
          });
        }
      }
    }
    
    // If we get here, there's no path to the finish node
    animations.push({
      type: 'complete',
      pathFound: false,
      visitedNodes: closedSet,
      path: [],
      stats: { nodesExplored }
    });
    return closedSet;
  }