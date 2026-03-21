import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import DiffusionSimulationVisualizer from '../../components/Visualizations/DiffusionSimulation/DiffusionSimulationVisualizer';

const DiffusionSimulationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Diffusion &amp; Brownian Motion Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Diffusion is the net movement of particles from a region of higher concentration to a region of lower
          concentration, driven entirely by random thermal motion. At the microscopic level, each particle undergoes
          <strong> Brownian motion</strong> -- an erratic, jittery path caused by countless collisions with surrounding
          molecules. Despite the randomness of each individual step, the collective behavior produces the smooth,
          predictable spreading described by Fick's laws.
        </p>
        <p>
          This simulator lets you watch diffusion unfold in real time. Start with particles concentrated in the center
          and observe how they spread outward, or switch to the concentration gradient mode to see particles migrate
          through a semi-permeable membrane. Adjust the temperature to see how thermal energy affects the rate of
          diffusion, and track the mean squared displacement to verify the linear relationship that is the hallmark
          of normal diffusion.
        </p>
      </div>

      <DiffusionSimulationVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Science of Diffusion</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">Brownian Motion: A Brief History</h3>
            <p>
              In 1827, Scottish botanist <strong>Robert Brown</strong> observed that pollen grains suspended in water
              exhibited a ceaseless, irregular motion. For decades, the cause remained a mystery. It was not until
              1905 that <strong>Albert Einstein</strong> published his groundbreaking paper explaining Brownian motion
              as the result of molecular bombardment. Einstein showed that the mean squared displacement of a particle
              grows linearly with time, providing one of the first concrete confirmations that atoms and molecules
              truly exist.
            </p>
            <p className="mt-2">
              The same year, the Polish physicist <strong>Marian Smoluchowski</strong> independently arrived at
              similar conclusions. French physicist <strong>Jean Perrin</strong> later verified Einstein's predictions
              experimentally, earning the 1926 Nobel Prize in Physics for his work on the discontinuous structure
              of matter.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Fick's Laws of Diffusion</h3>
            <p>
              <strong>Fick's First Law</strong> states that the diffusive flux is proportional to the negative
              concentration gradient. In one dimension:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 mt-3">
              <BlockMath>{"J = -D \\frac{dC}{dx}"}</BlockMath>
            </div>
            <p className="mt-3">
              where <strong>J</strong> is the flux (amount of substance per unit area per unit time),
              <strong> D</strong> is the diffusion coefficient, and <strong>dC/dx</strong> is the concentration
              gradient. The negative sign indicates that diffusion occurs from high to low concentration.
            </p>
            <p className="mt-3">
              <strong>Fick's Second Law</strong> describes how the concentration field evolves over time:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 mt-3">
              <BlockMath>{"\\frac{\\partial C}{\\partial t} = D \\frac{\\partial^2 C}{\\partial x^2}"}</BlockMath>
            </div>
            <p className="mt-3">
              This partial differential equation is the <em>diffusion equation</em> (also called the heat equation).
              Its solutions describe the spreading of an initial concentration profile into a Gaussian distribution
              over time -- exactly what you observe in the "Drop of Ink" preset.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">Einstein's Diffusion Relation</h3>
            <p>
              Einstein's key insight was connecting the macroscopic diffusion coefficient <strong>D</strong> to
              microscopic properties of the particle and the surrounding fluid:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 mt-3">
              <BlockMath>{"D = \\frac{k_B T}{6 \\pi \\eta r}"}</BlockMath>
            </div>
            <p className="mt-3">
              Here, <strong>k</strong> is Boltzmann's constant (1.38 x 10^-23 J/K), <strong>T</strong> is the
              absolute temperature, <strong>eta</strong> is the dynamic viscosity of the fluid, and <strong>r</strong> is
              the hydrodynamic radius of the diffusing particle. This equation, known as the
              <strong> Stokes-Einstein relation</strong>, reveals several important facts:
            </p>
            <ul className="mt-2 space-y-1">
              <li>Higher temperature means faster diffusion (more thermal energy)</li>
              <li>Larger particles diffuse more slowly (more drag)</li>
              <li>More viscous media slow diffusion (more resistance)</li>
            </ul>
            <p className="mt-3">
              In two dimensions, the mean squared displacement is related to the diffusion coefficient by:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 mt-3">
              <BlockMath>{"\\langle r^2 \\rangle = 4Dt"}</BlockMath>
            </div>
            <p className="mt-3">
              This linear growth of MSD with time is the signature of <em>normal</em> diffusion. Watch the MSD chart
              in the simulator to see this relationship in action.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Osmosis and Membrane Transport</h3>
            <p>
              When a semi-permeable membrane separates two solutions of different concentrations, solvent molecules
              diffuse through the membrane from the region of lower solute concentration to the region of higher
              solute concentration. This process is called <strong>osmosis</strong>.
            </p>
            <p className="mt-2">
              The <strong>Concentration Gradient</strong> mode in the simulator demonstrates this principle. When you
              open the membrane, particles from the more concentrated chamber begin migrating to the less concentrated
              one. Over time, the system approaches equilibrium, with roughly equal concentrations on both sides.
            </p>
            <p className="mt-2">
              In biological systems, osmosis is critical for maintaining cell volume, nutrient absorption in the
              intestines, and water reabsorption in the kidneys. The osmotic pressure across a membrane is described
              by van't Hoff's equation: <InlineMath>{'\\Pi = iMRT'}</InlineMath>, where <strong>i</strong> is the
              van't Hoff factor, <strong>M</strong> is molar concentration, <strong>R</strong> is the gas constant,
              and <strong>T</strong> is temperature.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg border border-red-200 dark:border-red-700">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">Applications Across Science and Engineering</h3>
            <p>
              Diffusion is a ubiquitous process that appears across virtually every scientific discipline:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Drug Delivery:</strong> Controlled-release medications rely on diffusion to deliver drugs at
                a steady rate. The diffusion coefficient of the drug through the polymer matrix determines the release
                profile. Transdermal patches, biodegradable implants, and nanoparticle carriers all exploit diffusion
                principles.
              </li>
              <li>
                <strong>Semiconductor Fabrication:</strong> Dopant atoms are introduced into silicon wafers through
                diffusion at high temperatures. Precise control of the diffusion profile determines the electrical
                properties of transistors and integrated circuits. Modern chips with features below 10 nm require
                atomic-level diffusion control.
              </li>
              <li>
                <strong>Biology:</strong> Oxygen diffuses from the lungs into blood, neurotransmitters diffuse across
                synaptic clefts in milliseconds, and morphogen gradients established by diffusion guide embryonic
                development. The efficiency of diffusion over short distances (and its inefficiency over long distances)
                explains why cells are small and why organisms need circulatory systems.
              </li>
              <li>
                <strong>Environmental Science:</strong> Pollutant dispersion in groundwater, atmospheric gas mixing,
                and nutrient transport in soil all follow diffusion dynamics. Understanding these processes is critical
                for environmental remediation and climate modeling.
              </li>
              <li>
                <strong>Food Science:</strong> Flavor release, brining, marination, and the drying of foods are all
                diffusion-controlled processes. The rate of salt penetration into meat, for example, follows Fick's
                laws remarkably well.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 my-8">
          <h2 className="text-xl font-bold mb-4">Exploring the Simulator</h2>
          <p>
            Use the <strong>Drop of Ink</strong> preset to watch free diffusion from a central point -- notice how the
            concentration histogram evolves from a sharp peak into a broad Gaussian. Switch to <strong>Osmosis</strong> to
            see particles migrate between chambers once the membrane is opened. The <strong>Hot vs Cold</strong> preset
            demonstrates how temperature dramatically increases the rate of spreading. Watch the MSD chart to confirm
            the linear relationship between displacement and time that characterizes normal diffusion. Adjust the
            temperature slider during a running simulation to see its immediate effect on particle motion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiffusionSimulationPage;
