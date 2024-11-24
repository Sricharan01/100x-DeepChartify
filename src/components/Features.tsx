import React from 'react';
import { BarChart2, PieChart, LineChart, Map, BarChart, ScatterChart, Box, Sun, Activity } from 'lucide-react';

const features = [
  {
    title: 'Multiple File Formats',
    description: 'Support for CSV, JSON, XLS, XLSX files with no size restrictions',
    icon: <Box className="h-8 w-8 text-blue-500" />
  },
  {
    title: 'Comprehensive Visualizations',
    description: 'Generate bar graphs, pie charts, line charts, heat maps, and more',
    icon: <BarChart2 className="h-8 w-8 text-blue-500" />
  },
  {
    title: 'Advanced Analytics',
    description: 'Automated data analysis with statistical insights and patterns',
    icon: <Activity className="h-8 w-8 text-blue-500" />
  },
  {
    title: 'Report Generation',
    description: 'Download beautiful PDF reports with all visualizations and insights',
    icon: <Sun className="h-8 w-8 text-blue-500" />
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Everything you need for data analysis
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Our platform provides comprehensive tools for analyzing and visualizing your data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;