import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} DataViz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;