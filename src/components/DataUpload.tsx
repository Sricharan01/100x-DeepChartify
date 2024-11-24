import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileUp, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  PieController,
  LineController,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import AIAnalysis from './AIAnalysis';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  PieController,
  LineController,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Colors
);

const CHART_TYPES = {
  bar: 'Bar Graph',
  line: 'Line Chart',
  pie: 'Pie Chart',
  scatter: 'Scatter Plot',
  radar: 'Radar Chart',
  boxplot: 'Box Plot',
  heatmap: 'Heat Map'
};

const DataUpload = () => {
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [generatedCharts, setGeneratedCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const chartsContainerRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const availableColumns = Object.keys(data[0]);
      setColumns(availableColumns);
      setSelectedColumns(availableColumns.slice(0, 2));
    }
  }, [data]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let parsedData;
        if (file.name.endsWith('.csv')) {
          parsedData = await parseCSV(e.target.result);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          parsedData = await parseExcel(e.target.result);
        } else if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(e.target.result);
        }
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseCSV = (content) => {
    return new Promise((resolve) => {
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');
        
        for (let j = 0; j < headers.length; j++) {
          const value = currentLine[j]?.trim();
          obj[headers[j].trim()] = isNaN(value) ? value : parseFloat(value);
        }
        result.push(obj);
      }
      
      resolve(result);
    });
  };

  const parseExcel = (content) => {
    const workbook = XLSX.read(content, { type: 'binary' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet);
  };

  const generateChart = (type = selectedChartType, cols = selectedColumns) => {
    if (!data || !cols.length) return;

    setLoading(true);
    let config;

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: cols[0]
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: cols[1] || ''
          }
        }
      }
    };

    switch (type) {
      case 'bar':
        config = {
          type: 'bar',
          data: {
            labels: data.map((_, i) => `Entry ${i + 1}`),
            datasets: cols.map((col, i) => ({
              label: col,
              data: data.map(item => item[col]),
              backgroundColor: `hsla(${i * 360 / cols.length}, 70%, 50%, 0.5)`,
            }))
          },
          options: chartOptions
        };
        break;

      case 'line':
        config = {
          type: 'line',
          data: {
            labels: data.map((_, i) => `Entry ${i + 1}`),
            datasets: cols.map((col, i) => ({
              label: col,
              data: data.map(item => item[col]),
              borderColor: `hsla(${i * 360 / cols.length}, 70%, 50%, 1)`,
              tension: 0.1
            }))
          },
          options: chartOptions
        };
        break;

      case 'pie':
        const pieData = {};
        data.forEach(item => {
          const key = item[cols[0]];
          pieData[key] = (pieData[key] || 0) + 1;
        });

        config = {
          type: 'pie',
          data: {
            labels: Object.keys(pieData),
            datasets: [{
              data: Object.values(pieData),
            }]
          },
          options: {
            ...chartOptions,
            scales: undefined
          }
        };
        break;

      case 'scatter':
        if (cols.length >= 2) {
          config = {
            type: 'scatter',
            data: {
              datasets: [{
                label: `${cols[0]} vs ${cols[1]}`,
                data: data.map(item => ({
                  x: item[cols[0]],
                  y: item[cols[1]]
                }))
              }]
            },
            options: chartOptions
          };
        }
        break;

      case 'radar':
        config = {
          type: 'radar',
          data: {
            labels: cols,
            datasets: [{
              label: 'Data Point',
              data: cols.map(col => data[0][col]),
              fill: true,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgb(54, 162, 235)',
            }]
          },
          options: {
            ...chartOptions,
            scales: undefined
          }
        };
        break;

      case 'boxplot':
        const boxplotData = cols.map(col => {
          const values = data.map(item => item[col]).sort((a, b) => a - b);
          const q1 = values[Math.floor(values.length * 0.25)];
          const median = values[Math.floor(values.length * 0.5)];
          const q3 = values[Math.floor(values.length * 0.75)];
          const min = values[0];
          const max = values[values.length - 1];
          return { min, q1, median, q3, max };
        });

        config = {
          type: 'bar',
          data: {
            labels: ['Minimum', 'Q1', 'Median', 'Q3', 'Maximum'],
            datasets: boxplotData.map((stats, i) => ({
              label: cols[i],
              data: [stats.min, stats.q1, stats.median, stats.q3, stats.max],
              backgroundColor: `hsla(${i * 360 / cols.length}, 70%, 50%, 0.5)`,
            }))
          },
          options: chartOptions
        };
        break;

      case 'heatmap':
        const heatmapData = data.map((item, i) => ({
          x: i,
          y: cols[0],
          v: item[cols[0]]
        }));

        config = {
          type: 'scatter',
          data: {
            datasets: [{
              label: cols[0],
              data: heatmapData,
              backgroundColor: (context) => {
                const value = context.raw.v;
                const max = Math.max(...heatmapData.map(d => d.v));
                const intensity = value / max;
                return `hsla(200, 70%, ${50 * intensity}%, 0.8)`;
              }
            }]
          },
          options: {
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              tooltip: {
                callbacks: {
                  label: (context) => `Value: ${context.raw.v}`
                }
              }
            }
          }
        };
        break;
    }

    if (config) {
      setGeneratedCharts(prev => [...prev, { config, type }]);
    }
    setLoading(false);
  };

  const handleAnalysisComplete = (analysis) => {
    setAiAnalysis(analysis);
    
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      const columns = analysis.suggestedColumns || selectedColumns;
      analysis.recommendations.forEach(chartType => {
        generateChart(chartType, columns);
      });
    }
  };

  const downloadReport = async () => {
    if (!generatedCharts.length && !aiAnalysis) return;

    const pdf = new jsPDF();
    let yOffset = 10;

    if (aiAnalysis) {
      pdf.setFontSize(16);
      pdf.text('AI Analysis Report', 10, yOffset);
      yOffset += 10;
      
      pdf.setFontSize(12);
      const splitText = pdf.splitTextToSize(aiAnalysis.text, 190);
      pdf.text(splitText, 10, yOffset);
      yOffset += splitText.length * 7 + 10;
    }

    const chartElements = chartsContainerRef.current.querySelectorAll('.chart-container');
    for (let i = 0; i < chartElements.length; i++) {
      const canvas = await html2canvas(chartElements[i]);
      const imgData = canvas.toDataURL('image/png');
      
      if (yOffset + 100 > pdf.internal.pageSize.height) {
        pdf.addPage();
        yOffset = 10;
      }
      
      pdf.addImage(imgData, 'PNG', 10, yOffset, 190, 100);
      yOffset += 110;
    }

    pdf.save('data-analysis-report.pdf');
  };

  return (
    <section id="upload" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Start Analyzing Your Data
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Upload your data file and generate comprehensive insights
        </p>

        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-blue-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV, JSON, XLS, XLSX
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv,.json,.xls,.xlsx"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {data && (
          <>
            <AIAnalysis 
              data={data} 
              onAnalysisComplete={handleAnalysisComplete} 
            />

            {aiAnalysis && (
              <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {aiAnalysis.text}
                  </pre>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={selectedChartType}
                    onChange={(e) => setSelectedChartType(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Object.entries(CHART_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Columns
                  </label>
                  <select
                    multiple
                    value={selectedColumns}
                    onChange={(e) => setSelectedColumns(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full p-2 border rounded-lg"
                    size={4}
                  >
                    {columns.map(column => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => generateChart()}
                  disabled={loading || !selectedColumns.length}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FileUp className="mr-2 h-5 w-5" />
                  Generate Report
                </button>
                <button
                  onClick={downloadReport}
                  disabled={!generatedCharts.length && !aiAnalysis}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Report
                </button>
              </div>
            </div>

            <div id="charts-container" ref={chartsContainerRef} className="space-y-8">
              {generatedCharts.map((chart, index) => (
                <div key={index} className="chart-container bg-white p-6 rounded-xl shadow-lg">
                  <Chart 
                    type={chart.config.type} 
                    data={chart.config.data}
                    options={chart.config.options}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DataUpload;