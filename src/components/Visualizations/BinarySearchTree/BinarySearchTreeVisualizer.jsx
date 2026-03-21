import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── BST Node class ───────────────────────────────────────────────────────────
class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }
}

// ─── Pure BST / AVL helpers (immutable-style: they mutate the tree in place
//     but that's fine because we always clone before operating) ─────────────────

function nodeHeight(node) {
  return node ? node.height : 0;
}

function updateHeight(node) {
  if (node) {
    node.height = 1 + Math.max(nodeHeight(node.left), nodeHeight(node.right));
  }
}

function balanceFactor(node) {
  return node ? nodeHeight(node.left) - nodeHeight(node.right) : 0;
}

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function avlBalance(node) {
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1) {
    if (balanceFactor(node.left) < 0) {
      node.left = rotateLeft(node.left);
    }
    return rotateRight(node);
  }
  if (bf < -1) {
    if (balanceFactor(node.right) > 0) {
      node.right = rotateRight(node.right);
    }
    return rotateLeft(node);
  }
  return node;
}

// Insert into BST (returns {root, steps})
function bstInsert(root, value, avlMode) {
  const steps = [];

  function insert(node) {
    if (!node) {
      steps.push({ type: 'insert', value });
      const newNode = new BSTNode(value);
      return newNode;
    }
    steps.push({ type: 'visit', value: node.value });
    if (value < node.value) {
      node.left = insert(node.left);
    } else if (value > node.value) {
      node.right = insert(node.right);
    } else {
      steps.push({ type: 'found', value: node.value, msg: 'Duplicate – not inserted' });
      return node;
    }
    updateHeight(node);
    if (avlMode) {
      const bf = balanceFactor(node);
      if (Math.abs(bf) > 1) {
        steps.push({ type: 'rotate', value: node.value, bf });
      }
      node = avlBalance(node);
    }
    return node;
  }

  const newRoot = insert(root);
  return { root: newRoot, steps };
}

// Search
function bstSearch(root, value) {
  const steps = [];
  let node = root;
  while (node) {
    steps.push({ type: 'visit', value: node.value });
    if (value === node.value) {
      steps.push({ type: 'found', value: node.value });
      return { found: true, steps };
    }
    node = value < node.value ? node.left : node.right;
  }
  steps.push({ type: 'notfound', value });
  return { found: false, steps };
}

// Find min value node
function findMin(node) {
  while (node.left) node = node.left;
  return node;
}

// Delete from BST (returns {root, steps})
function bstDelete(root, value, avlMode) {
  const steps = [];

  function removeInner(node, val) {
    if (!node) return null;
    if (val < node.value) {
      node.left = removeInner(node.left, val);
    } else if (val > node.value) {
      node.right = removeInner(node.right, val);
    } else {
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const s = findMin(node.right);
      node.value = s.value;
      node.right = removeInner(node.right, s.value);
    }
    if (!node) return null;
    updateHeight(node);
    if (avlMode) node = avlBalance(node);
    return node;
  }

  function removeOuter(node) {
    if (!node) {
      steps.push({ type: 'notfound', value });
      return null;
    }
    steps.push({ type: 'visit', value: node.value });
    if (value < node.value) {
      node.left = removeOuter(node.left);
    } else if (value > node.value) {
      node.right = removeOuter(node.right);
    } else {
      steps.push({ type: 'delete', value: node.value });
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const successor = findMin(node.right);
      steps.push({ type: 'successor', value: successor.value });
      node.value = successor.value;
      node.right = removeInner(node.right, successor.value);
    }
    if (!node) return null;
    updateHeight(node);
    if (avlMode) {
      const bf = balanceFactor(node);
      if (Math.abs(bf) > 1) {
        steps.push({ type: 'rotate', value: node.value, bf });
      }
      node = avlBalance(node);
    }
    return node;
  }

  const newRoot = removeOuter(root);
  return { root: newRoot, steps };
}

// Traversals
function inOrder(node, result = []) {
  if (!node) return result;
  inOrder(node.left, result);
  result.push(node.value);
  inOrder(node.right, result);
  return result;
}

function preOrder(node, result = []) {
  if (!node) return result;
  result.push(node.value);
  preOrder(node.left, result);
  preOrder(node.right, result);
  return result;
}

function postOrder(node, result = []) {
  if (!node) return result;
  postOrder(node.left, result);
  postOrder(node.right, result);
  result.push(node.value);
  return result;
}

// Deep clone a tree
function cloneTree(node) {
  if (!node) return null;
  const c = new BSTNode(node.value);
  c.height = node.height;
  c.left = cloneTree(node.left);
  c.right = cloneTree(node.right);
  return c;
}

// Count nodes
function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

// ─── Layout calculation ───────────────────────────────────────────────────────
function layoutTree(root, canvasWidth) {
  if (!root) return;
  const topPadding = 50;
  const levelHeight = 70;
  const minHGap = 36;

  // Assign x using in-order index
  let idx = 0;
  function assignIndex(node) {
    if (!node) return;
    assignIndex(node.left);
    node._idx = idx++;
    assignIndex(node.right);
  }
  assignIndex(root);

  const total = idx;
  const usableWidth = Math.max(canvasWidth - 80, total * minHGap);
  const startX = (canvasWidth - usableWidth) / 2;
  const gap = total > 1 ? usableWidth / (total - 1) : 0;

  function assignPos(node, depth) {
    if (!node) return;
    node.x = total === 1 ? canvasWidth / 2 : startX + node._idx * gap;
    node.y = topPadding + depth * levelHeight;
    assignPos(node.left, depth + 1);
    assignPos(node.right, depth + 1);
  }
  assignPos(root, 0);
}

// ─── Presets ──────────────────────────────────────────────────────────────────
function buildBalancedPreset() {
  // Insert in order that creates a balanced tree: 50,25,75,12,37,62,87
  const vals = [50, 25, 75, 12, 37, 62, 87];
  let root = null;
  for (const v of vals) {
    root = bstInsert(root, v, false).root;
  }
  return root;
}

function buildSkewedPreset() {
  const vals = [10, 20, 30, 40, 50, 60, 70];
  let root = null;
  for (const v of vals) {
    root = bstInsert(root, v, false).root;
  }
  return root;
}

function buildRandomPreset() {
  const count = 9;
  const used = new Set();
  const vals = [];
  while (vals.length < count) {
    const v = Math.floor(Math.random() * 95) + 5;
    if (!used.has(v)) { used.add(v); vals.push(v); }
  }
  let root = null;
  for (const v of vals) {
    root = bstInsert(root, v, false).root;
  }
  return root;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_RADIUS = 22;
const COLORS = {
  node: '#4f46e5',             // indigo-600
  nodeGradEnd: '#7c3aed',     // violet-600
  nodeStroke: '#3730a3',       // indigo-800
  text: '#ffffff',
  edge: '#94a3b8',             // slate-400
  highlight: '#facc15',        // yellow-400
  found: '#22c55e',            // green-500
  path: '#3b82f6',             // blue-500
  delete: '#ef4444',           // red-500
  successor: '#f97316',        // orange-500
  rotate: '#ec4899',           // pink-500
  traversal: '#8b5cf6',        // violet-500
  bg: '#f8fafc',               // slate-50
};

// ─── Component ────────────────────────────────────────────────────────────────
const BinarySearchTreeVisualizer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeoutsRef = useRef([]);

  const [tree, setTree] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [avlMode, setAvlMode] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [animating, setAnimating] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState({});
  const [statusMsg, setStatusMsg] = useState('Build your tree using the controls below.');
  const [traversalResult, setTraversalResult] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 500 });

  // Recalculate canvas size on mount / resize
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasSize({ w, h: Math.max(400, Math.min(600, w * 0.55)) });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Drawing ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    if (!tree) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tree is empty. Insert a value to begin.', canvasSize.w / 2, canvasSize.h / 2);
      return;
    }

    layoutTree(tree, canvasSize.w);

    // Draw edges first
    function drawEdges(node) {
      if (!node) return;
      if (node.left) {
        drawEdge(ctx, node, node.left);
        drawEdges(node.left);
      }
      if (node.right) {
        drawEdge(ctx, node, node.right);
        drawEdges(node.right);
      }
    }

    function drawEdge(ctx, from, to) {
      ctx.beginPath();
      ctx.strokeStyle = COLORS.edge;
      ctx.lineWidth = 2;
      // slight curve
      const cpx = (from.x + to.x) / 2;
      const cpy = (from.y + to.y) / 2 - 5;
      ctx.moveTo(from.x, from.y + NODE_RADIUS);
      ctx.quadraticCurveTo(cpx, cpy, to.x, to.y - NODE_RADIUS);
      ctx.stroke();
    }

    drawEdges(tree);

    // Draw nodes
    function drawNodes(node) {
      if (!node) return;
      drawNode(ctx, node);
      drawNodes(node.left);
      drawNodes(node.right);
    }

    drawNodes(tree);
  }, [tree, canvasSize, highlightedNodes, avlMode, selectedNode]);

  // Individual node drawing (uses highlightedNodes from closure)
  function drawNode(ctx, node) {
    const hl = highlightedNodes[node.value];
    const isSelected = selectedNode === node.value;

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Circle with gradient
    const grad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, NODE_RADIUS);
    let baseColor = COLORS.node;
    let endColor = COLORS.nodeGradEnd;
    let strokeColor = COLORS.nodeStroke;

    if (hl === 'visit' || hl === 'highlight') {
      baseColor = COLORS.highlight;
      endColor = '#fbbf24';
      strokeColor = '#b45309';
    } else if (hl === 'found') {
      baseColor = COLORS.found;
      endColor = '#16a34a';
      strokeColor = '#166534';
    } else if (hl === 'path') {
      baseColor = COLORS.path;
      endColor = '#2563eb';
      strokeColor = '#1e3a8a';
    } else if (hl === 'delete') {
      baseColor = COLORS.delete;
      endColor = '#dc2626';
      strokeColor = '#991b1b';
    } else if (hl === 'successor') {
      baseColor = COLORS.successor;
      endColor = '#ea580c';
      strokeColor = '#9a3412';
    } else if (hl === 'rotate') {
      baseColor = COLORS.rotate;
      endColor = '#db2777';
      strokeColor = '#9d174d';
    } else if (hl === 'traversal') {
      baseColor = COLORS.traversal;
      endColor = '#7c3aed';
      strokeColor = '#5b21b6';
    }

    if (isSelected && !hl) {
      strokeColor = '#0ea5e9';
    }

    grad.addColorStop(0, endColor);
    grad.addColorStop(1, baseColor);

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Stroke
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Value text
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.x, node.y);

    // AVL balance factor badge
    if (avlMode) {
      const bf = balanceFactor(node);
      const badgeX = node.x + NODE_RADIUS - 2;
      const badgeY = node.y - NODE_RADIUS + 2;
      const badgeR = 10;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = Math.abs(bf) > 1 ? '#ef4444' : '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText(bf > 0 ? `+${bf}` : `${bf}`, badgeX, badgeY);
    }
  }

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // ── Animation helpers ──────────────────────────────────────────────────────
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const animateSteps = useCallback((steps, finalTree, onDone) => {
    clearTimeouts();
    setAnimating(true);
    let delay = 0;
    const interval = speed;

    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        if (step.type === 'visit') {
          setHighlightedNodes(prev => ({ ...prev, [step.value]: 'visit' }));
          setStatusMsg(`Visiting node ${step.value}...`);
        } else if (step.type === 'found') {
          setHighlightedNodes(prev => ({ ...prev, [step.value]: 'found' }));
          setStatusMsg(step.msg || `Found node ${step.value}!`);
        } else if (step.type === 'notfound') {
          setStatusMsg(`Value ${step.value} not found in the tree.`);
        } else if (step.type === 'insert') {
          setStatusMsg(`Inserted ${step.value}.`);
        } else if (step.type === 'delete') {
          setHighlightedNodes(prev => ({ ...prev, [step.value]: 'delete' }));
          setStatusMsg(`Deleting node ${step.value}...`);
        } else if (step.type === 'successor') {
          setHighlightedNodes(prev => ({ ...prev, [step.value]: 'successor' }));
          setStatusMsg(`In-order successor: ${step.value}`);
        } else if (step.type === 'rotate') {
          setHighlightedNodes(prev => ({ ...prev, [step.value]: 'rotate' }));
          setStatusMsg(`Rotating at node ${step.value} (BF=${step.bf > 0 ? '+' : ''}${step.bf})`);
        } else if (step.type === 'traversal') {
          setHighlightedNodes(prev => ({ ...prev, [step.value]: 'traversal' }));
          setStatusMsg(`Traversal visiting: ${step.value}`);
          setTraversalResult(prev => prev ? prev + ', ' + step.value : String(step.value));
        }
      }, delay);
      timeoutsRef.current.push(t);
      delay += interval;
    });

    // Finalize
    const fin = setTimeout(() => {
      setHighlightedNodes({});
      if (finalTree !== undefined) {
        setTree(finalTree);
      }
      setAnimating(false);
      if (onDone) onDone();
    }, delay + interval);
    timeoutsRef.current.push(fin);
  }, [speed, clearTimeouts]);

  // ── Operations ─────────────────────────────────────────────────────────────
  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) { setStatusMsg('Please enter a valid integer.'); return; }
    if (animating) return;
    const cloned = cloneTree(tree);
    const { root: newRoot, steps } = bstInsert(cloned, val, avlMode);
    setInputValue('');
    animateSteps(steps, newRoot, () => {
      setStatusMsg(`Inserted ${val}. Tree has ${countNodes(newRoot)} nodes.`);
    });
  }, [inputValue, tree, avlMode, animating, animateSteps]);

  const handleSearch = useCallback(() => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) { setStatusMsg('Please enter a valid integer.'); return; }
    if (animating) return;
    const { found, steps } = bstSearch(tree, val);
    setInputValue('');
    animateSteps(steps, undefined, () => {
      setStatusMsg(found ? `Value ${val} found in the tree.` : `Value ${val} not found.`);
    });
  }, [inputValue, tree, animating, animateSteps]);

  const handleDelete = useCallback(() => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) { setStatusMsg('Please enter a valid integer.'); return; }
    if (animating) return;
    const cloned = cloneTree(tree);
    const { root: newRoot, steps } = bstDelete(cloned, val, avlMode);
    setInputValue('');
    animateSteps(steps, newRoot, () => {
      setStatusMsg(`Deleted ${val}. Tree has ${countNodes(newRoot)} nodes.`);
    });
  }, [inputValue, tree, avlMode, animating, animateSteps]);

  const handleTraversal = useCallback((type) => {
    if (animating || !tree) return;
    let order;
    let label;
    if (type === 'inorder') { order = inOrder(tree); label = 'In-Order'; }
    else if (type === 'preorder') { order = preOrder(tree); label = 'Pre-Order'; }
    else { order = postOrder(tree); label = 'Post-Order'; }
    setTraversalResult('');
    const steps = order.map(v => ({ type: 'traversal', value: v }));
    setStatusMsg(`Running ${label} traversal...`);
    animateSteps(steps, undefined, () => {
      setStatusMsg(`${label} traversal complete.`);
    });
  }, [tree, animating, animateSteps]);

  const handleRandomInsert = useCallback(() => {
    if (animating) return;
    const val = Math.floor(Math.random() * 95) + 5;
    setInputValue(String(val));
    // Trigger insert after a tick so inputValue is set
    setTimeout(() => {
      const cloned = cloneTree(tree);
      const { root: newRoot, steps } = bstInsert(cloned, val, avlMode);
      setInputValue('');
      animateSteps(steps, newRoot, () => {
        setStatusMsg(`Inserted random value ${val}. Tree has ${countNodes(newRoot)} nodes.`);
      });
    }, 0);
  }, [tree, avlMode, animating, animateSteps]);

  const handleClear = useCallback(() => {
    if (animating) return;
    clearTimeouts();
    setTree(null);
    setHighlightedNodes({});
    setTraversalResult('');
    setSelectedNode(null);
    setStatusMsg('Tree cleared.');
  }, [animating, clearTimeouts]);

  const handlePreset = useCallback((type) => {
    if (animating) return;
    clearTimeouts();
    setHighlightedNodes({});
    setTraversalResult('');
    setSelectedNode(null);
    let root;
    if (type === 'balanced') root = buildBalancedPreset();
    else if (type === 'skewed') root = buildSkewedPreset();
    else root = buildRandomPreset();
    if (avlMode) {
      // Rebuild in AVL mode
      const vals = inOrder(root);
      root = null;
      for (const v of vals) root = bstInsert(root, v, true).root;
    }
    setTree(root);
    setStatusMsg(`Loaded ${type} tree preset (${countNodes(root)} nodes).`);
  }, [avlMode, animating, clearTimeouts]);

  // Canvas click – select node
  const handleCanvasClick = useCallback((e) => {
    if (!tree) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    function findClicked(node) {
      if (!node) return null;
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) return node;
      return findClicked(node.left) || findClicked(node.right);
    }
    const clicked = findClicked(tree);
    if (clicked) {
      setSelectedNode(clicked.value);
    } else {
      setSelectedNode(null);
    }
  }, [tree]);

  // Key handler – Enter to insert
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleInsert();
  }, [handleInsert]);

  // Selected node info
  const getSelectedInfo = useCallback(() => {
    if (selectedNode === null || !tree) return null;
    function find(node) {
      if (!node) return null;
      if (node.value === selectedNode) return node;
      return find(node.left) || find(node.right);
    }
    const node = find(tree);
    if (!node) return null;
    return {
      value: node.value,
      height: nodeHeight(node),
      bf: balanceFactor(node),
      hasLeft: !!node.left,
      hasRight: !!node.right,
      leftVal: node.left ? node.left.value : '-',
      rightVal: node.right ? node.right.value : '-',
    };
  }, [selectedNode, tree]);

  const info = getSelectedInfo();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Control bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Input + Operation buttons */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Value"
              disabled={animating}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
            <button
              onClick={handleInsert}
              disabled={animating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Insert
            </button>
            <button
              onClick={handleSearch}
              disabled={animating || !tree}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
            <button
              onClick={handleDelete}
              disabled={animating || !tree}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden sm:block" />

          {/* Traversal buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTraversal('inorder')}
              disabled={animating || !tree}
              className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              In-Order
            </button>
            <button
              onClick={() => handleTraversal('preorder')}
              disabled={animating || !tree}
              className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              Pre-Order
            </button>
            <button
              onClick={() => handleTraversal('postorder')}
              disabled={animating || !tree}
              className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              Post-Order
            </button>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden sm:block" />

          {/* Utility buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomInsert}
              disabled={animating}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Random
            </button>
            <button
              onClick={handleClear}
              disabled={animating}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Second row: presets, AVL toggle, speed */}
        <div className="flex flex-wrap gap-3 items-center mt-3 pt-3 border-t border-gray-100">
          {/* Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Presets:</span>
            <button
              onClick={() => handlePreset('balanced')}
              disabled={animating}
              className="px-3 py-1.5 bg-sky-100 text-sky-800 rounded-md text-xs font-medium hover:bg-sky-200 disabled:opacity-50 transition-colors"
            >
              Balanced
            </button>
            <button
              onClick={() => handlePreset('skewed')}
              disabled={animating}
              className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-xs font-medium hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              Skewed
            </button>
            <button
              onClick={() => handlePreset('random')}
              disabled={animating}
              className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium hover:bg-emerald-200 disabled:opacity-50 transition-colors"
            >
              Random
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 hidden sm:block" />

          {/* AVL toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-gray-600 font-medium">AVL Mode</span>
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${avlMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
              onClick={() => { if (!animating) setAvlMode(p => !p); }}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${avlMode ? 'translate-x-5' : ''}`}
              />
            </div>
          </label>

          <div className="h-6 w-px bg-gray-300 hidden sm:block" />

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Speed:</span>
            <input
              type="range"
              min={100}
              max={1500}
              step={100}
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - Number(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs text-gray-500 w-12">{speed}ms</span>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2 mb-2 border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{statusMsg}</p>
        {tree && (
          <span className="text-xs text-gray-400">
            Nodes: {countNodes(tree)} | Height: {nodeHeight(tree)}
          </span>
        )}
      </div>

      {/* Traversal result */}
      {traversalResult && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-2 mb-2 text-sm text-violet-800">
          <span className="font-semibold">Traversal:</span> [{traversalResult}]
        </div>
      )}

      {/* Canvas and info panel */}
      <div className="flex gap-4 flex-col lg:flex-row" ref={containerRef}>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: canvasSize.h }}
            onClick={handleCanvasClick}
            className="cursor-pointer"
          />
        </div>

        {/* Node info panel */}
        {info && (
          <div className="w-full lg:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 self-start">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Node Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Value</span>
                <span className="font-bold text-indigo-700">{info.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Height</span>
                <span className="font-medium">{info.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance Factor</span>
                <span className={`font-medium ${Math.abs(info.bf) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                  {info.bf > 0 ? '+' : ''}{info.bf}
                </span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between">
                <span className="text-gray-500">Left Child</span>
                <span className="font-medium">{info.leftVal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Right Child</span>
                <span className="font-medium">{info.rightVal}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.highlight }} /> Visiting</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.found }} /> Found</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.delete }} /> Deleting</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.successor }} /> Successor</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.rotate }} /> Rotating</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.traversal }} /> Traversal</span>
      </div>
    </div>
  );
};

export default BinarySearchTreeVisualizer;
