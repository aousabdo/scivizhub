import React from 'react';

const contributionWays = [
  {
    title: 'Code Contributions',
    items: [
      'Build new interactive visualizations',
      'Improve performance and accessibility',
      'Fix bugs and polish UI interactions',
    ],
    accent: 'blue',
  },
  {
    title: 'Educational Content',
    items: [
      'Improve concept explanations and examples',
      'Suggest lesson-ready activity prompts',
      'Review technical accuracy and clarity',
    ],
    accent: 'green',
  },
  {
    title: 'Community Support',
    items: [
      'Report issues and suggest enhancements',
      'Share feedback from classroom use',
      'Promote SciVizHub with learners and peers',
    ],
    accent: 'purple',
  },
];

const accentClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
};

const ContributePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Contribute to SciVizHub</h1>

      <div className="max-w-4xl mx-auto mb-8 text-center text-gray-700">
        <p>
          SciVizHub is an open educational project. Whether you are a developer, educator, or learner,
          your contributions help make scientific concepts more accessible through interactive visuals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {contributionWays.map(({ title, items, accent }) => (
          <section key={title} className={`p-6 rounded-lg border ${accentClasses[accent]}`}>
            <h2 className="text-xl font-semibold mb-3">{title}</h2>
            <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="max-w-3xl mx-auto bg-gray-50 border rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold mb-3">Start with GitHub</h2>
        <p className="text-gray-600 mb-4">
          Browse open issues, discuss ideas, and submit pull requests to help shape the next generation
          of SciVizHub visualizations.
        </p>
        <a
          href="https://github.com/aousabdo/scivizhub"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Visit Repository
        </a>
      </div>
    </div>
  );
};

export default ContributePage;
