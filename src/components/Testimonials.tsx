import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Data Analyst',
    company: 'Tech Corp',
    content: 'This platform has revolutionized how we handle data analysis. The automated visualizations save us hours of work every week.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Business Intelligence Manager',
    company: 'Global Solutions',
    content: 'The variety of visualization options and the ability to quickly generate reports has made our data analysis process much more efficient.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Research Scientist',
    company: 'Research Labs',
    content: 'An invaluable tool for our research team. The automated insights help us identify patterns we might have missed otherwise.',
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">{testimonial.content}</p>
              <div className="border-t pt-4">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
                <p className="text-sm text-gray-500">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;