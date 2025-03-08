import React from 'react';
import CentralLimitTheoremVisualizer from '../../components/Visualizations/CentralLimitTheorem/CentralLimitTheoremVisualizer';

const CentralLimitTheoremPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Central Limit Theorem</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Central Limit Theorem (CLT) is one of the most important concepts in statistics. It states that when you 
          take sufficiently large random samples from any population, the distribution of the sample means will be 
          approximately normally distributed, regardless of the population's original distribution.
        </p>
        <p>
          This interactive visualization allows you to explore this powerful theorem by selecting different population 
          distributions and observing how the distribution of sample means converges to a normal distribution as you 
          increase the sample size.
        </p>
      </div>
      
      <CentralLimitTheoremVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Importance of the Central Limit Theorem</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Mathematical Foundation</h3>
            <p>
              The Central Limit Theorem provides a precise statement about the distribution of sample means:
            </p>
            
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="italic">
                If you take random samples of size n from any population with mean μ and finite standard deviation σ, 
                then as n becomes larger, the sampling distribution of the sample mean approaches a normal distribution 
                with mean μ and standard deviation σ/√n.
              </p>
            </div>
            
            <p>
              This theorem is remarkable because it applies to <em>any</em> population distribution as long as the 
              standard deviation is finite—whether the original distribution is uniform, exponential, bimodal, or 
              something else entirely.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Applications in Statistics</h3>
            <p>
              The Central Limit Theorem is the foundation for many statistical methods:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Confidence Intervals:</strong> The CLT allows us to construct confidence intervals for population means</li>
              <li><strong>Hypothesis Testing:</strong> Many statistical tests rely on the CLT for their validity</li>
              <li><strong>Statistical Inference:</strong> When making inferences about populations based on samples</li>
              <li><strong>Quality Control:</strong> Monitoring manufacturing processes by sampling products</li>
              <li><strong>Survey Sampling:</strong> Drawing conclusions about populations from survey data</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Key Implications</h3>
            <p>
              Understanding the Central Limit Theorem reveals several important insights:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                The mean of the sampling distribution equals the population mean (unbiased estimator)
              </li>
              <li>
                The standard deviation of the sampling distribution (standard error) decreases as sample size increases, 
                specifically by a factor of 1/√n
              </li>
              <li>
                Larger samples provide more precise estimates of population parameters
              </li>
              <li>
                Even if the population is not normally distributed, we can use normal-based methods for sufficiently large samples
              </li>
              <li>
                For non-normal populations, larger sample sizes are needed for the CLT approximation to be valid
              </li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Real-World Examples</h3>
            <p>
              The Central Limit Theorem appears in many everyday scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Opinion Polls:</strong> Political polls work because the average of many people's responses follows a normal distribution
              </li>
              <li>
                <strong>Medical Research:</strong> Clinical trials rely on the CLT when analyzing the effectiveness of treatments
              </li>
              <li>
                <strong>Economics:</strong> Analyzing economic indicators and making forecasts often depends on the CLT
              </li>
              <li>
                <strong>Insurance:</strong> Actuaries use the CLT to calculate risks and set premiums
              </li>
              <li>
                <strong>Finance:</strong> Investment risks and returns are often analyzed using CLT-based methods
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Limitations and Considerations</h2>
          <p>
            While the Central Limit Theorem is extremely powerful, it's important to understand its limitations:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>The samples must be random and independent</li>
            <li>The original population must have a finite variance</li>
            <li>For highly skewed distributions, larger sample sizes may be needed</li>
            <li>The theorem applies to means, not to individual values or other statistics</li>
            <li>The convergence to normality is asymptotic—it becomes more accurate as sample size increases</li>
          </ul>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The Central Limit Theorem is to statistics what evolution is to biology — a unifying, explanatory principle that makes sense of what would otherwise be an incomprehensible mass of observations."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CentralLimitTheoremPage;