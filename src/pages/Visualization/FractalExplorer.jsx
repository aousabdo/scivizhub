import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import FractalExplorerVisualizer from '../../components/Visualizations/FractalExplorer/FractalExplorerVisualizer';

const FractalExplorerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Fractal Explorer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Fractals are among the most visually stunning objects in mathematics -- infinitely complex patterns
          that repeat at every scale, emerging from remarkably simple equations. This explorer lets you dive
          into the Mandelbrot set, Julia sets, and the Burning Ship fractal, zooming in to discover an endless
          universe of intricate detail hidden within a few lines of arithmetic.
        </p>
        <p>
          Each pixel on the canvas represents a point in the complex plane. The color of that pixel is determined
          by how quickly the corresponding iterative formula diverges (escapes to infinity). Points that never
          escape form the fractal set itself and are colored black. The boundary between escape and containment
          is where all the beauty lives -- an infinitely detailed, never-repeating coastline of mathematical complexity.
        </p>
      </div>

      <FractalExplorerVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Fractals</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">What Are Fractals?</h3>
            <p>
              A fractal is a geometric shape that exhibits <strong>self-similarity</strong> -- it looks similar
              at different levels of magnification. Unlike smooth Euclidean shapes like circles and squares,
              fractals have infinitely detailed boundaries that never simplify no matter how much you zoom in.
            </p>
            <p className="mt-3">
              Fractals often have a <strong>fractal dimension</strong> that is not a whole number. While a line
              is 1-dimensional and a plane is 2-dimensional, the boundary of the Mandelbrot set has a Hausdorff
              dimension of exactly 2, meaning its boundary is so convoluted it effectively fills a 2D area.
              Other fractals, like the Koch snowflake, have dimensions between 1 and 2 (approximately 1.26),
              reflecting their intermediate complexity.
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"D = \\frac{\\log(N)}{\\log(S)}"}</BlockMath>
              <p className="mt-2 text-sm text-center text-gray-600">
                Where <InlineMath>{'N'}</InlineMath> is the number of self-similar pieces and <InlineMath>{'S'}</InlineMath> is the scaling factor
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">The Mandelbrot Set</h3>
            <p>
              The Mandelbrot set is defined by the iteration <InlineMath>{'z_{n+1} = z_n^2 + c'}</InlineMath>, starting with <InlineMath>{'z_0 = 0'}</InlineMath>.
              For each complex number c in the plane, we iterate this formula and check whether the sequence
              diverges (<InlineMath>{'|z|'}</InlineMath> grows beyond 2) or remains bounded. Points where the sequence stays bounded belong
              to the Mandelbrot set.
            </p>
            <p className="mt-3">
              The <strong>escape-time algorithm</strong> assigns colors based on how many iterations it takes for
              <InlineMath>{'|z|'}</InlineMath> to exceed 2. Smooth coloring is achieved using the formula:
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"n_{\\text{smooth}} = n + 1 - \\frac{\\log(\\log|z|)}{\\log 2}"}</BlockMath>
              <p className="mt-2 text-sm text-center text-gray-600">
                This fractional iteration count eliminates the visible banding between integer iteration levels
              </p>
            </div>
            <p>
              The Mandelbrot set was first visualized by <strong>Benoit Mandelbrot</strong> in 1980 at IBM,
              using early computer graphics. Its iconic cardioid shape with circular bulbs has become one
              of the most recognized images in mathematics. The set is connected (a single piece) despite
              appearing to have separate islands at lower resolutions -- zoom in on any "island" and you will
              find a thin filament connecting it to the main body.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Julia Sets</h3>
            <p>
              Julia sets use the same formula <InlineMath>{'z_{n+1} = z_n^2 + c'}</InlineMath>, but with a twist: instead of varying <InlineMath>{'c'}</InlineMath>
              across the plane, c is held <strong>fixed</strong> and the initial value of z varies. Each point
              in the complex plane becomes a starting value for z, and we check whether the iteration escapes.
            </p>
            <p className="mt-3">
              There is a profound connection between the Mandelbrot set and Julia sets: <strong>every point c
              in the Mandelbrot set corresponds to a connected Julia set, and every point outside the Mandelbrot
              set gives a disconnected Julia set</strong> (called Fatou dust). Points near the boundary of the
              Mandelbrot set produce the most intricate and beautiful Julia sets.
            </p>
            <p className="mt-3">
              Julia sets were studied by French mathematicians <strong>Gaston Julia</strong> and
              <strong> Pierre Fatou</strong> in the early 20th century, decades before computers could visualize them.
              Their theoretical work laid the foundation for fractal geometry, though they never saw the
              stunning images their equations would produce.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">Fractals in Nature</h3>
            <p>
              Fractal patterns appear throughout the natural world, a testament to how simple recursive
              processes can generate extraordinary complexity:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Coastlines:</strong> Mandelbrot famously asked "How long is the coast of Britain?" --
                the answer depends on the measurement scale, because coastlines have fractal geometry. Measured
                with a shorter ruler, the coast gets longer without limit.
              </li>
              <li>
                <strong>Ferns and Plants:</strong> Barnsley's fern is a mathematically generated fractal that
                closely resembles natural fern fronds. Many plants exhibit fractal branching, including
                Romanesco broccoli with its striking spiral pattern.
              </li>
              <li>
                <strong>Snowflakes:</strong> The six-fold symmetric branching of ice crystals follows fractal
                rules, with each branch spawning smaller sub-branches in a self-similar pattern.
              </li>
              <li>
                <strong>Blood Vessels and Lungs:</strong> The circulatory and respiratory systems use fractal
                branching to maximize surface area within a limited volume -- a solution that evolution
                discovered long before mathematicians named it.
              </li>
              <li>
                <strong>River Networks:</strong> Drainage basins form fractal tree patterns as tributaries
                feed into larger streams and rivers.
              </li>
              <li>
                <strong>Lightning and Mountains:</strong> Electrical discharge paths and mountain ridge profiles
                both exhibit fractal characteristics with fractional dimensions.
              </li>
            </ul>
          </div>

          <div className="bg-rose-50 p-6 rounded-lg border border-rose-200">
            <h3 className="text-xl font-bold text-rose-800 mb-3">Historical Context</h3>
            <p>
              The story of fractal geometry spans more than a century of mathematical discovery:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>1918 -- Gaston Julia and Pierre Fatou</strong> independently studied the iteration of
                rational functions in the complex plane. Julia published his masterwork at age 25, having been
                severely wounded in World War I. Their work was largely forgotten for decades.
              </li>
              <li>
                <strong>1975 -- Benoit Mandelbrot</strong> coined the term "fractal" (from Latin <em>fractus</em>,
                meaning broken or fractured) and published <em>Les Objets Fractals</em>. He argued that fractal
                geometry describes nature far better than smooth Euclidean shapes.
              </li>
              <li>
                <strong>1980</strong> -- Mandelbrot first visualized the set that bears his name using IBM
                computers, revealing its extraordinary complexity. The image captivated mathematicians and
                the public alike.
              </li>
              <li>
                <strong>1980s--present</strong> -- Fractal geometry has found applications in computer graphics,
                antenna design, data compression, financial modeling, medical imaging, and many other fields.
                The Mandelbrot set has become an icon of mathematical beauty and computational art.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractalExplorerPage;
