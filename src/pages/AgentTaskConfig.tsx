/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Database, CheckCircle } from 'lucide-react'; // Assuming these icons are available
import * as XLSX from 'xlsx';
import { useTheme } from '@/hooks/useTheme';
// Thêm toast
import { useToast } from '@/hooks/use-toast';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { createScheduledTask } from '@/services/api';

const AgentTaskConfig = () => {
  const { agentId: agentIdParam, taskId: taskIdParam } = useParams<{ agentId: string, taskId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { workspace } = useSelectedWorkspace();
  const isDark = theme === 'dark';

  // Nhận inputData từ location.state nếu có
  const inputDataFromState = location.state?.inputData;
  const agentId = location.state?.agentId || agentIdParam;
  const taskId = location.state?.taskId || taskIdParam;

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

  // State cho dữ liệu đầu vào (ví dụ prompt)
  const [inputPrompt, setInputPrompt] = useState(inputDataFromState?.prompt || '');
  // Thêm state cho name, description
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Stepper
  const steps = [
    { label: 'Scheduler Settings', icon: Clock },
    { label: 'Select Input Data', icon: Database },
    { label: 'Review and Confirm', icon: CheckCircle },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDaySelect = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // Validate từng bước
  const validateStep = (step: number) => {
    if (step === 0) {
      if (!frequency || !time) return false;
      if ((frequency === 'daily' || frequency === 'weekly') && selectedDays.length === 0) return false;
      if (!timeLimit || isNaN(Number(timeLimit)) || Number(timeLimit) <= 0) return false;
      return true;
    }
    if (step === 1) {
      if (inputPrompt.trim() === '') return false;
      if (!name.trim() || !description.trim()) return false;
      // KHÔNG bắt buộc upload file nữa
      return true;
    }
    return true;
  };

  // Điều hướng bước tiếp theo
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập đủ thông tin trước khi tiếp tục.', variant: 'destructive' });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  // Điều hướng bước trước
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Xử lý lưu task (gọi API thật)
  const handleSaveTask = async () => {
    if (!validateStep(1)) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập đủ thông tin trước khi lưu.', variant: 'destructive' });
      return;
    }
    if (!workspace?.id || !agentId || !taskId) {
      toast({ title: 'Thiếu thông tin', description: 'Thiếu workspace, agent hoặc task.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Build schedule_config
      const schedule_config: any = { time };
      if (frequency === 'weekly') schedule_config.day_of_week = selectedDays.map(day => daysOfWeek.indexOf(day));
      if (frequency === 'monthly') schedule_config.day_of_month = 1; // Có thể cho user chọn
      // Build payload
      const payload = {
        agent_id: agentId,
        workspace_id: workspace.id,
        task_id: taskId,
        name: name.trim(),
        description: description.trim(),
        schedule_type: frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
        schedule_config,
        auto_create_conversation: true,
        conversation_template: {
          input_data: { prompt: inputPrompt }
        }
      };
      await createScheduledTask(payload);
      toast({ title: 'Thành công', description: 'Đã lưu cấu hình Scheduled Task!' });
      navigate('/dashboard/scheduled-tasks');
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra khi lưu task.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
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
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(data);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Chỉ preview nếu có dữ liệu thực tế từ file upload
  const dataToPreview = excelData;
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
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button className="button-gradient-light dark:button-gradient-dark text-white" onClick={handleNext} disabled={!validateStep(0)}>
                Next
              </Button>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 flex flex-col h-full">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold mb-2 text-foreground">Select Input Data</h1>
              <p className="text-muted-foreground">Select where your content data comes from.</p>
              {/* Thêm input cho prompt nếu có inputDataFromState */}
              {inputDataFromState && (
                <div className="mt-4">
                  <Label htmlFor="input-prompt">Prompt từ lần chạy trước</Label>
                  <Input
                    id="input-prompt"
                    value={inputPrompt}
                    onChange={e => setInputPrompt(e.target.value)}
                    className="bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Đã tự động điền prompt từ lần chạy trước. Bạn có thể chỉnh sửa lại nếu muốn.</p>
                </div>
              )}
              {/* Thêm input cho name, description */}
              <div className="mt-4">
                <Label htmlFor="task-name">Tên lịch trình <span className="text-red-500">*</span></Label>
                <Input
                  id="task-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên lịch trình"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="task-desc">Mô tả <span className="text-red-500">*</span></Label>
                <Input
                  id="task-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Nhập mô tả cho lịch trình"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="mt-4 flex space-x-2">
                <Button 
                  variant={selectedDataSource === 'csv' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('csv')}
                  className={selectedDataSource === 'csv' ? `${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white` : 'border-border text-foreground hover:bg-muted'}
                >
                  Upload CSV
                </Button>
                <Button 
                  variant={selectedDataSource === 'excel' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('excel')}
                  className={selectedDataSource === 'excel' ? `${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white` : 'border-border text-foreground hover:bg-muted'}
                >
                  Upload Excel
                </Button>
                <Button 
                  variant={selectedDataSource === 'google-sheets' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('google-sheets')}
                  className={selectedDataSource === 'google-sheets' ? `${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white` : 'border-border text-foreground hover:bg-muted'}
                >
                  Google Sheets
                </Button>
                <Button 
                  variant={selectedDataSource === 'api' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('api')}
                  className={selectedDataSource === 'api' ? `${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white` : 'border-border text-foreground hover:bg-muted'}
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

            {/* Data Preview & Column Mapping chỉ hiển thị nếu có dữ liệu thực tế */}
            {dataToPreview.length > 0 ? (
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
            ) : (
              <div className="mt-6 text-muted-foreground text-sm">Vui lòng upload file để xem trước dữ liệu.</div>
            )}

             {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-auto flex-shrink-0">
              <Button variant="outline" onClick={handlePrev} className="border-border text-foreground hover:bg-muted" disabled={loading}>
                Previous
              </Button>
              <Button onClick={handleNext} className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`} disabled={!validateStep(1)}>
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
                <p><strong>Scheduler:</strong> {frequency} at {time} (Days: {selectedDays.length > 0 ? selectedDays.join(', ') : 'Chưa chọn'})</p>
                <p><strong>Time Limit:</strong> {timeLimit} phút</p>
                <p><strong>Timezone:</strong> {useTimezone ? 'Có' : 'Không'}</p>
                <p><strong>Prompt:</strong> {inputPrompt ? inputPrompt : <span className="italic">Chưa nhập</span>}</p>
                <p><strong>Data Source:</strong> {
                  selectedDataSource === 'csv' ? 'CSV Upload' :
                  selectedDataSource === 'excel' ? 'Excel Upload' :
                  selectedDataSource === 'google-sheets' ? 'Google Sheets' : 'API'
                }</p>
                {(selectedDataSource === 'csv' || selectedDataSource === 'excel') && excelFile && (
                  <p><strong>File đã upload:</strong> {excelFile.name} ({excelData.length} dòng)</p>
                )}
                {(selectedDataSource === 'csv' || selectedDataSource === 'excel') && !excelFile && (
                  <p><strong>File đã upload:</strong> <span className="italic">Chưa upload</span></p>
                )}
                {/* Có thể bổ sung mapping info nếu có */}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 mt-auto flex-shrink-0">
              <Button variant="outline" onClick={handlePrev} className="border-border text-foreground hover:bg-muted" disabled={loading}>
                Previous
              </Button>
              <Button className="teampal-button" onClick={handleSaveTask} disabled={loading}>
                {loading ? 'Saving...' : 'Save Task'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTaskConfig; 