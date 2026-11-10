
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileText, Loader2, Table as TableIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

const ExportData = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const today = new Date();
  
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(today, 30));
  const [toDate, setToDate] = useState<Date | undefined>(today);
  const [dataType, setDataType] = useState<string>('bookings');
  const [fileFormat, setFileFormat] = useState<string>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleQuickDateSelect = (option: string) => {
  switch (option) {
    case 'today': {
      setFromDate(today);
      setToDate(today);
      break;
    }
    case 'yesterday': {
      const yesterday = subDays(today, 1);
      setFromDate(yesterday);
      setToDate(yesterday);
      break;
    }
    case 'last7days': {
      setFromDate(subDays(today, 6));
      setToDate(today);
      break;
    }
    case 'last30days': {
      setFromDate(subDays(today, 29));
      setToDate(today);
      break;
    }
    case 'thisMonth': {
      setFromDate(startOfMonth(today));
      setToDate(endOfMonth(today));
      break;
    }
    default:
      break;
  }
};


  const handleExport = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Date range required",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (fromDate > toDate) {
      toast({
        title: "Invalid date range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Call the backend API for real data export
      const response = await fetch('http://localhost:5000/api/exports/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dataType,
          fileFormat,
          fromDate: format(fromDate, 'yyyy-MM-dd'),
          toDate: format(toDate, 'yyyy-MM-dd')
        })
      });
      
      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}_${format(fromDate, 'yyyyMMdd')}_${format(toDate, 'yyyyMMdd')}.${fileFormat}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${dataType} data has been exported to ${fileFormat.toUpperCase()} format.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
          <p className="text-muted-foreground mt-2">
            Export various data from the system for reporting and analysis.
          </p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="reports">Saved Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Data to Export</CardTitle>
                  <CardDescription>
                    Choose the type of data, date range, and file format.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <Select value={dataType} onValueChange={setDataType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bookings">Booking Data</SelectItem>
                        <SelectItem value="classrooms">Classroom Data</SelectItem>
                        <SelectItem value="users">User Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>File Format</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          type="button" 
                          variant={fileFormat === 'csv' ? 'default' : 'outline'}
                          className="w-28"
                          onClick={() => setFileFormat('csv')}
                        >
                          <TableIcon className="mr-2 h-4 w-4" />
                          CSV
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          type="button" 
                          variant={fileFormat === 'pdf' ? 'default' : 'outline'}
                          className="w-28"
                          onClick={() => setFileFormat('pdf')}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="from" className="text-xs text-muted-foreground">From</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="from"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !fromDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={fromDate}
                              onSelect={setFromDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="to" className="text-xs text-muted-foreground">To</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="to"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !toDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {toDate ? format(toDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={toDate}
                              onSelect={setToDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quick Select</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDateSelect('today')}>
                        Today
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDateSelect('yesterday')}>
                        Yesterday
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDateSelect('last7days')}>
                        Last 7 Days
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDateSelect('last30days')}>
                        Last 30 Days
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDateSelect('thisMonth')}>
                        This Month
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleExport}
                    disabled={isExporting || !fromDate || !toDate}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export {dataType}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>
                      Preview of the data that will be exported
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] rounded-md border border-dashed flex items-center justify-center bg-muted/50">
                      {dataType === 'bookings' && (
                        <div className="text-center p-4">
                          <TableIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Booking data includes reservation details, user information, classroom assignments, dates, times, and status.
                          </p>
                        </div>
                      )}
                      {dataType === 'classrooms' && (
                        <div className="text-center p-4">
                          <TableIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Classroom data includes room names, locations, capacity, features, and availability status.
                          </p>
                        </div>
                      )}
                      {dataType === 'users' && (
                        <div className="text-center p-4">
                          <TableIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            User data includes names, email addresses, roles, and account creation dates.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Export Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">Data Type:</div>
                      <div className="text-sm font-medium">
                        {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
                      </div>
                      <div className="text-sm">Format:</div>
                      <div className="text-sm font-medium">
                        {fileFormat.toUpperCase()}
                      </div>
                      <div className="text-sm">Date Range:</div>
                      <div className="text-sm font-medium">
                        {fromDate && toDate ? `${format(fromDate, "MMM d, yyyy")} - ${format(toDate, "MMM d, yyyy")}` : "Not selected"}
                      </div>
                      <div className="text-sm">Fields Included:</div>
                      <div className="text-sm font-medium">All</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>
                  View and download your previously saved reports
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground">No saved reports yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Export data and save the report to access it here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ExportData;
