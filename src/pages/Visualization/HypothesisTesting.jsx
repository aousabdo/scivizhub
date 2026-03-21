import React from 'react';
import HypothesisTestingVisualizer from '../../components/Visualizations/HypothesisTesting/HypothesisTestingVisualizer';

const HypothesisTestingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Hypothesis Testing</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Hypothesis testing is a fundamental method in statistics for making decisions about populations based on
          sample data. It provides a structured framework for determining whether observed results are statistically
          significant or could have occurred by chance alone.
        </p>
        <p>
          This interactive visualization lets you explore the core concepts of hypothesis testing: null and alternative
          distributions, significance levels, p-values, Type I and Type II errors, and statistical power. Drag the test
          statistic marker and adjust the sliders to see how these concepts relate to one another in real time.
        </p>
      </div>

      <HypothesisTestingVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Hypothesis Testing</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Null and Alternative Hypotheses</h3>
            <p>
              Every hypothesis test begins with two competing claims:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Null Hypothesis (H&#8320;):</strong> The default assumption that there is no effect, no
                difference, or no relationship. For example, "the new drug has no effect compared to a placebo."
              </li>
              <li>
                <strong>Alternative Hypothesis (H&#8321;):</strong> The claim we are trying to find evidence for. It
                states that there is a real effect, difference, or relationship. For example, "the new drug is more
                effective than the placebo."
              </li>
            </ul>
            <p className="mt-3">
              We never "prove" the null hypothesis true. We either reject it (when evidence is strong enough) or fail
              to reject it (when evidence is insufficient).
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg border border-red-200 dark:border-red-700">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">Type I and Type II Errors</h3>
            <p>
              Because we make decisions under uncertainty, two kinds of errors are possible:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-red-200 dark:border-red-800 p-2 bg-red-100 dark:bg-red-900/30"></th>
                    <th className="border border-red-200 dark:border-red-800 p-2 bg-red-100 dark:bg-red-900/30">H&#8320; is True</th>
                    <th className="border border-red-200 dark:border-red-800 p-2 bg-red-100 dark:bg-red-900/30">H&#8320; is False</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-red-200 p-2 font-medium bg-red-100">Reject H&#8320;</td>
                    <td className="border border-red-200 dark:border-red-800 p-2 bg-white dark:bg-gray-800">
                      <strong className="text-red-600">Type I Error (&alpha;)</strong>
                      <br />False Positive
                    </td>
                    <td className="border border-red-200 dark:border-red-800 p-2 bg-white dark:bg-gray-800">
                      <strong className="text-green-600">Correct Decision</strong>
                      <br />Power (1 &minus; &beta;)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-red-200 p-2 font-medium bg-red-100">Fail to Reject H&#8320;</td>
                    <td className="border border-red-200 dark:border-red-800 p-2 bg-white dark:bg-gray-800">
                      <strong className="text-green-600">Correct Decision</strong>
                      <br />(1 &minus; &alpha;)
                    </td>
                    <td className="border border-red-200 dark:border-red-800 p-2 bg-white dark:bg-gray-800">
                      <strong className="text-amber-600">Type II Error (&beta;)</strong>
                      <br />False Negative
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li>
                <strong>Type I Error (&alpha;):</strong> Rejecting H&#8320; when it is actually true. This is a
                "false alarm." The significance level controls this probability directly.
              </li>
              <li>
                <strong>Type II Error (&beta;):</strong> Failing to reject H&#8320; when it is actually false. This
                is a "missed detection." It depends on effect size, sample size, and the significance level.
              </li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">P-Values and Significance Levels</h3>
            <p>
              The <strong>p-value</strong> is the probability of observing a test statistic at least as extreme as the
              one calculated, assuming the null hypothesis is true. It answers: "If there really were no effect, how
              surprising would our data be?"
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="italic">
                If the p-value is less than or equal to the chosen significance level (&alpha;), we reject the null
                hypothesis. Otherwise, we fail to reject it.
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>A small p-value (e.g., 0.01) indicates strong evidence against H&#8320;</li>
              <li>A large p-value (e.g., 0.40) suggests the data are consistent with H&#8320;</li>
              <li>Common significance levels: 0.05 (5%), 0.01 (1%), and 0.10 (10%)</li>
              <li>The p-value is <em>not</em> the probability that H&#8320; is true</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Statistical Power</h3>
            <p>
              <strong>Power</strong> (1 &minus; &beta;) is the probability of correctly rejecting the null hypothesis
              when the alternative hypothesis is true. In other words, it measures a test's ability to detect a real
              effect when one exists.
            </p>
            <p className="mt-3">
              Power is influenced by three main factors:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Effect Size:</strong> Larger true effects are easier to detect, increasing power
              </li>
              <li>
                <strong>Sample Size:</strong> Larger samples reduce variability, making it easier to detect effects
              </li>
              <li>
                <strong>Significance Level (&alpha;):</strong> A more lenient threshold (larger &alpha;) increases
                power but also increases the risk of Type I errors
              </li>
            </ul>
            <p className="mt-3">
              A commonly recommended minimum power is 80% (0.80). Use the sliders above to explore how changing
              parameters affects power.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-3">One-Tailed vs. Two-Tailed Tests</h3>
            <p>
              The choice between one-tailed and two-tailed tests depends on the research question:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Two-tailed test:</strong> Used when you want to detect an effect in either direction (e.g.,
                "Is the drug different from the placebo?"). The rejection region is split between both tails.
              </li>
              <li>
                <strong>One-tailed test:</strong> Used when you only care about an effect in one specific direction
                (e.g., "Is the new process faster?"). All of the rejection region is in one tail, giving more power
                to detect effects in that direction.
              </li>
            </ul>
            <p className="mt-3">
              Two-tailed tests are more conservative and are generally preferred unless there is a strong theoretical
              reason to test in only one direction.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-bold mb-4">Common Misconceptions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>A p-value of 0.05 does <em>not</em> mean there is a 5% chance the null hypothesis is true</li>
              <li>Statistical significance does not imply practical importance</li>
              <li>"Failure to reject" is not the same as "accepting" the null hypothesis</li>
              <li>A non-significant result does not prove the absence of an effect; the test may lack power</li>
              <li>P-values are not a measure of effect size; always report effect sizes alongside p-values</li>
            </ul>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The purpose of hypothesis testing is not to determine the truth of an assertion, but to determine whether
            the data provide enough evidence to reasonably doubt an assumption."
          </p>
        </div>
      </div>
    </div>
  );
};

export default HypothesisTestingPage;
