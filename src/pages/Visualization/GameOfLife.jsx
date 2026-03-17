import React from 'react';
import GameOfLifeVisualizer from '../../components/Visualizations/GameOfLife/GameOfLifeVisualizer';

const GameOfLifePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Conway's Game of Life</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Conway's Game of Life is a cellular automaton devised by mathematician John Horton Conway in 1970.
          Despite its deceptively simple rules, the Game of Life produces extraordinarily complex and beautiful
          patterns, demonstrating how complexity can emerge from simplicity.
        </p>
        <p>
          Click or drag on the grid to create living cells, load a preset pattern, then press Play to watch
          the simulation unfold. Observe how simple initial configurations evolve into intricate structures,
          self-replicating machines, and endlessly shifting patterns.
        </p>
      </div>

      <GameOfLifeVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding the Game of Life</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The Rules of Life</h3>
            <p>
              The Game of Life operates on a two-dimensional grid of cells, each of which is either alive or dead.
              Every cell interacts with its eight neighbors (horizontally, vertically, and diagonally adjacent cells).
              At each step in time, the following transitions occur simultaneously:
            </p>
            <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">Birth</h4>
                <p className="text-sm">
                  A dead cell with exactly <strong>3</strong> live neighbors becomes a live cell, as if by reproduction.
                  This is the only way new cells are born.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">Survival</h4>
                <p className="text-sm">
                  A live cell with <strong>2 or 3</strong> live neighbors survives to the next generation.
                  The cell has just enough support from its community to thrive.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">Underpopulation</h4>
                <p className="text-sm">
                  A live cell with <strong>fewer than 2</strong> live neighbors dies, as if by isolation.
                  Without enough neighbors, the cell cannot sustain itself.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">Overpopulation</h4>
                <p className="text-sm">
                  A live cell with <strong>more than 3</strong> live neighbors dies, as if by overcrowding.
                  Too many neighbors compete for limited resources.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Pattern Categories</h3>
            <p>
              Over decades of exploration, Life enthusiasts have cataloged thousands of patterns, organized into key categories:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Still Lifes:</strong> Stable patterns that do not change from one generation to the next.
                Examples include the Block (2x2 square), Beehive, Loaf, and Boat.
              </li>
              <li>
                <strong>Oscillators:</strong> Patterns that return to their initial state after a fixed number of
                generations (the period). The Blinker (period 2) and Pulsar (period 3) are classic examples.
              </li>
              <li>
                <strong>Spaceships:</strong> Patterns that translate themselves across the grid. The Glider, discovered
                by Richard Guy in 1970, moves diagonally every 4 generations. The Lightweight Spaceship (LWSS) moves horizontally.
              </li>
              <li>
                <strong>Methuselahs:</strong> Small patterns that take a very long time to stabilize. The R-pentomino,
                just 5 cells, takes 1,103 generations to settle into a stable configuration of 116 cells.
              </li>
              <li>
                <strong>Guns:</strong> Patterns that periodically emit spaceships. The Gosper Glider Gun, discovered in
                1970 by Bill Gosper, was the first known finite pattern with unbounded growth.
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Cellular Automata and Emergence</h3>
            <p>
              The Game of Life is the most famous example of a cellular automaton -- a discrete model studied in
              mathematics, physics, and theoretical computer science. Cellular automata consist of a grid of cells,
              each in one of a finite number of states, with rules governing state transitions based on neighbor states.
            </p>
            <p className="mt-3">
              What makes Life remarkable is the phenomenon of <strong>emergence</strong>: complex, unpredictable behavior
              arising from extremely simple rules. No individual cell "knows" about gliders, guns, or any higher-level
              structure, yet these structures reliably emerge from the mechanical application of four basic rules.
            </p>
            <p className="mt-3">
              This connects to deep questions in philosophy of mind, biology, and physics: Can consciousness emerge from
              simple neural rules? Can the complexity of life emerge from simple chemistry? The Game of Life suggests that
              the answer may well be yes.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Turing Completeness</h3>
            <p>
              One of the most profound discoveries about the Game of Life is that it is <strong>Turing complete</strong>.
              This means that, in principle, any computation that can be performed by a computer can also be carried
              out within the Game of Life, given a large enough grid and appropriate initial configuration.
            </p>
            <p className="mt-3">
              Researchers have constructed working logic gates (AND, OR, NOT), memory registers, clocks, and even
              entire programmable computers within Life. Gliders serve as signals, guns as signal generators, and
              carefully arranged still lifes and oscillators as circuit components.
            </p>
            <p className="mt-3">
              This has a striking implication: the question of whether a given initial pattern will eventually die out
              is undecidable -- there is no algorithm that can always correctly predict the fate of an arbitrary pattern.
              This connects the Game of Life to fundamental results in mathematical logic, including Godel's
              incompleteness theorems and the halting problem.
            </p>
          </div>

          <div className="bg-rose-50 p-6 rounded-lg border border-rose-200">
            <h3 className="text-xl font-bold text-rose-800 mb-3">History and Legacy</h3>
            <p>
              John Conway first described the Game of Life in 1970, and it was popularized by Martin Gardner's
              "Mathematical Games" column in Scientific American. Conway spent years fine-tuning the rules,
              seeking a set that would produce behavior that was neither too chaotic nor too predictable.
            </p>
            <p className="mt-3">
              The Game of Life became one of the first viral phenomena of the computer age. In the early days of
              computing, it consumed significant amounts of computer time at research institutions worldwide.
              It inspired generations of programmers, mathematicians, and artists, and helped establish the field
              of artificial life.
            </p>
            <p className="mt-3 text-sm italic">
              "The game made Conway instantly famous, but it also opened up a whole new field of mathematical
              research, the field of cellular automata." -- Martin Gardner
            </p>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Life is a game which, in some extraordinary way, manages to be alive itself."
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameOfLifePage;
