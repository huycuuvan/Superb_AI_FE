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
  const [frequency, setFrequency] = useState('daily'); // Default to Hàng ngày
  const [time, setTime] = useState('07:00'); // Default to 7h
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  // Default to use timezone, though specific +7 isn't set without input field
  const [useTimezone, setUseTimezone] = useState(true);
  const [timeLimit, setTimeLimit] = useState('60');

  // State for data source tab
  const [selectedDataSource, setSelectedDataSource] = useState<'csv' | 'excel' | 'google-sheets' | 'api'>('csv');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<Array<Record<string, any>>>([]); // State to store parsed Excel data

  // Define steps for the indicator
  const steps = [
    { label: 'Thiết lập bộ hẹn giờ', icon: Clock },
    { label: 'Chọn dữ liệu đầu vào', icon: Database },
    { label: 'Xem lại và xác nhận', icon: CheckCircle },
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
    <div className="flex">
      {/* Step Indicator Sidebar */}
      <div className="w-64 p-6 border-r bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Các bước</h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 cursor-pointer ${index === currentStep ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              onClick={() => setCurrentStep(index)}
            >
              <step.icon className={`h-5 w-5 ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white">
        {currentStep === 0 && (
          <>
            <h1 className="text-2xl font-bold mb-2">Thiết lập bộ hẹn giờ</h1>
            <p className="text-muted-foreground mb-6">Cấu hình lịch trình cho việc tạo nội dung tự động.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Lịch trình & Thời gian */}
              <Card>
                <CardHeader>
                  <CardTitle>Lịch trình & Thời gian</CardTitle>
                  <p className="text-sm text-muted-foreground">Đặt tần suất và thời gian cụ thể cho việc tạo nội dung.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="frequency">Tần suất</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Chọn tần suất" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Hàng ngày</SelectItem>
                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Thời gian</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ngày lặp lại */}
              <Card>
                <CardHeader>
                  <CardTitle>Ngày lặp lại</CardTitle>
                  <p className="text-sm text-muted-foreground">Chọn các ngày trong tuần để lặp lại lịch trình.</p>
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

            {/* Tùy chọn nâng cao */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tùy chọn nâng cao</CardTitle>
                <p className="text-sm text-muted-foreground">Cấu hình các cài đặt nâng cao cho bộ hẹn giờ.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-timezone">Sử dụng múi giờ</Label>
                  <Switch 
                    id="use-timezone" 
                    checked={useTimezone} 
                    onCheckedChange={setUseTimezone}
                  />
                </div>
                <div>
                  <Label htmlFor="time-limit">Giới hạn thời lượng (phút)</Label>
                  <Input 
                    id="time-limit" 
                    type="number" 
                    placeholder="Ví dụ: 60" 
                    value={timeLimit} 
                    onChange={(e) => setTimeLimit(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCancel}>Hủy bỏ</Button>
              <Button onClick={() => handleSave()}>Lưu cài đặt</Button>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">1. Connect Data Source</h1>
              <p className="text-muted-foreground">Select where your content data comes from.</p>

              <div className="mt-4 flex space-x-2">
                <Button 
                  variant={selectedDataSource === 'csv' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('csv')}
                >
                  Upload CSV
                </Button>
                <Button 
                  variant={selectedDataSource === 'excel' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('excel')}
                >
                  Upload Excel
                </Button>
                <Button 
                  variant={selectedDataSource === 'google-sheets' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('google-sheets')}
                >
                  Google Sheets
                </Button>
                <Button 
                  variant={selectedDataSource === 'api' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('api')}
                >
                  API
                </Button>
              </div>

              {selectedDataSource === 'csv' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="csv-file">Upload your CSV file</Label>
                    <Input id="csv-file" type="file" accept=".csv" />
                  </div>
                  <Button>Upload File</Button>
                  {/* Assuming a success message display logic here */}
                  <p className="text-green-600 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" /> Source connected successfully!
                  </p>
                </div>
              )}

              {selectedDataSource === 'excel' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="excel-file">Upload your Excel file</Label>
                    <Input id="excel-file" type="file" accept=".xls,.xlsx" onChange={handleExcelFileChange} />
                  </div>
                  {/* TODO: Add button to trigger Excel file processing if needed, or process on file change */}
                  {/* Assuming a success message display logic here */}
                  {excelData.length > 0 && (
                     <p className="text-green-600 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" /> File loaded and parsed successfully!
                     </p>
                  )}
                </div>
              )}

              {/* Add UI for Google Sheets and API if needed */}

            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">2. Preview & Select Data</h1>
              <p className="text-muted-foreground">Preview the first few rows of your connected data.</p>
              
              {/* Data Preview Table */}
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {dataColumns.map(col => (
                        <th key={col} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataToPreview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {dataColumns.map(col => (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[col] as React.ReactNode}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">3. Map Columns</h1>
              <p className="text-muted-foreground">Match your data columns to the required content fields.</p>
              
              {/* Column Mapping */}
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="content-title-map">Content Title</Label>
                  <Select>
                    <SelectTrigger id="content-title-map">
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="content-body-map">Content Body</Label>
                  <Select>
                    <SelectTrigger id="content-body-map">
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image-url-map">Image URL</Label>
                  <Select>
                    <SelectTrigger id="image-url-map">
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="tags-keywords-map">Tags/Keywords</Label>
                  <Select>
                    <SelectTrigger id="tags-keywords-map">
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="author-name-map">Author Name</Label>
                  <Select>
                    <SelectTrigger id="author-name-map">
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="category-map">Category</Label>
                  <Select>
                    <SelectTrigger id="category-map">
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                       {dataColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

             {/* Navigation Buttons */}
             <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>Previous</Button>
              <Button onClick={() => setCurrentStep(2)}>Next: Content Setup</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-2">Xem lại và xác nhận</h1>
            <p className="text-muted-foreground mb-6">Xem lại các cài đặt đã cấu hình trước khi xác nhận.</p>
            
            {/* Review Section: Scheduler & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch trình & Thời gian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Tần suất:</strong> {frequency || 'Chưa chọn'}</p>
                <p><strong>Thời gian:</strong> {time || 'Chưa chọn'}</p>
                <p><strong>Ngày lặp lại:</strong> {selectedDays.length > 0 ? selectedDays.join(', ') : 'Chưa chọn'}</p>
                <p><strong>Sử dụng múi giờ:</strong> {useTimezone ? 'Có' : 'Không'}</p>
                <p><strong>Giới hạn thời lượng (phút):</strong> {timeLimit || 'Chưa đặt'}</p>
              </CardContent>
            </Card>

            {/* Review Section: Data Source */}
            <Card>
              <CardHeader>
                <CardTitle>Dữ liệu đầu vào</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Nguồn dữ liệu:</strong> {selectedDataSource === 'csv' ? 'Upload CSV' : selectedDataSource === 'google-sheets' ? 'Google Sheets' : selectedDataSource === 'api' ? 'API' : 'Chưa chọn'}</p>
                 {/* You might want to add more details here based on the selected data source */}
              </CardContent>
            </Card>

            {/* Review Section: Column Mapping - You might display a summary of mapped columns here */}
             <Card>
              <CardHeader>
                <CardTitle>Ánh xạ cột</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tóm tắt ánh xạ cột sẽ hiển thị ở đây.</p>
                 {/* Implement logic to display mapped columns */}
              </CardContent>
            </Card>


            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Previous</Button>
              <Button onClick={() => handleSave()}>Confirm and Save</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTaskConfig; 