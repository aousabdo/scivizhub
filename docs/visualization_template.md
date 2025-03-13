Create a complete implementation for a new SciVizHub visualization: {VISUALIZATION_NAME} - {VISUALIZATION_DESCRIPTION}

Please analyze my repository structure and provide all necessary files to implement this visualization in the same style and structure as my existing visualizations. The visualization should be interactive, educational, and follow SciVizHub's modern design aesthetic.

Required deliverables:

1. Main visualization component (src/components/Visualizations/{PascalCaseName}/{PascalCaseName}Visualizer.jsx)
   - Include all necessary React hooks, state management, and interactive elements
   - Implement the visualization using appropriate libraries (D3.js, react-spring, etc.)
   - Add comprehensive comments explaining the scientific concepts

2. Utility file if needed (src/components/Visualizations/{PascalCaseName}/{camelCaseName}Utils.js)
   - Include helper functions, algorithms, and data processing logic
   - Well-documented with clear explanations of mathematical concepts

3. Visualization page (src/pages/Visualization/{PascalCaseName}.jsx)
   - Include layout similar to existing visualization pages
   - Add proper educational content, explanations, and references
   - Follow the same structure as other visualization pages

4. Required modifications to:
   - src/data/visualizations.js (add the new visualization metadata)
   - src/App.js (add the new route)

5. DALL-E prompt for the visualization thumbnail following this successful style:
   "A modern, minimalist visualization of {VISUALIZATION_NAME}. {VISUALIZATION_SPECIFIC_ELEMENTS}. The background should be a subtle gradient from light to darker gray. Incorporate small abstract elements suggesting {CONCEPT_ELEMENTS}. The style should be clean, digital, and educational, suitable for a scientific visualization website card display. Maintain high contrast and visual clarity at thumbnail size."

For guidance, refer to my existing visualizations like BayesTheorem, and make sure the new component maintains similar educational quality and interactivity.