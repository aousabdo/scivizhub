import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import ChaosGameVisualizer from '../../components/Visualizations/ChaosGame/ChaosGameVisualizer';

const ChaosGamePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Chaos Game &amp; Fractal Visualization</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Chaos Game is a deceptively simple algorithm that produces stunningly complex fractal patterns.
          Start with a polygon, pick a random vertex, jump a fixed fraction of the distance toward it, plot
          a point, and repeat. From this minimal set of rules &mdash; pure randomness guided by a single
          ratio &mdash; intricate self-similar structures emerge that connect geometry, probability, and the
          mathematics of iterated function systems.
        </p>
        <p>
          Choose a preset below to see classic fractals like the Sierpinski Triangle, or switch to Custom
          mode to experiment with different vertex counts, jump ratios, and vertex restrictions. Adjust the
          speed and color mode to watch the fractal take shape before your eyes.
        </p>
      </div>

      <ChaosGameVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding the Chaos Game</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The Rules of the Chaos Game</h3>
            <p>
              The Chaos Game follows a remarkably simple procedure:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-3">
              <li>
                Place <em>n</em> vertices at the corners of a regular polygon (for example, 3 vertices
                forming a triangle).
              </li>
              <li>
                Choose any starting point in the plane (it does not need to be inside the polygon).
              </li>
              <li>
                Randomly select one of the <em>n</em> vertices.
              </li>
              <li>
                Move a fixed fraction <em>r</em> (the <strong>jump ratio</strong>) of the distance from
                the current point toward the chosen vertex, and plot a dot at the new location.
              </li>
              <li>
                Repeat steps 3&ndash;4 indefinitely.
              </li>
            </ol>
            <p className="mt-3">
              After discarding the first few transient points, the plotted dots converge onto a fractal
              known as the <strong>attractor</strong> of the system. The specific shape depends on the
              number of vertices, the jump ratio, and any restrictions placed on vertex selection. For a
              triangle with ratio 1/2, the result is always the Sierpinski Triangle &mdash; regardless of
              the starting point.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Iterated Function Systems (IFS)</h3>
            <p>
              The Chaos Game is a concrete implementation of an <strong>Iterated Function System</strong>,
              a concept formalized by mathematician John Hutchinson in 1981 and popularized by Michael
              Barnsley. An IFS consists of a finite set of contraction mappings &mdash; functions that
              bring points closer together &mdash; applied repeatedly.
            </p>
            <p className="mt-3">
              In the Chaos Game, each vertex defines one contraction mapping: "move a fraction <em>r</em>
              toward vertex <InlineMath>{'V_i'}</InlineMath>." Mathematically, if the current point
              is <InlineMath>{'P'}</InlineMath> and the chosen vertex is <InlineMath>{'V_i'}</InlineMath>, the next point is:
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <BlockMath>{"P' = P + r \\cdot (V_i - P) = (1 - r) \\cdot P + r \\cdot V_i"}</BlockMath>
            </div>
            <p>
              Each such mapping is an <strong>affine contraction</strong> with contraction factor <InlineMath>{'(1 - r)'}</InlineMath>.
              The Banach Fixed Point Theorem guarantees that the repeated application of these contractions
              converges to a unique compact set &mdash; the fractal attractor &mdash; independent of the
              starting point. The random selection of which mapping to apply at each step is known as the
              <strong> Random Iteration Algorithm</strong>, and it efficiently samples points across the
              entire attractor.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Self-Similarity and Fractals</h3>
            <p>
              The patterns generated by the Chaos Game are <strong>self-similar</strong>: zooming into any
              part of the fractal reveals a smaller copy of the whole structure. This property is the
              hallmark of fractals &mdash; geometric objects that exhibit detail at every scale.
            </p>
            <p className="mt-3">
              The <strong>Sierpinski Triangle</strong>, produced by the 3-vertex, ratio-1/2 game, is a
              canonical example. It can be constructed in multiple equivalent ways: by repeatedly removing
              the central triangle from each remaining triangle, by Pascal&apos;s Triangle modulo 2, or by
              the Chaos Game. Its fractal (Hausdorff) dimension is <InlineMath>{'\\log(3)/\\log(2) \\approx 1.585'}</InlineMath> &mdash;
              more than a line but less than a surface.
            </p>
            <p className="mt-3">
              Different presets produce different levels of self-similarity. The pentagon fractal at the
              golden ratio (~0.618) shows five-fold symmetry with nested pentagons, while the hexagon
              fractal at ratio 1/3 produces a snowflake-like pattern with six-fold symmetry. Adding vertex
              restrictions &mdash; such as forbidding the same vertex to be chosen twice in a row &mdash;
              can transform a formless cloud of points into a beautifully structured fractal.
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Historical Context</h3>
            <p>
              The Chaos Game was introduced by <strong>Michael Barnsley</strong> in his influential 1988
              book <em>Fractals Everywhere</em>. Barnsley, a British mathematician working at the Georgia
              Institute of Technology, developed it as an intuitive way to demonstrate the power of Iterated
              Function Systems and made fractal geometry accessible to a broad audience.
            </p>
            <p className="mt-3">
              The fractal it most famously produces &mdash; the Sierpinski Triangle &mdash; was described
              by Polish mathematician <strong>Wac&lstrok;aw Sierpi&nacute;ski</strong> in 1915, long before
              the term "fractal" existed. Sierpi&nacute;ski constructed it as a curve that is simultaneously
              everywhere connected and nowhere smooth, a mathematical curiosity that challenged classical
              notions of dimension and continuity.
            </p>
            <p className="mt-3">
              The broader study of fractals was revolutionized by <strong>Benoit Mandelbrot</strong>, who
              coined the term "fractal" in 1975 and demonstrated that such self-similar structures appear
              throughout nature &mdash; in coastlines, mountain ranges, blood vessels, and clouds. Barnsley&apos;s
              Chaos Game provided a bridge between Mandelbrot&apos;s geometric vision and the rigorous
              mathematics of dynamical systems and IFS theory.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Applications</h3>
            <p>
              The mathematics underlying the Chaos Game and Iterated Function Systems extends far beyond
              producing beautiful pictures:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Computer Graphics:</strong> IFS-based fractal generation is used to create
                realistic natural scenery &mdash; ferns, trees, mountains, and clouds &mdash; in films,
                video games, and digital art. Barnsley&apos;s Fern, generated by a four-mapping IFS, is
                one of the most recognizable examples of procedural nature modeling.
              </li>
              <li>
                <strong>Data Compression:</strong> Fractal image compression, pioneered by Barnsley and
                Arnaud Jacquin in the late 1980s, exploits self-similarity within images to achieve high
                compression ratios. The technique encodes an image as a set of contractive transformations
                whose attractor approximates the original, enabling resolution-independent decompression.
              </li>
              <li>
                <strong>Antenna Design:</strong> Fractal antennas use self-similar geometries &mdash;
                Sierpinski gaskets, Koch curves, and Minkowski islands &mdash; to achieve multiband and
                wideband performance in a compact form factor. Their space-filling properties allow a
                single antenna to resonate at multiple frequencies, making them valuable in modern
                wireless devices and smartphones.
              </li>
              <li>
                <strong>Signal and Image Analysis:</strong> Fractal dimension serves as a measure of
                complexity in signals and textures. It is used in medical imaging to characterize tumors,
                in seismology to analyze earthquake patterns, and in ecology to quantify habitat complexity
                and species distribution.
              </li>
              <li>
                <strong>Mathematical Education:</strong> The Chaos Game is widely used as a teaching tool
                because it demonstrates deep mathematical concepts &mdash; convergence, measure theory,
                self-similarity, and deterministic chaos &mdash; through an interactive, visual experience
                that requires no advanced prerequisites.
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Fractal geometry is not just a chapter of mathematics, but one that helps Everyman to see
            the same old world differently." &mdash; Benoit Mandelbrot
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChaosGamePage;
