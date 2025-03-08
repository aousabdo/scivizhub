# SciVizHub - Scientific Visualization Hub

SciVizHub is an interactive educational platform featuring visualizations that make complex scientific concepts intuitive and accessible.

## Features

- Interactive visualizations across multiple scientific fields
- Detailed explanations of scientific concepts
- Responsive design that works on desktop and mobile
- Clear categorization by subject area
- User-friendly interface with intuitive navigation

## Live Demo

[Visit SciVizHub](https://scivizhub.org) (coming soon)

## Table of Contents

- [SciVizHub - Scientific Visualization Hub](#scivizhub---scientific-visualization-hub)
  - [Features](#features)
  - [Live Demo](#live-demo)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the App](#running-the-app)
  - [Project Structure](#project-structure)
  - [Available Visualizations](#available-visualizations)
  - [Adding New Visualizations](#adding-new-visualizations)
  - [Contributing](#contributing)
  - [License](#license)

## Getting Started

### Prerequisites

Before running SciVizHub, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aousabdo/scivizhub.git
   cd scivizhub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

To run the app in development mode:

```bash
npm start
```

This will start the app at [http://localhost:3000](http://localhost:3000).

To build the app for production:

```bash
npm run build
```

This will create optimized production files in the `build` folder.

## Project Structure

```
scivizhub/
├── public/              # Static files
│   ├── images/          # Visualization thumbnails & assets
│   └── favicon.ico      
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout/      # Header, Footer, Container components
│   │   ├── UI/          # UI components like cards, buttons
│   │   └── Visualizations/  # Visualization components
│   ├── pages/           # Page components
│   │   ├── Home/        # Homepage
│   │   ├── About/       # About page
│   │   ├── Category/    # Category pages
│   │   └── Visualization/  # Visualization pages
│   ├── data/            # Data files including visualization registry
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.js           # Main app component
│   └── index.js         # App entry point
└── package.json         # Dependencies and scripts
```

## Available Visualizations

Currently, SciVizHub features the following visualizations:

1. **Bayes' Theorem** - Interactive visualization demonstrating conditional probability through multiple perspectives

## Adding New Visualizations

To add a new visualization:

1. Create a new visualization component in `src/components/Visualizations/`
2. Create a wrapper page in `src/pages/Visualization/`
3. Add the visualization metadata to `src/data/visualizations.js`
4. Add a route in `src/App.js`

See the existing Bayes' Theorem visualization for reference.

## Contributing

We welcome contributions to SciVizHub! Please check out our [contribution guidelines](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
