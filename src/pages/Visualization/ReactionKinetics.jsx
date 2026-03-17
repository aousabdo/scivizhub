import React from 'react';
import ReactionKineticsVisualizer from '../../components/Visualizations/ReactionKinetics/ReactionKineticsVisualizer';

const ReactionKineticsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Chemical Reaction Kinetics Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Chemical kinetics is the study of reaction rates -- how fast reactants are consumed and products are formed.
          Understanding kinetics is essential for controlling chemical processes, from industrial manufacturing to
          biological systems inside living cells.
        </p>
        <p>
          This interactive simulator lets you explore how temperature, activation energy, concentration, volume, and
          catalysts affect the speed and outcome of chemical reactions. Watch particles collide, react, and reach
          equilibrium in real time while monitoring concentration curves.
        </p>
      </div>

      <ReactionKineticsVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Key Concepts in Chemical Kinetics</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Arrhenius Equation and Temperature Dependence</h3>
            <p>
              The Arrhenius equation, <em>k = A e<sup>-Ea/RT</sup></em>, describes how the rate constant <em>k</em>
              depends on temperature <em>T</em>, activation energy <em>Ea</em>, and the pre-exponential factor <em>A</em>.
              As temperature increases, a larger fraction of molecular collisions possess enough energy to overcome the
              activation barrier, dramatically increasing the reaction rate. A common rule of thumb is that a 10 K rise
              in temperature roughly doubles the rate for many reactions.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Chemical Equilibrium and Le Chatelier&apos;s Principle</h3>
            <p>
              In reversible reactions, the system eventually reaches a dynamic equilibrium where the forward and reverse
              reaction rates are equal, and the concentrations of reactants and products remain constant. The equilibrium
              constant <em>K = [C][D] / [A][B]</em> quantifies the ratio at equilibrium.
            </p>
            <p className="mt-2">
              Le Chatelier&apos;s principle states that if an external stress is applied to a system at equilibrium --
              such as changing temperature, pressure, or concentration -- the system will shift to partially counteract
              the change. In this simulator, try adjusting temperature or volume mid-reaction to observe the shift
              in real time.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Collision Theory</h3>
            <p>
              Collision theory explains that chemical reactions occur when reactant molecules collide with sufficient
              energy (exceeding the activation energy) and with proper orientation. The rate of reaction depends on the
              frequency of effective collisions, which is why higher concentrations, higher temperatures, and smaller
              volumes all tend to increase the reaction rate. In the particle simulation above, you can directly observe
              how these factors influence the frequency of successful collisions.
            </p>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-xl font-bold text-orange-800 mb-3">Catalysis and Activation Energy</h3>
            <p>
              A catalyst speeds up a reaction by providing an alternative reaction pathway with a lower activation
              energy. Crucially, catalysts are not consumed in the process and do not change the equilibrium position --
              they simply help the system reach equilibrium faster. The energy diagram in the simulator illustrates
              how a catalyst lowers the energy barrier while leaving the overall energy change of the reaction unchanged.
            </p>
            <p className="mt-2">
              Enzymes are biological catalysts that can accelerate reactions by factors of millions. Industrial
              catalysts like platinum, palladium, and zeolites are used extensively in petroleum refining, automotive
              catalytic converters, and chemical manufacturing.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Real-World Applications</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Industrial Chemistry:</strong> Optimizing reaction conditions (temperature, pressure, catalysts)
              to maximize yield in processes like the Haber process for ammonia synthesis and the Contact process for
              sulfuric acid production.
            </li>
            <li>
              <strong>Biochemistry:</strong> Enzyme kinetics (Michaelis-Menten model) governs metabolic pathways.
              Drug design relies on understanding how molecules interact with enzyme active sites.
            </li>
            <li>
              <strong>Environmental Science:</strong> Atmospheric chemistry kinetics determine ozone layer dynamics
              and the rates of pollutant degradation.
            </li>
            <li>
              <strong>Materials Science:</strong> Reaction rates control polymer curing, corrosion processes, and
              semiconductor fabrication.
            </li>
            <li>
              <strong>Food Science:</strong> Understanding spoilage kinetics and the Maillard reaction helps preserve
              food and develop flavor profiles.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReactionKineticsPage;
