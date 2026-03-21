import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import BayesianUpdatingVisualizer from '../../components/Visualizations/BayesianUpdating/BayesianUpdatingVisualizer';

const BayesianUpdatingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        Bayesian Updating — Live Visualizer
      </h1>

      <div className="prose max-w-4xl mx-auto mb-8 text-gray-700 dark:text-gray-300">
        <p>
          Bayesian inference treats probability as a measure of <em>belief</em>. Before observing any
          data you hold a <strong>prior</strong> distribution over the unknown parameter. Each new
          observation multiplies that distribution by a <strong>likelihood</strong> and renormalises the
          result, yielding a <strong>posterior</strong> distribution that encodes everything you now
          know. Repeat: the posterior becomes the next prior. This page lets you watch that process
          unfold in real time for two canonical conjugate models.
        </p>
        <p>
          Use the controls to choose a model, set prior parameters, choose the hidden true value, then
          flip coins or generate Normal observations one at a time or in auto-run mode. Watch the green
          posterior curve sharpen and converge toward the truth as evidence accumulates.
        </p>
      </div>

      <BayesianUpdatingVisualizer />

      {/* Educational cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

        {/* Bayes' rule */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">
            Bayes' Rule for Distributions
          </h2>
          <p className="text-blue-900 dark:text-blue-200 mb-3">
            The fundamental update rule for a continuous parameter θ given data&nbsp;<em>x</em>:
          </p>
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3 mb-3 text-center">
            <BlockMath>{"p(\\theta \\mid x) \\propto p(x \\mid \\theta) \\cdot p(\\theta)"}</BlockMath>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-blue-900 dark:text-blue-200 text-sm">
            <li><InlineMath>{"p(\\theta)"}</InlineMath> — prior: your belief before seeing data</li>
            <li><InlineMath>{"p(x \\mid \\theta)"}</InlineMath> — likelihood: how probable the data is under θ</li>
            <li><InlineMath>{"p(\\theta \\mid x)"}</InlineMath> — posterior: updated belief after data</li>
            <li>The <InlineMath>{"\\propto"}</InlineMath> (proportional to) hides the normalising constant <InlineMath>{"p(x)"}</InlineMath></li>
          </ul>
        </div>

        {/* Conjugate priors */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
            Conjugate Priors
          </h2>
          <p className="text-green-900 dark:text-green-200 mb-3">
            A prior is <em>conjugate</em> to a likelihood if the posterior is in the same family as the
            prior — making sequential updating a simple parameter update rather than a numerical
            integral.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-green-900 dark:text-green-200 text-sm">
            <li>Beta prior + Binomial likelihood → Beta posterior</li>
            <li>Normal prior + Normal likelihood (known σ) → Normal posterior</li>
            <li>Dirichlet prior + Multinomial likelihood → Dirichlet posterior</li>
            <li>Gamma prior + Poisson likelihood → Gamma posterior</li>
          </ul>
          <p className="mt-3 text-green-900 dark:text-green-200 text-sm">
            Conjugacy is why the parameters update so cleanly: each flip merely increments α or β,
            and each Normal observation performs a precision-weighted average.
          </p>
        </div>

        {/* Beta-Binomial */}
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
            The Beta-Binomial Model
          </h2>
          <p className="text-purple-900 dark:text-purple-200 mb-2">
            Suppose a coin has an unknown bias <em>p</em>. We model uncertainty over <em>p</em> with
            a Beta distribution:
          </p>
          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3 mb-3 text-center">
            <BlockMath>{"p \\sim \\text{Beta}(\\alpha, \\beta)"}</BlockMath>
            <BlockMath>{"f(p;\\,\\alpha,\\beta) = \\frac{p^{\\alpha-1}(1-p)^{\\beta-1}}{B(\\alpha,\\beta)}"}</BlockMath>
          </div>
          <p className="text-purple-900 dark:text-purple-200 text-sm mb-2">
            After observing <em>h</em> heads and <em>t</em> tails the posterior is:
          </p>
          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3 text-center">
            <BlockMath>{"p \\mid \\text{data} \\sim \\text{Beta}(\\alpha + h,\\; \\beta + t)"}</BlockMath>
          </div>
          <p className="mt-3 text-purple-900 dark:text-purple-200 text-sm">
            The prior hyperparameters α and β act as <em>pseudo-counts</em>: a Beta(2, 2) prior
            represents the same information as having already seen 1 head and 1 tail (shifted by 1).
          </p>
        </div>

        {/* Why Bayesian */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">
            Why Bayesian Methods Matter
          </h2>
          <p className="text-amber-900 dark:text-amber-200 mb-3">
            Bayesian inference solves several problems that plague classical (frequentist) statistics:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-amber-900 dark:text-amber-200 text-sm">
            <li>
              <strong>Uncertainty quantification</strong> — the full posterior tells you not just
              the best guess but how confident you should be.
            </li>
            <li>
              <strong>Small-sample robustness</strong> — the prior regularises estimates when data
              are scarce, preventing wild overfitting.
            </li>
            <li>
              <strong>Intuitive intervals</strong> — a 95% <em>credible interval</em> genuinely
              contains the true parameter with 95% posterior probability, unlike a frequentist
              confidence interval.
            </li>
            <li>
              <strong>Sequential updating</strong> — you can update incrementally as new data arrive
              without reprocessing old observations, as illustrated by this visualizer.
            </li>
            <li>
              <strong>Decision theory</strong> — posteriors plug directly into Bayesian decision
              problems to minimise expected loss under uncertainty.
            </li>
          </ul>
        </div>

      </div>

      {/* Extended explanation */}
      <div className="mt-10 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Reading the Visualizer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-1.5 bg-blue-400 rounded mt-2 shrink-0" style={{ borderTop: '2px dashed #60a5fa', height: 0 }} />
            <p>
              <strong className="text-blue-400">Blue dashed</strong> — the prior distribution
              representing your beliefs before any data.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-0.5 bg-orange-400 rounded mt-2 shrink-0" />
            <p>
              <strong className="text-orange-400">Orange solid</strong> — the scaled likelihood
              function, showing which parameter values best explain the observed data.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-0.5 bg-green-400 rounded mt-2 shrink-0" />
            <p>
              <strong className="text-green-400">Green filled</strong> — the posterior distribution,
              the product of prior and likelihood (renormalised). This sharpens with more data.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Small dots beneath the main plot mark individual observations (green = heads, red = tails
          for the coin model; purple dots for Normal observations). The convergence chart below
          tracks the posterior mean and the 95% credible interval width over time — as width
          decreases, uncertainty shrinks.
        </p>
      </div>
    </div>
  );
};

export default BayesianUpdatingPage;
