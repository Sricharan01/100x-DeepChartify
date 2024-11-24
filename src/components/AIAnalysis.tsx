import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { HfInference } from '@huggingface/inference';

interface AIAnalysisProps {
  data: any[];
  onAnalysisComplete: (analysis: {
    text: string;
    recommendations: string[];
    suggestedColumns?: string[];
  }) => void;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ data, onAnalysisComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeData = async () => {
    if (!prompt.trim() || !data) return;

    try {
      setLoading(true);
      setError('');

      const hf = new HfInference("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");

      // Prepare a clean data sample
      const dataSample = data.slice(0, 5).map(item => {
        const cleanItem = {};
        Object.entries(item).forEach(([key, value]) => {
          cleanItem[key] = typeof value === 'number' ? value : String(value);
        });
        return cleanItem;
      });

      const systemPrompt = `As a data analysis expert, analyze this data and provide insights.
        Format your response in these sections:
        1. Key Findings
        2. Metrics & Trends
        3. Visualization Recommendations
        4. Additional Insights

        User Request: ${prompt}
        
        Data Sample (first 5 rows): ${JSON.stringify(dataSample, null, 2)}`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: systemPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      });

      if (!response?.generated_text) {
        throw new Error('No response received from AI model');
      }

      const analysis = processAIResponse(response.generated_text, data);
      onAnalysisComplete(analysis);

    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError(err.message || 'Failed to analyze data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processAIResponse = (response: string, data: any[]) => {
    try {
      // Split response into sections
      const sections = response.split(/\d+\./).filter(Boolean);
      
      // Extract visualization recommendations
      const visualizationSection = sections.find(s => 
        s.toLowerCase().includes('visualization') || 
        s.toLowerCase().includes('chart')
      ) || '';

      const chartTypes = extractChartTypes(visualizationSection);
      const suggestedColumns = extractColumnSuggestions(visualizationSection, data);

      return {
        text: response,
        recommendations: chartTypes.length > 0 ? chartTypes : ['bar', 'line'], // Default charts if none found
        suggestedColumns: suggestedColumns.length > 0 ? suggestedColumns : Object.keys(data[0]).slice(0, 2) // Default columns if none found
      };
    } catch (err) {
      console.error('Response Processing Error:', err);
      // Return safe defaults if processing fails
      return {
        text: response,
        recommendations: ['bar', 'line'],
        suggestedColumns: Object.keys(data[0]).slice(0, 2)
      };
    }
  };

  const extractChartTypes = (text: string): string[] => {
    const chartKeywords = {
      bar: 'Bar Graph',
      line: 'Line Chart',
      pie: 'Pie Chart',
      scatter: 'Scatter Plot',
      radar: 'Radar Chart',
      boxplot: 'Box Plot',
      heatmap: 'Heat Map'
    };

    const foundTypes = Object.entries(chartKeywords)
      .filter(([keyword]) => text.toLowerCase().includes(keyword))
      .map(([_, chartType]) => chartType)
      .filter((value, index, self) => self.indexOf(value) === index);

    return foundTypes.length > 0 ? foundTypes : ['bar', 'line']; // Default charts if none found
  };

  const extractColumnSuggestions = (text: string, data: any[]): string[] => {
    if (!data.length) return [];

    const availableColumns = Object.keys(data[0]);
    const suggestedCols = availableColumns.filter(column => 
      text.toLowerCase().includes(column.toLowerCase())
    );

    return suggestedCols.length > 0 ? suggestedCols : availableColumns.slice(0, 2);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your analysis request (e.g., 'Generate sales reports for Q3 with charts')"
            className="w-full p-4 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                analyzeData();
              }
            }}
          />
          <button
            onClick={analyzeData}
            disabled={loading || !prompt.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;