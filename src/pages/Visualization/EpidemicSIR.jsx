import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import EpidemicSIRVisualizer from '../../components/Visualizations/EpidemicSIR/EpidemicSIRVisualizer';

const EpidemicSIRPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Epidemic SIR Model Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Mathematical epidemiology uses compartmental models to understand how infectious diseases spread through
          populations. The SIR model, one of the foundational frameworks in this field, divides a population into three
          compartments: <strong>Susceptible (S)</strong>, <strong>Infected (I)</strong>, and <strong>Recovered (R)</strong>.
          As an epidemic progresses, individuals move from susceptible to infected upon contact with an infectious person,
          and from infected to recovered (or deceased) after a period of illness.
        </p>
        <p>
          This simulator brings the SIR model to life with an agent-based approach. Instead of solving differential equations
          directly, individual "agents" move, interact, and transmit disease according to the parameters you set. The emergent
          population-level dynamics closely mirror the classical SIR curves, giving you an intuitive understanding of how
          micro-level interactions produce macro-level epidemic behavior.
        </p>
      </div>

      <EpidemicSIRVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding the SIR Model</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">The SIR Equations</h3>
            <p>
              The classical SIR model is described by three ordinary differential equations that govern how individuals
              transition between compartments:
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"\\frac{dS}{dt} = -\\frac{\\beta S I}{N}"}</BlockMath>
              <BlockMath>{"\\frac{dI}{dt} = \\frac{\\beta S I}{N} - \\gamma I"}</BlockMath>
              <BlockMath>{"\\frac{dR}{dt} = \\gamma I"}</BlockMath>
            </div>
            <p className="mt-3">
              Here, <InlineMath>{"\\beta"}</InlineMath> is the transmission rate (how quickly the disease spreads on contact),
              <InlineMath>{"\\gamma"}</InlineMath> is the recovery rate (<InlineMath>{"1 / \\text{average duration of infection}"}</InlineMath>), and <InlineMath>{"N"}</InlineMath> is
              the total population. The ratio <InlineMath>{"\\beta / \\gamma"}</InlineMath> determines whether an epidemic will grow or die out.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">R0 and Herd Immunity</h3>
            <p>
              The <strong>basic reproduction number <InlineMath>{"R_0"}</InlineMath></strong> (pronounced "R-naught") represents the average number of
              secondary infections caused by a single infected individual in a fully susceptible population. It is calculated
              as <InlineMath>{"R_0 = \\beta / \\gamma"}</InlineMath>.
            </p>
            <ul className="mt-2 space-y-1">
              <li><InlineMath>{"R_0 < 1"}</InlineMath>: Each infected person infects fewer than one other person on average. The epidemic dies out.</li>
              <li><InlineMath>{"R_0 = 1"}</InlineMath>: The epidemic is at a tipping point, neither growing nor shrinking.</li>
              <li><InlineMath>{"R_0 > 1"}</InlineMath>: The epidemic grows exponentially in its early stages.</li>
            </ul>
            <p className="mt-3">
              <strong>Herd immunity</strong> is achieved when enough of the population is immune (through vaccination or
              prior infection) that the effective reproduction number drops below 1. The herd immunity threshold is
              calculated as <InlineMath>{"1 - 1/R_0"}</InlineMath>. For measles (<InlineMath>{"R_0 \\approx 15"}</InlineMath>), this threshold is about
              93%, while for seasonal flu (<InlineMath>{"R_0 \\approx 1.5"}</InlineMath>), it is around 33%.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Real-World Applications</h3>
            <p>
              SIR-type models have been instrumental in understanding and responding to real epidemics:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>COVID-19:</strong> Extended SEIR models (adding an Exposed compartment) were used worldwide to
                forecast hospital demand, evaluate lockdown timing, and plan vaccine rollout strategies.
              </li>
              <li>
                <strong>Measles:</strong> With one of the highest R0 values (~12-18), measles modeling demonstrates why
                very high vaccination coverage is needed. Even small drops in vaccination rates can trigger outbreaks.
              </li>
              <li>
                <strong>Seasonal Influenza:</strong> Annual flu modeling helps public health agencies decide vaccine
                composition, allocate antiviral stockpiles, and prepare hospital surge capacity.
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg border border-red-200 dark:border-red-700">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">Intervention Strategies</h3>
            <p>
              Public health interventions work by modifying the parameters of the SIR model:
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Vaccination</strong> moves individuals directly from S to R without experiencing illness,
                effectively reducing the susceptible pool. Try the "With Vaccination" preset to see how pre-existing
                immunity slows the epidemic.
              </li>
              <li>
                <strong>Social distancing</strong> reduces the contact rate between individuals, effectively lowering beta.
                In the simulator, this reduces movement speed, leading to fewer transmission opportunities.
              </li>
              <li>
                <strong>Quarantine and isolation</strong> remove infected individuals from the general population, preventing
                further transmission. The simulator models this by moving infected agents to a designated quarantine zone.
              </li>
              <li>
                <strong>Reducing infection duration</strong> (through treatment) increases gamma, which lowers R0 and
                reduces total infections even without preventing transmission directly.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 my-8">
          <h2 className="text-xl font-bold mb-4">Exploring the Simulator</h2>
          <p>
            Use the preset scenarios to quickly see the effect of different disease characteristics and interventions.
            Adjust individual parameters to build intuition about which factors matter most. Watch the real-time R0
            estimate to understand how interventions bring the reproduction number below the critical threshold of 1.
            The population canvas shows the stochastic, agent-level dynamics while the SIR curves chart reveals the
            smooth, population-level trends that emerge from those individual interactions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EpidemicSIRPage;
