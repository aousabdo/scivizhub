import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import VanDerPauwVisualizer from '../../components/Visualizations/VanDerPauw/VanDerPauwVisualizer';

const VanDerPauwPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Van der Pauw Method</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Van der Pauw method is a powerful technique for measuring the sheet resistance and
          resistivity of flat, arbitrarily shaped samples. Developed by Leo J. van der Pauw in 1958,
          it requires only four point contacts placed at the periphery of the sample — no need to
          know the sample geometry precisely.
        </p>
        <p>
          This interactive visualization lets you explore how different sample shapes, material
          properties, contact sizes, and measurement configurations affect the Van der Pauw
          measurement. Toggle between the two required measurement configurations, animate current
          flow, and see the Van der Pauw equation solved in real time.
        </p>
      </div>

      <VanDerPauwVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Physics of Van der Pauw Measurements</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">
              The Van der Pauw Equation
            </h3>
            <p>
              The fundamental equation relates two resistance measurements taken in perpendicular
              configurations to the sheet resistance <InlineMath>{"R_s"}</InlineMath> of the sample:
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"e^{-\\pi R_A / R_s} + e^{-\\pi R_B / R_s} = 1"}</BlockMath>
              <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                where <InlineMath>{"R_A = V_{34}/I_{12}"}</InlineMath> and <InlineMath>{"R_B = V_{41}/I_{23}"}</InlineMath>
              </p>
            </div>
            <p>
              For a symmetric sample where <InlineMath>{"R_A = R_B = R"}</InlineMath>, this simplifies to:
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"R_s = \\frac{\\pi R}{\\ln 2} \\approx 4.532 \\, R"}</BlockMath>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
              Sheet Resistance and Resistivity
            </h3>
            <p>
              Sheet resistance <InlineMath>{"R_s"}</InlineMath> (measured in Ω/□, "ohms per square") is
              the resistance of a square of material regardless of its size. It relates to the bulk
              resistivity <InlineMath>{"\\rho"}</InlineMath> and sample thickness <InlineMath>{"t"}</InlineMath> by:
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"R_s = \\frac{\\rho}{t}"}</BlockMath>
            </div>
            <p>
              This makes the Van der Pauw method ideal for characterizing thin films, semiconductor
              wafers, and coatings where thickness is well controlled.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
              Requirements and Assumptions
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>The sample must be <strong>flat</strong> (uniform thickness)</li>
              <li>The sample must be <strong>homogeneous</strong> and <strong>isotropic</strong></li>
              <li>Contacts must be at the <strong>periphery</strong> (edge) of the sample</li>
              <li>Contacts should be <strong>point-like</strong> (infinitesimally small)</li>
              <li>The sample must be <strong>simply connected</strong> (no holes)</li>
            </ul>
            <p className="mt-3">
              The <strong>cloverleaf</strong> geometry minimizes contact size errors by extending thin arms
              to the contacts, ensuring current enters and exits at well-defined peripheral points.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">
              Sources of Error
            </h3>
            <p>
              Real measurements deviate from the ideal due to several factors:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Finite contact size:</strong> Non-zero contact area introduces systematic error.
                The error scales as <InlineMath>{"\\sim (d/L)^2"}</InlineMath> where <InlineMath>{"d"}</InlineMath> is
                the contact diameter and <InlineMath>{"L"}</InlineMath> is the sample dimension.
              </li>
              <li>
                <strong>Contact placement:</strong> Contacts not exactly at the edge cause additional error.
              </li>
              <li>
                <strong>Sample inhomogeneity:</strong> Non-uniform resistivity or thickness invalidates the
                Van der Pauw assumptions.
              </li>
              <li>
                <strong>Thermoelectric effects:</strong> Temperature gradients at contacts can generate
                spurious voltages. Current reversal techniques help mitigate this.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VanDerPauwPage;
