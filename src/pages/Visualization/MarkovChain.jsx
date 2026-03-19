import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import MarkovChainVisualizer from '../../components/Visualizations/MarkovChain/MarkovChainVisualizer';

const MarkovChainPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Markov Chain Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          A Markov chain is a mathematical model that describes a system transitioning between a finite set
          of states, where the probability of moving to the next state depends <strong>only on the current
          state</strong> -- not on the history of how you got there. This "memoryless" property makes Markov
          chains both elegant and surprisingly powerful for modeling real-world phenomena ranging from weather
          patterns to web page navigation.
        </p>
        <p>
          This interactive simulator lets you explore Markov chains visually. Watch the system evolve step
          by step, observe how visit frequencies converge to the theoretical steady-state distribution, and
          experiment with different transition matrices to build intuition about stochastic processes.
        </p>
      </div>

      <MarkovChainVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Markov Chains</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">What Is a Markov Chain?</h3>
            <p>
              A Markov chain consists of a set of <strong>states</strong> and a <strong>transition
              matrix</strong> P, where each entry P(i, j) gives the probability of moving from state i
              to state j. The defining characteristic is the <strong>Markov property</strong> (also called
              memorylessness): the future state depends only on the present state, not on the sequence of
              events that preceded it.
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <BlockMath>{"P(X_{n+1} = j \\mid X_n = i,\\, X_{n-1},\\, \\ldots,\\, X_0) = P(X_{n+1} = j \\mid X_n = i) = P_{ij}"}</BlockMath>
            </div>
            <p className="mt-3">
              The transition matrix is <strong>row-stochastic</strong>: every row sums to 1, because from
              any given state the system must go somewhere (including possibly staying in the same state).
              Try the Weather preset to see a simple two-state chain where sunny and rainy days transition
              according to fixed probabilities.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Steady-State Distribution</h3>
            <p>
              One of the most remarkable properties of many Markov chains is that they converge to a
              <strong> steady-state (stationary) distribution</strong> regardless of the starting state.
              This is a probability vector <InlineMath>{"\\boldsymbol{\\pi}"}</InlineMath> satisfying <InlineMath>{"\\boldsymbol{\\pi} = \\boldsymbol{\\pi} P"}</InlineMath>, meaning the distribution
              no longer changes after a transition step.
            </p>
            <p className="mt-3">
              The <strong>Ergodic Theorem</strong> guarantees that for irreducible and aperiodic chains, the
              long-run fraction of time spent in each state converges to the unique steady-state distribution.
              Enable the "Steady State" checkbox and run the simulator for many steps -- you will see the
              observed visit frequencies approach the theoretical values.
            </p>
            <p className="mt-3">
              Not all chains have a unique steady state. Chains with <strong>periodic</strong> behavior (the
              system returns to a state only at regular intervals) or <strong>reducible</strong> chains
              (disconnected groups of states) may have multiple stationary distributions or no convergence
              at all.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Absorbing States and Classification</h3>
            <p>
              States in a Markov chain can be classified based on their long-term behavior:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Absorbing states</strong> are states that, once entered, can never be left (self-transition
                probability is 1). In the Gambler's Ruin preset, states $0 and $4 are absorbing -- once
                the gambler goes broke or reaches the target, the game is over.
              </li>
              <li>
                <strong>Transient states</strong> are states that the chain will eventually leave permanently.
                In an absorbing chain, all non-absorbing states are transient.
              </li>
              <li>
                <strong>Recurrent states</strong> are states that the chain returns to infinitely often. In
                an irreducible chain (where every state can reach every other), all states are recurrent.
              </li>
              <li>
                <strong>Communicating classes</strong> are maximal sets of states that can reach each other.
                A chain is irreducible if there is only one communicating class.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">The PageRank Algorithm</h3>
            <p>
              Google's original PageRank algorithm models web browsing as a Markov chain. Each web page is a
              state, and the transition probabilities are determined by the hyperlinks: if a page has k
              outgoing links, each link contributes a 1/k probability of being followed. The <strong>steady-state
              distribution</strong> of this chain gives the PageRank score of each page -- pages that are
              linked to by many important pages will be visited more often by a random surfer and thus rank
              higher.
            </p>
            <p className="mt-3">
              In practice, Google adds a <strong>damping factor</strong> (typically 0.85): at each step, the
              surfer follows a link with probability 0.85 and jumps to a completely random page with
              probability 0.15. This ensures the chain is irreducible and aperiodic, guaranteeing convergence
              to a unique steady state. Try the Page Rank preset and watch which pages accumulate the most
              visits over time.
            </p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-3">Applications Across Fields</h3>
            <p>
              Markov chains appear throughout science, engineering, and everyday life:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Weather Modeling:</strong> Simple weather models treat each day's weather as a state
                that depends only on the previous day. While real weather is far more complex, Markov models
                capture essential persistence patterns and are used for agricultural planning and climate studies.
              </li>
              <li>
                <strong>Genetics and Biology:</strong> DNA sequences, protein folding, and population genetics
                all use Markov models. Hidden Markov Models (HMMs) are used extensively in gene finding and
                sequence alignment.
              </li>
              <li>
                <strong>Queuing Theory:</strong> Customer arrival and service processes in banks, call centers,
                and computer networks are modeled as Markov chains, enabling optimal staffing and resource
                allocation.
              </li>
              <li>
                <strong>Natural Language Processing:</strong> Text generation, speech recognition, and
                autocomplete systems use Markov chains to predict the next word based on recent context.
                N-gram language models are essentially higher-order Markov chains.
              </li>
              <li>
                <strong>Finance:</strong> Credit rating migrations, stock market regime switching, and
                option pricing models use Markov chains to capture transitions between economic states.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Exploring the Simulator</h2>
          <p>
            Select a preset to load a classic Markov chain scenario, or enable matrix editing to create your
            own. Click any state in the diagram to set it as the starting state. Use the Step button to
            advance one transition at a time and watch the animated particle travel along the arrow, or press
            Play to let the chain run continuously. Toggle Steady State to compare the theoretical long-run
            distribution against your observed visit frequencies and watch them converge over hundreds of steps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarkovChainPage;
