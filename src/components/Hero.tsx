import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const scrollToUpload = () => {
    const element = document.getElementById('upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Data-Driven Automated Reports
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-12">
        Transform your raw data into actionable insights with our powerful analysis platform. 
        Upload your data and get instant, beautiful reports with automated insights.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={scrollToUpload}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
        <button
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-3 bg-white text-blue-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
        >
          Learn More
        </button>
      </div>
      <button
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 animate-bounce"
      >
        <ChevronDown className="h-8 w-8 text-gray-400" />
      </button>
    </div>
  );
};

export default Hero;