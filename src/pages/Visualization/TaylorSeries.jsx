import React from 'react';
import TaylorSeriesVisualizer from '../../components/Visualizations/TaylorSeries/TaylorSeriesVisualizer';

const TaylorSeriesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Taylor Series Approximation</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          A Taylor series represents a function as an infinite sum of terms calculated from
          the values of its derivatives at a single point. By truncating this series to a
          finite number of terms, we obtain a Taylor polynomial -- a polynomial approximation
          that becomes increasingly accurate near the expansion point as more terms are included.
        </p>
        <p>
          This visualization lets you explore how Taylor polynomials converge to four
          fundamental functions: sin(x), cos(x), e<sup>x</sup>, and ln(1+x). Watch the
          approximation improve term by term, observe the radius of convergence in action,
          and develop an intuitive understanding of one of the most powerful tools in
          mathematical analysis.
        </p>
      </div>

      <TaylorSeriesVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Mathematics of Taylor Series</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Mathematical Foundation</h3>
            <p>
              The Taylor series of a function f(x) expanded about the point a is given by the
              infinite sum of terms involving successively higher derivatives of f evaluated at a.
            </p>

            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                f(x) = f(a) + f'(a)(x-a) + f''(a)(x-a)<sup>2</sup>/2!
                + f'''(a)(x-a)<sup>3</sup>/3! + ...
              </p>
              <p className="text-center font-mono text-sm mt-2">
                = &Sigma;<sub>n=0</sub><sup>&infin;</sup> f<sup>(n)</sup>(a) (x-a)<sup>n</sup> / n!
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                When a = 0, this is called a Maclaurin series. The n-th partial sum gives the
                n-th degree Taylor polynomial T<sub>n</sub>(x).
              </p>
            </div>

            <p>
              The key insight is that if a function is infinitely differentiable (smooth) at a point,
              all of its local information -- encoded in the derivatives -- can be used to reconstruct
              the function's values nearby. The factorial denominators ensure each term contributes
              the correct proportion, and the successive powers of (x-a) mean that higher-order
              terms become negligible close to the expansion point.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Convergence</h3>
            <p>
              Not every Taylor series converges to its generating function everywhere. The
              behavior of a Taylor series is governed by two key concepts:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Radius of Convergence (R):</strong> For each Taylor series there exists
                a non-negative number R (possibly infinite) such that the series converges
                absolutely for |x - a| &lt; R and diverges for |x - a| &gt; R. This is
                determined by the ratio test or root test applied to the coefficients. For
                sin(x), cos(x), and e<sup>x</sup>, the radius is infinite -- they converge
                everywhere. For ln(1+x) expanded at 0, R = 1.
              </li>
              <li>
                <strong>Rate of Convergence:</strong> Near the expansion point, convergence is
                rapid because (x-a)<sup>n</sup> shrinks quickly. Further away but still within
                the radius of convergence, many more terms are needed for the same accuracy.
                This is why you can see the Taylor polynomial matching the function well near
                x = 0 but diverging at the edges of the view.
              </li>
              <li>
                <strong>Taylor's Remainder Theorem:</strong> The error of the n-th Taylor
                polynomial is bounded by |R<sub>n</sub>(x)| &le; M|x-a|<sup>n+1</sup>/(n+1)!,
                where M bounds the (n+1)-th derivative on the interval. This gives a rigorous
                guarantee of approximation quality.
              </li>
              <li>
                <strong>Analytic vs. Smooth:</strong> A function can be infinitely differentiable
                yet not equal to its Taylor series. The classic example is
                f(x) = e<sup>-1/x<sup>2</sup></sup> (for x &ne; 0, f(0)=0), whose Taylor
                series at 0 is identically zero even though the function is not. Functions that
                do equal their Taylor series are called <em>analytic</em>.
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Applications</h3>
            <p>
              Taylor series are ubiquitous across science, engineering, and computing:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Physics -- Linearization:</strong> Nearly all of physics relies on
                Taylor expansion. Small-angle approximations (sin &theta; &asymp; &theta;)
                make pendulum equations solvable. Perturbation theory in quantum mechanics
                and general relativity builds solutions order by order using Taylor-like
                expansions.
              </li>
              <li>
                <strong>Engineering -- Control Systems:</strong> Transfer functions are often
                approximated by low-order polynomials near operating points. This is the
                foundation of linear control theory -- the entire discipline rests on the
                validity of first- or second-order Taylor approximations.
              </li>
              <li>
                <strong>Computing -- Evaluating Functions:</strong> Calculators and computers
                evaluate transcendental functions like sin, cos, exp, and log using polynomial
                approximations derived from Taylor series (often in refined forms like Chebyshev
                or minimax polynomials). The CORDIC algorithm and lookup-table methods are
                alternatives, but polynomial evaluation remains a cornerstone.
              </li>
              <li>
                <strong>Numerical Methods:</strong> Finite difference formulas, Runge-Kutta
                integration schemes, and error analyses of numerical algorithms all derive from
                Taylor expansion. Understanding the order of a numerical method means knowing
                how many Taylor series terms it captures exactly.
              </li>
              <li>
                <strong>Machine Learning:</strong> The second-order Taylor expansion of a loss
                function gives rise to Newton's method for optimization. The Hessian matrix
                captures the curvature information encoded in the quadratic term of the expansion.
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Historical Context</h3>
            <p>
              The idea of representing functions as power series has a long and rich history.
              In 14th-century India, <strong>Madhava of Sangamagrama</strong> and the Kerala
              school of mathematics discovered series expansions for trigonometric functions --
              what we now call the Maclaurin series for sin(x), cos(x), and arctan(x) -- roughly
              300 years before their European counterparts.
            </p>
            <p className="mt-3">
              In Europe, <strong>Brook Taylor</strong> published his general formula in 1715 in
              his work <em>Methodus Incrementorum Directa et Inversa</em>. Taylor showed how to
              express any sufficiently smooth function as a power series using its derivatives,
              giving the method its name. However, Taylor did not carefully address convergence,
              and his presentation was somewhat obscure to contemporaries.
            </p>
            <p className="mt-3">
              <strong>Colin Maclaurin</strong>, a Scottish mathematician, popularized the special
              case where the expansion point is zero in his 1742 treatise. Although Maclaurin
              credited Taylor, the a = 0 case became known as the Maclaurin series. Maclaurin
              used these expansions extensively in his work on geometry and gravitation.
            </p>
            <p className="mt-3">
              The rigorous foundations were laid in the 19th century by <strong>Augustin-Louis
              Cauchy</strong>, who developed the theory of convergence and established precise
              conditions under which a Taylor series represents its function. <strong>Karl
              Weierstrass</strong> later proved that any continuous function on a closed interval
              can be uniformly approximated by polynomials (the Weierstrass approximation
              theorem), though not necessarily by its own Taylor polynomials. Together, these
              contributions transformed Taylor series from a computational trick into a
              cornerstone of modern analysis.
            </p>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The reader will find no figures in this work. The methods which I set forth do not
            require either constructions or geometrical or mechanical reasonings, but only
            algebraic operations." -- Joseph-Louis Lagrange, 1788
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaylorSeriesPage;
