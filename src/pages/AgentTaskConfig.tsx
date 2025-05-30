import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Database, CheckCircle } from 'lucide-react'; // Assuming these icons are available
import * as XLSX from 'xlsx';

const AgentTaskConfig = () => {
  const { agentId } = useParams<{ agentId: string }>();

  // State for scheduler settings
  const [frequency, setFrequency] = useState('daily'); // Default to Daily
  const [time, setTime] = useState('07:00'); // Default to 7:00
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  // Default to use timezone
  const [useTimezone, setUseTimezone] = useState(true);
  const [timeLimit, setTimeLimit] = useState('60');

  // State for data source tab
  const [selectedDataSource, setSelectedDataSource] = useState<'csv' | 'excel' | 'google-sheets' | 'api'>('csv');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<Array<Record<string, any>>>([]); // State to store parsed Excel data

  // Define steps for the indicator
  const steps = [
    { label: 'Scheduler Settings', icon: Clock },
    { label: 'Select Input Data', icon: Database },
    { label: 'Review and Confirm', icon: CheckCircle },
  ];

  const [currentStep, setCurrentStep] = useState(0); // State to manage current step

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDaySelect = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    console.log('Saving configuration for Agent ID:', agentId);
    console.log('Frequency:', frequency);
    console.log('Time:', time);
    console.log('Selected Days:', selectedDays);
    console.log('Use Timezone:', useTimezone);
    console.log('Time Limit (minutes):', timeLimit);
    // Add save logic here
  };

  const handleCancel = () => {
    console.log('Cancelling configuration');
    // Add cancel logic / navigation here
  };

  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExcelFile(file);
      const reader = new FileReader();

      reader.onload = (e) => {
        const binaryStr = e.target?.result;
        if (binaryStr) {
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(data);
          console.log('Excel data parsed:', data);
        }
      };

      reader.readAsBinaryString(file);

      console.log('Excel file selected:', file.name);
    }
  };

  // Dummy data for preview table and column mapping selects
  const previewData = [
    { "Product Name": "Eco-Friendly Water Bottle", "Description": "Durable stainless steel bottle...", "Photo Link": "https://...", "Keywords": "eco, sustainable, water, bottle, stainless steel" },
    { "Product Name": "Organic Cotton T-Shirt", "Description": "Soft, breathable organic cotton...", "Photo Link": "https://...", "Keywords": "organic, cotton, t-shirt, apparel, soft" },
    // Add more dummy data as needed
  ];

  // Use excelData for preview if available, otherwise use dummyData
  const dataToPreview = excelData.length > 0 ? excelData : previewData;
  const dataColumns = Object.keys(dataToPreview.length > 0 ? dataToPreview[0] : {});

  return (
    <div className="flex h-full">
      {/* Step Indicator Sidebar */}
      <div className="w-64 p-6 border-r bg-card text-card-foreground flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Steps</h2>
        <div className="space-y-4 flex-grow">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 cursor-pointer ${index === currentStep ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCurrentStep(index)}
            >
              <step.icon className={`h-5 w-5 ${index === currentStep ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-background text-foreground flex flex-col overflow-y-auto">
        {currentStep === 0 && (
          <>
            <h1 className="text-2xl font-bold mb-2">Scheduler Settings</h1>
            <p className="text-muted-foreground mb-6">Configure the schedule for automated content generation.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Schedule & Time */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Schedule & Time</CardTitle>
                  <p className="text-sm text-muted-foreground">Set the frequency and specific time for content generation.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="frequency" className="bg-background text-foreground">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Repeat Days */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Repeat Days</CardTitle>
                  <p className="text-sm text-muted-foreground">Select the days of the week to repeat the schedule.</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={day} 
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => handleDaySelect(day)}
                        />
                        <Label htmlFor={day}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Options */}
            <Card className="mb-6 bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <p className="text-sm text-muted-foreground">Configure advanced settings for the scheduler.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-timezone">Use Timezone</Label>
                  <Switch 
                    id="use-timezone" 
                    checked={useTimezone} 
                    onCheckedChange={setUseTimezone}
                  />
                </div>
                <div>
                  <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                  <Input 
                    id="time-limit" 
                    type="number" 
                    placeholder="e.g., 60" 
                    value={timeLimit} 
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-auto">
              <Button variant="outline" onClick={handleCancel} className="border-border text-foreground hover:bg-muted">
                Cancel
              </Button>
              <Button onClick={() => handleSave()} className="teampal-button">
                Save Settings
              </Button>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 flex flex-col h-full">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold mb-2 text-foreground">Select Input Data</h1>
              <p className="text-muted-foreground">Select where your content data comes from.</p>

              <div className="mt-4 flex space-x-2">
                <Button 
                  variant={selectedDataSource === 'csv' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('csv')}
                  className={selectedDataSource === 'csv' ? '' : 'border-border text-foreground hover:bg-muted'}
                >
                  Upload CSV
                </Button>
                <Button 
                  variant={selectedDataSource === 'excel' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('excel')}
                  className={selectedDataSource === 'excel' ? '' : 'border-border text-foreground hover:bg-muted'}
                >
                  Upload Excel
                </Button>
                <Button 
                  variant={selectedDataSource === 'google-sheets' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('google-sheets')}
                  className={selectedDataSource === 'google-sheets' ? '' : 'border-border text-foreground hover:bg-muted'}
                >
                  Google Sheets
                </Button>
                <Button 
                  variant={selectedDataSource === 'api' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('api')}
                  className={selectedDataSource === 'api' ? '' : 'border-border text-foreground hover:bg-muted'}
                >
                  API
                </Button>
              </div>

              {selectedDataSource === 'csv' && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-card text-card-foreground">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Upload CSV File</h3>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleExcelFileChange} // Reusing handler for now, assuming it can handle CSV structure
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Please ensure your CSV file is comma-separated.</p>
                </div>
              )}

              {selectedDataSource === 'excel' && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-card text-card-foreground">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Excel File</h3>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleExcelFileChange}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Accepted formats: .xlsx, .xls</p>
                  </div>
              )}

              {selectedDataSource === 'google-sheets' && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-card text-card-foreground">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Connect Google Sheet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Enter the shareable link to your Google Sheet.</p>
                  <Input placeholder="Google Sheet Link" className="bg-background text-foreground" />
                  <Button className="teampal-button mt-2">Connect</Button>
                </div>
              )}

              {selectedDataSource === 'api' && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-card text-card-foreground">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Connect API</h3>
                  <p className="text-sm text-muted-foreground mb-4">Enter the API endpoint to fetch data.</p>
                  <Input placeholder="API Endpoint" className="bg-background text-foreground" />
                  <Button className="teampal-button mt-2">Connect</Button>
                </div>
              )}
            </div>

            {/* Data Preview Section (Conditional) */}
            {dataToPreview.length > 0 && (
              <div className="mt-6 space-y-4 flex-1 flex flex-col flex-shrink-0">
                 <h2 className="text-xl font-semibold text-foreground">Data Preview</h2>
                 <div className="overflow-auto flex-shrink-0 max-h-[200px]">
                   <table className="w-full table-auto border-collapse border border-border">
                      <thead>
                         <tr className="bg-muted text-muted-foreground">
                      {dataColumns.map(col => (
                               <th key={col} className="px-4 py-2 text-left text-sm font-medium border border-border">{col}</th>
                      ))}
                    </tr>
                  </thead>
                      <tbody>
                         {dataToPreview.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex} className="even:bg-background odd:bg-card text-card-foreground">
                        {dataColumns.map(col => (
                                  <td key={`${rowIndex}-${col}`} className="px-4 py-2 text-sm border border-border overflow-hidden text-ellipsis whitespace-nowrap">{String(row[col])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                 {/* Column Mapping Section */}
                 <div className="space-y-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-foreground">Column Mapping</h2>
                    <p className="text-sm text-muted-foreground">Map your data columns to the agent's required fields.</p>
                    {/* Placeholder for mapping inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Example mapping input */}
                <div>
                          <Label htmlFor="product-name-mapping">Product Name</Label>
                  <Select>
                             <SelectTrigger id="product-name-mapping" className="bg-background text-foreground border-border">
                                <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                       {/* Add more mapping inputs as needed based on agent requirements */}
                </div>
                </div>
              </div>
            )}

             {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-auto flex-shrink-0">
              <Button variant="outline" onClick={() => setCurrentStep(0)} className="border-border text-foreground hover:bg-muted">
                Previous
              </Button>
              <Button onClick={() => setCurrentStep(2)} className="teampal-button">
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Review and Confirm</h1>
            <p className="text-muted-foreground mb-6">Review your task configuration before saving.</p>
            
            {/* Summary Section */}
            <Card className="bg-card text-card-foreground flex-shrink-0">
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Scheduler:</strong> {frequency} at {time} (Days: {selectedDays.join(', ')})</p>
                <p><strong>Data Source:</strong> {selectedDataSource === 'csv' ? 'CSV Upload' : selectedDataSource === 'excel' ? 'Excel Upload' : selectedDataSource === 'google-sheets' ? 'Google Sheets' : 'API'}</p>
                {/* Add more summary details based on selected data source and mapping */}
                <p><em>(More details will be shown here based on your selections)</em></p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 mt-auto flex-shrink-0">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-border text-foreground hover:bg-muted">
                Previous
              </Button>
              <Button onClick={() => handleSave()} className="teampal-button">
                Save Task
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTaskConfig; 