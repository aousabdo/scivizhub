import React from 'react';
import GeneticAlgorithmVisualizer from '../../components/Visualizations/GeneticAlgorithm/GeneticAlgorithmVisualizer';

const GeneticAlgorithmPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Genetic Algorithm Visualizer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Genetic Algorithms (GAs) are search heuristics inspired by Charles Darwin's theory of natural
          evolution. They use mechanisms such as selection, crossover, and mutation to evolve a population
          of candidate solutions toward an optimal result.
        </p>
        <p>
          In this visualization, a population of dots attempts to navigate from a starting position to a
          target while avoiding obstacles. Each dot carries a "DNA" sequence of velocity vectors that
          determines its path. Over successive generations the population evolves better and better
          routes, demonstrating the core principles of evolutionary computation in real time.
        </p>
      </div>

      <GeneticAlgorithmVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Genetic Algorithms</h2>

        <div className="mt-8 grid gap-8">
          {/* Selection, Crossover, Mutation */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">
              Selection, Crossover &amp; Mutation
            </h3>
            <p>
              Every genetic algorithm relies on three fundamental operators that mirror biological
              evolution:
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <strong>Selection</strong> &mdash; Individuals are chosen to become parents based on
                their fitness. Fitter individuals have a higher probability of being selected, just as
                organisms better adapted to their environment are more likely to reproduce. Common
                methods include roulette-wheel selection, tournament selection, and rank selection.
              </li>
              <li>
                <strong>Crossover (Recombination)</strong> &mdash; Two parent genomes are combined to
                produce offspring. In this visualizer a single-point crossover is used: a random split
                point is chosen, and the child receives genes from one parent before the split and from
                the other after. This allows beneficial traits from both parents to be combined.
              </li>
              <li>
                <strong>Mutation</strong> &mdash; Small random changes are introduced into offspring
                genes. Mutation maintains genetic diversity in the population and prevents premature
                convergence to a local optimum. The mutation rate slider lets you explore the balance
                between exploration (high mutation) and exploitation (low mutation).
              </li>
            </ul>
          </div>

          {/* Fitness Functions */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Fitness Functions</h3>
            <p>
              The fitness function is the heart of any genetic algorithm. It quantitatively evaluates
              how "good" a candidate solution is relative to the problem being solved.
            </p>
            <p className="mt-2">
              In this simulation the fitness function considers three factors:
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                <strong>Distance to target</strong> &mdash; Dots that get closer to the target receive
                exponentially higher fitness scores, using an inverse-square relationship.
              </li>
              <li>
                <strong>Target reached</strong> &mdash; Dots that actually reach the target receive a
                large bonus, with additional reward for reaching it in fewer steps.
              </li>
              <li>
                <strong>Survival penalty</strong> &mdash; Dots that collide with obstacles or walls
                receive reduced fitness, discouraging dangerous paths.
              </li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              Designing good fitness functions is both an art and a science. A poorly designed fitness
              function can lead the algorithm to unexpected or degenerate solutions &mdash; a phenomenon
              sometimes called "reward hacking."
            </p>
          </div>

          {/* Key Parameters */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Key Parameters to Explore</h3>
            <p>
              Use the controls above to experiment with different parameter settings and observe their
              effects:
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="px-4 py-2 text-left">Parameter</th>
                    <th className="px-4 py-2 text-left">Effect of Increasing</th>
                    <th className="px-4 py-2 text-left">Trade-off</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-purple-200">
                    <td className="px-4 py-2 font-medium">Population Size</td>
                    <td className="px-4 py-2">More genetic diversity; better exploration of solution space</td>
                    <td className="px-4 py-2">Slower computation per generation</td>
                  </tr>
                  <tr className="border-t border-purple-200">
                    <td className="px-4 py-2 font-medium">Mutation Rate</td>
                    <td className="px-4 py-2">More exploration; escapes local optima</td>
                    <td className="px-4 py-2">Too high destroys good solutions; too low causes stagnation</td>
                  </tr>
                  <tr className="border-t border-purple-200">
                    <td className="px-4 py-2 font-medium">Speed</td>
                    <td className="px-4 py-2">Faster simulation (more physics steps per frame)</td>
                    <td className="px-4 py-2">Harder to observe individual dot behavior</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Real-World Applications</h3>
            <p>
              Genetic algorithms have been successfully applied across a remarkable range of fields:
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <strong>Engineering Optimization</strong> &mdash; Designing antenna shapes, turbine
                blades, and structural components. NASA famously used a GA to evolve an antenna design
                for the ST5 spacecraft that outperformed human-designed alternatives.
              </li>
              <li>
                <strong>Machine Learning</strong> &mdash; Neuroevolution uses GAs to evolve neural
                network architectures and weights. The NEAT algorithm (NeuroEvolution of Augmenting
                Topologies) evolves both the structure and parameters of neural networks.
              </li>
              <li>
                <strong>Scheduling &amp; Logistics</strong> &mdash; Optimizing vehicle routing, job-shop
                scheduling, airline crew assignments, and university timetabling problems.
              </li>
              <li>
                <strong>Drug Design</strong> &mdash; Evolving molecular structures to bind to target
                proteins, accelerating pharmaceutical research.
              </li>
              <li>
                <strong>Game AI &amp; Creative Design</strong> &mdash; Procedural content generation in
                video games, evolving virtual creatures, and automated graphic design.
              </li>
            </ul>
          </div>

          {/* Historical Context */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Historical Context</h3>
            <p>
              The idea of using evolutionary principles for computation dates back to the 1950s and 1960s,
              but the field was truly established by <strong>John Holland</strong> at the University of
              Michigan. His 1975 book <em>Adaptation in Natural and Artificial Systems</em> laid the
              mathematical foundations for genetic algorithms, introducing the concept of schemata and
              the Schema Theorem that explains why GAs work.
            </p>
            <p className="mt-2">
              Holland's student <strong>David Goldberg</strong> popularized GAs with his 1989 book
              <em> Genetic Algorithms in Search, Optimization, and Machine Learning</em>, which made the
              techniques accessible to a broad engineering audience.
            </p>
            <p className="mt-2">
              Parallel developments include <strong>evolutionary strategies</strong> (Rechenberg and
              Schwefel in Germany, 1960s), <strong>evolutionary programming</strong> (Fogel, 1960s), and
              <strong> genetic programming</strong> (Koza, 1990s). Together these form the broader field
              of <em>evolutionary computation</em>, which remains an active area of research and is
              increasingly integrated with deep learning approaches.
            </p>
          </div>

          {/* How this visualizer works */}
          <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
            <h3 className="text-xl font-bold text-cyan-800 mb-3">How This Visualizer Works</h3>
            <ol className="mt-3 space-y-2 list-decimal list-inside">
              <li>
                A population of dots is created at the <strong>start position</strong>. Each dot has a
                DNA sequence of 300 velocity vectors that control its movement.
              </li>
              <li>
                Each generation, every dot follows its DNA instructions for 300 time steps, moving
                through the canvas while potentially colliding with obstacles or walls.
              </li>
              <li>
                After all steps are complete, each dot is assigned a fitness score based on how close it
                got to the target (or whether it reached it and how quickly).
              </li>
              <li>
                A <strong>mating pool</strong> is constructed where fitter dots appear more frequently.
                Parents are randomly selected from this pool to produce the next generation via crossover
                and mutation.
              </li>
              <li>
                The cycle repeats. Over many generations, the population evolves increasingly effective
                paths toward the target, navigating around obstacles.
              </li>
            </ol>
            <p className="mt-3 text-sm text-gray-600">
              Watch the fitness chart to see the population improve over time. The dots' colors indicate
              their relative fitness: red dots are performing poorly, while green dots have high fitness.
              Gray dots have collided with an obstacle or wall and are no longer moving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneticAlgorithmPage;
