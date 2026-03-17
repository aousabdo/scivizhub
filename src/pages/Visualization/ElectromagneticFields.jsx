import React from 'react';
import ElectromagneticFieldsVisualizer from '../../components/Visualizations/ElectromagneticFields/ElectromagneticFieldsVisualizer';

const ElectromagneticFieldsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Electromagnetic Fields</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Electric fields are invisible forces that permeate space around every charged object. They govern
          how charged particles interact, shaping everything from atomic structure to lightning bolts.
          This interactive visualizer lets you place charges, watch field lines emerge, and explore how
          electric fields combine through the principle of superposition.
        </p>
        <p>
          Click to place positive or negative charges, drag them around, and observe how the field lines,
          equipotential contours, and field vectors respond in real time. Use presets to explore classic
          configurations like dipoles, parallel plates, and quadrupoles, or create your own arrangements
          to build physical intuition.
        </p>
      </div>

      <ElectromagneticFieldsVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Science of Electric Fields</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Coulomb's Law</h3>
            <p>
              The foundation of electrostatics, Coulomb's law describes the force between two point charges.
              The force is proportional to the product of the charges and inversely proportional to the
              square of the distance between them. Like charges repel; opposite charges attract.
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                F = k * q1 * q2 / r²
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                Where k = 8.99 x 10⁹ N·m²/C² is Coulomb's constant, q1 and q2 are charges, and r is the separation distance.
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Electric Field</h3>
            <p>
              The electric field <strong>E</strong> at a point in space describes the force per unit charge
              that a small positive test charge would experience at that location. The field points away
              from positive charges and toward negative charges.
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                E = F / q = k * Q / r²
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                The electric field has units of N/C or equivalently V/m (volts per meter).
              </p>
            </div>
            <p className="mt-3">
              Field lines are drawn so that the tangent at any point gives the field direction, and the
              density of lines indicates the field strength. They never cross each other.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Superposition Principle</h3>
            <p>
              When multiple charges are present, the total electric field at any point is the vector sum
              of the fields produced by each individual charge. This principle of superposition allows us
              to calculate the field from any arrangement of charges by adding contributions one at a time.
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                E_total = E₁ + E₂ + E₃ + ... + Eₙ
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                Each Eᵢ is a vector — both magnitude and direction matter when summing fields.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Field Lines & Their Properties</h3>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Origin:</strong> Field lines begin on positive charges and end on negative charges</li>
              <li><strong>Direction:</strong> The tangent to a field line at any point gives the electric field direction</li>
              <li><strong>Density:</strong> Closely spaced lines indicate stronger fields; spread-out lines indicate weaker fields</li>
              <li><strong>No Crossing:</strong> Field lines never intersect — the field has a unique direction at every point</li>
              <li><strong>Symmetry:</strong> The number of lines from a charge is proportional to its magnitude</li>
            </ul>
          </div>

          <div className="bg-rose-50 p-6 rounded-lg border border-rose-200">
            <h3 className="text-xl font-bold text-rose-800 mb-3">Electric Potential</h3>
            <p>
              The electric potential V at a point is the work done per unit charge in bringing a positive
              test charge from infinity to that point. Equipotential lines connect points of equal potential
              and are always perpendicular to electric field lines.
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                V = k * Q / r
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                Potential is a scalar quantity — superposition involves simple addition, not vector addition.
              </p>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
            <h3 className="text-xl font-bold text-teal-800 mb-3">Electric Dipoles</h3>
            <p>
              An electric dipole consists of two equal and opposite charges separated by a small distance.
              Dipoles are fundamental in nature — water molecules, radio antennas, and many biological
              structures are dipolar. The dipole field falls off as 1/r³ at large distances, faster than
              the 1/r² field of a single charge.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Dipole Moment:</strong> p = q × d, where d is the separation between charges</li>
              <li><strong>Far Field:</strong> At large distances, the dipole field pattern becomes characteristic and universal</li>
              <li><strong>Torque:</strong> A dipole in a uniform field experiences a torque that aligns it with the field</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Historical Context</h2>
          <p>
            Charles-Augustin de Coulomb first quantified the electrostatic force in 1785 using a torsion
            balance. Michael Faraday later introduced the revolutionary concept of "lines of force" —
            the field lines visualized above — arguing that fields are real physical entities, not just
            mathematical conveniences.
          </p>
          <p className="mt-3">
            James Clerk Maxwell unified electricity and magnetism into a single framework in 1865,
            revealing that light itself is an electromagnetic wave. Today, electromagnetic theory underpins
            all of electronics, telecommunications, and our understanding of light and radiation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectromagneticFieldsPage;
