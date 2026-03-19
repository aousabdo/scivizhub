import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import PredatorPreyVisualizer from '../../components/Visualizations/PredatorPrey/PredatorPreyVisualizer';

const PredatorPreyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Predator-Prey Ecosystem</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The <strong>Lotka-Volterra equations</strong> are one of the earliest and most influential mathematical models
          in ecology. They describe the dynamics of two interacting species: a prey population that grows in the absence
          of predators, and a predator population that depends on prey for survival. The result is a fascinating system of
          coupled oscillations where predator and prey populations rise and fall in a perpetual, out-of-phase cycle.
        </p>
        <p>
          This simulator uses an <strong>agent-based approach</strong> to bring these dynamics to life. Individual prey
          (rabbits) move, reproduce, and try to avoid predators, while predators (wolves) hunt nearby prey, gain energy
          from successful kills, reproduce when well-fed, and die when they starve. The emergent population-level behavior
          closely mirrors the classic Lotka-Volterra oscillating curves, giving you an intuitive, bottom-up understanding
          of how individual interactions produce ecosystem-scale patterns.
        </p>
      </div>

      <PredatorPreyVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Predator-Prey Dynamics</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The Lotka-Volterra Equations</h3>
            <p>
              The classical predator-prey model is described by two coupled ordinary differential equations that
              govern the growth and decline of each population:
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <BlockMath>{"\\frac{dx}{dt} = \\alpha x - \\beta x y"}</BlockMath>
              <BlockMath>{"\\frac{dy}{dt} = \\delta x y - \\gamma y"}</BlockMath>
            </div>
            <p className="mt-3">
              Here, <InlineMath>{"x"}</InlineMath> is the prey population and <InlineMath>{"y"}</InlineMath> is the predator population.
              The parameter <InlineMath>{"\\alpha"}</InlineMath> is the prey birth rate, <InlineMath>{"\\beta"}</InlineMath> is the predation rate,
              <InlineMath>{"\\delta"}</InlineMath> is the rate at which predators convert consumed prey into new predators, and
              <InlineMath>{"\\gamma"}</InlineMath> is the predator death rate. The key insight is that both equations involve the
              product <InlineMath>{"xy"}</InlineMath>, representing encounters between the two species.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Population Oscillations</h3>
            <p>
              The Lotka-Volterra model produces characteristic oscillating cycles with a consistent phase relationship:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Prey increase:</strong> When predators are scarce, prey reproduce freely and their population
                grows rapidly.
              </li>
              <li>
                <strong>Predator increase:</strong> Abundant prey provides ample food, allowing predators to thrive and
                multiply. The predator peak lags behind the prey peak.
              </li>
              <li>
                <strong>Prey decline:</strong> As predators become numerous, they consume prey faster than prey can
                reproduce, causing the prey population to crash.
              </li>
              <li>
                <strong>Predator decline:</strong> With prey scarce, predators starve and their numbers fall, completing
                the cycle and allowing prey to recover again.
              </li>
            </ul>
            <p className="mt-3">
              In the phase portrait (predator count vs. prey count), these oscillations appear as closed orbits
              circling a fixed equilibrium point, which is a hallmark of the Lotka-Volterra system.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Ecological Balance and Trophic Cascades</h3>
            <p>
              Predator-prey dynamics are central to understanding <strong>trophic cascades</strong>, where changes at
              one level of a food chain ripple through the entire ecosystem:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Top-down control:</strong> Predators regulate prey populations, which in turn affects vegetation.
                Removing apex predators can trigger overgrazing and habitat degradation.
              </li>
              <li>
                <strong>Bottom-up effects:</strong> Changes in prey abundance (due to resource availability) propagate
                upward to affect predator populations. A poor growing season for plants can reduce herbivore numbers,
                eventually causing predator decline.
              </li>
              <li>
                <strong>Keystone species:</strong> Some predators have disproportionate effects on ecosystem structure.
                Their removal can lead to dramatic shifts in species composition and biodiversity loss.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Real-World Examples</h3>
            <p>
              Predator-prey oscillations have been documented across many ecosystems:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Wolves and Elk in Yellowstone:</strong> The reintroduction of wolves to Yellowstone National
                Park in 1995 is one of the most celebrated examples of a trophic cascade. Wolf predation reduced
                elk numbers and changed their grazing behavior, allowing willow and aspen to recover along riverbanks,
                which in turn stabilized stream banks and increased beaver populations.
              </li>
              <li>
                <strong>Canadian Lynx and Snowshoe Hare:</strong> Hudson Bay Company fur trading records spanning over
                200 years reveal remarkably regular 9-11 year cycles in lynx and hare populations, closely matching
                Lotka-Volterra predictions.
              </li>
              <li>
                <strong>Phytoplankton and Zooplankton:</strong> In marine and freshwater systems, microscopic predator-prey
                dynamics drive seasonal plankton blooms that form the base of aquatic food webs.
              </li>
            </ul>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-3">History: Lotka and Volterra</h3>
            <p>
              The predator-prey model was developed independently by two scientists in the 1920s:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Alfred J. Lotka (1925):</strong> An American mathematician, chemist, and statistician who derived
                the equations as part of his broader work on physical biology and autocatalytic chemical reactions. His
                book <em>Elements of Physical Biology</em> presented the model as a general framework for interacting
                populations.
              </li>
              <li>
                <strong>Vito Volterra (1926):</strong> An Italian mathematician who independently developed the same
                equations after his son-in-law, marine biologist Umberto D'Ancona, observed puzzling fluctuations in
                fish catches in the Adriatic Sea during and after World War I. The reduction in fishing during the war
                had allowed predator fish populations to grow, which suppressed prey fish populations.
              </li>
            </ul>
            <p className="mt-3">
              Their combined work laid the foundation for mathematical ecology and remains a cornerstone of theoretical
              biology courses worldwide. Modern extensions include spatial dynamics, multiple species food webs, stochastic
              effects, and evolutionary game theory.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Exploring the Simulator</h2>
          <p>
            Use the preset scenarios to see different ecological outcomes. "Stable Oscillation" produces the classic
            Lotka-Volterra cycles. "Predator Extinction" shows what happens when predators cannot sustain themselves.
            "Prey Explosion" demonstrates unchecked growth when predation pressure is weak. Toggle on the Phase Portrait
            to see the characteristic orbital trajectories. Adjust individual parameters to build intuition about which
            factors tip the balance between coexistence and extinction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredatorPreyPage;
