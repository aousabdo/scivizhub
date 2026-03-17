import React from 'react';
import BinarySearchTreeVisualizer from '../../components/Visualizations/BinarySearchTree/BinarySearchTreeVisualizer';

const BinarySearchTreePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Binary Search Tree Visualizer</h1>

      <div className="prose max-w-6xl mx-auto mb-8">
        <p>
          A Binary Search Tree (BST) is a fundamental data structure in computer science that maintains sorted data
          in a hierarchical tree format. Each node has at most two children, with the left child holding a smaller
          value and the right child holding a larger value. This property enables efficient searching, insertion,
          and deletion operations.
        </p>
        <p>
          This interactive visualization lets you build and manipulate BSTs step by step. Watch how nodes are inserted,
          searched, and deleted with animated highlights showing the traversal path. Toggle AVL mode to see how
          self-balancing trees maintain optimal height through rotations, ensuring O(log n) performance for all operations.
        </p>
      </div>

      <BinarySearchTreeVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Binary Search Trees</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The BST Property</h3>
            <p>
              The defining characteristic of a Binary Search Tree is its ordering invariant:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Left Subtree:</strong> Every node in the left subtree has a value less than the current node</li>
              <li><strong>Right Subtree:</strong> Every node in the right subtree has a value greater than the current node</li>
              <li><strong>Recursive Property:</strong> Both the left and right subtrees must themselves be valid BSTs</li>
              <li><strong>Uniqueness:</strong> In a standard BST, no two nodes share the same value</li>
            </ul>
            <p className="mt-4">
              This ordering property is what enables the efficient binary search mechanism: at each node, we can
              eliminate half of the remaining candidates by comparing the target value with the current node.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Tree Traversals</h3>
            <p>
              There are three primary ways to visit every node in a BST, each producing a different ordering:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>In-Order (Left, Root, Right):</strong> Visits nodes in ascending sorted order. This is the most commonly used traversal for BSTs and is the basis for sorting with trees.</li>
              <li><strong>Pre-Order (Root, Left, Right):</strong> Visits the root before its subtrees. Useful for creating a copy of the tree or serializing its structure.</li>
              <li><strong>Post-Order (Left, Right, Root):</strong> Visits the root after its subtrees. Useful for safely deleting a tree or evaluating expression trees.</li>
            </ul>
            <p className="mt-4">
              Try running each traversal in the visualization above to see the visit order animated in real time.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">AVL Trees and Balancing</h3>
            <p>
              An AVL tree (named after Adelson-Velsky and Landis) is a self-balancing BST where the heights of the
              left and right subtrees of every node differ by at most one. When an insertion or deletion causes an
              imbalance, rotations are performed to restore balance:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Left Rotation:</strong> Corrects a right-heavy imbalance (right-right case)</li>
              <li><strong>Right Rotation:</strong> Corrects a left-heavy imbalance (left-left case)</li>
              <li><strong>Left-Right Rotation:</strong> First a left rotation on the left child, then a right rotation on the node (left-right case)</li>
              <li><strong>Right-Left Rotation:</strong> First a right rotation on the right child, then a left rotation on the node (right-left case)</li>
            </ul>
            <p className="mt-4">
              Enable AVL mode in the visualizer to see balance factors displayed on each node and watch rotations
              happen automatically after insertions and deletions.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Time Complexity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="p-2 border">Operation</th>
                    <th className="p-2 border">BST (Average)</th>
                    <th className="p-2 border">BST (Worst)</th>
                    <th className="p-2 border">AVL (All Cases)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Search</td>
                    <td className="p-2 border">O(log n)</td>
                    <td className="p-2 border">O(n)</td>
                    <td className="p-2 border">O(log n)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Insert</td>
                    <td className="p-2 border">O(log n)</td>
                    <td className="p-2 border">O(n)</td>
                    <td className="p-2 border">O(log n)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Delete</td>
                    <td className="p-2 border">O(log n)</td>
                    <td className="p-2 border">O(n)</td>
                    <td className="p-2 border">O(log n)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Traversal</td>
                    <td className="p-2 border">O(n)</td>
                    <td className="p-2 border">O(n)</td>
                    <td className="p-2 border">O(n)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              The worst-case O(n) for a plain BST occurs when elements are inserted in sorted order, creating a
              degenerate tree that resembles a linked list. AVL balancing prevents this degradation.
            </p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-3">BST Deletion Cases</h3>
            <p>
              Deleting a node from a BST involves three distinct cases:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Leaf Node:</strong> Simply remove the node from the tree</li>
              <li><strong>One Child:</strong> Replace the node with its single child</li>
              <li><strong>Two Children:</strong> Replace the node with its in-order successor (smallest value in the right subtree) or in-order predecessor (largest value in the left subtree), then delete that successor/predecessor</li>
            </ul>
            <p className="mt-4">
              Try deleting nodes in the visualization to see each case handled with step-by-step animation.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 italic">
            "Binary Search Trees elegantly combine the efficiency of binary search with the flexibility of a linked structure,
            forming the foundation for many advanced data structures like Red-Black Trees, B-Trees, and Splay Trees."
          </p>
        </div>
      </div>
    </div>
  );
};

export default BinarySearchTreePage;
