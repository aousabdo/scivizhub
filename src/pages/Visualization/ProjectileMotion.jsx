import React from 'react';
import ProjectileMotionVisualizer from '../../components/Visualizations/ProjectileMotion/ProjectileMotionVisualizer';

const ProjectileMotionPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Projectile Motion Lab</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Projectile motion links geometry, kinematics, and forces. In the simplest model, gravity is the only force and
          the trajectory is a parabola. In realistic conditions, air resistance and wind reshape the path and reduce range.
        </p>
        <p>
          This lab lets you control launch parameters and environment settings, compare simulation to a no-drag analytic
          baseline, and observe how each parameter affects range, maximum height, and flight duration.
        </p>
      </div>

      <ProjectileMotionVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Physics Concepts in the Lab</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Horizontal and Vertical Components</h3>
            <p>
              Initial velocity splits into horizontal and vertical components. Gravity acts downward, continuously reducing
              vertical velocity, while horizontal motion remains constant only in the ideal no-drag model.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Effect of Drag and Wind</h3>
            <p>
              Air resistance opposes motion relative to the surrounding air. Headwinds increase relative speed and drag,
              shortening range, while tailwinds can extend range depending on launch angle and speed.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Planetary Gravity Comparisons</h3>
            <p>
              Lower gravity environments such as the Moon produce longer flight times and larger ranges for the same launch
              conditions. Planet presets provide fast intuition for this scaling behavior.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Common Applications</h2>
          <p>
            Projectile models are used in sports analytics, aerospace launch planning, robotics, and safety engineering.
            Even simplified models are valuable for understanding tradeoffs and building intuition before higher-fidelity
            simulations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectileMotionPage;
