import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types';
import { bookingsApi } from '@/services/realApi';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MoreVertical, Search, Calendar, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const ManageBookings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['status']>('confirmed');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch bookings data
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: bookingsApi.getBookings,
    // Ensure query is always up-to-date
    staleTime: 0,
  });

  // Redirect if not admin - moved after all hooks are called
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  // Apply filters to bookings
  const filteredBookings = bookings.filter(booking => {
    // Apply search filter
    const matchesSearch = 
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.classroomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Apply date filter
    const matchesDate = !dateFilter || booking.date === format(dateFilter, 'yyyy-MM-dd');
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleStatusChange = async (booking: Booking, status: Booking['status']) => {
    if (booking.status === status) return; // No change needed
    
    setSelectedBooking(booking);
    setNewStatus(status);
    setIsConfirmDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;
    
    setIsProcessing(true);
    try {
      await bookingsApi.updateBookingStatus(selectedBooking.id, newStatus);
      toast({
        title: "Booking updated",
        description: `Booking for ${selectedBooking.classroomName} has been ${newStatus}.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (window.confirm(`Are you sure you want to delete this booking for ${booking.classroomName}?`)) {
      setIsProcessing(true);
      try {
        await bookingsApi.deleteBooking(booking.id);
        toast({
          title: "Booking deleted",
          description: `Booking for ${booking.classroomName} has been deleted.`,
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete booking. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getStatusBadgeClass = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 ring-green-600/20";
      case "pending":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-red-600/20";
      case "rejected":
        return "bg-purple-50 text-purple-700 ring-purple-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20";
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter(undefined);
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all classroom bookings in the system.
          </p>
        </div>
        
        <Separator />
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center w-full sm:w-auto">
                <Search className="h-5 w-5 text-muted-foreground mr-2" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[150px] justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, 'PP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(searchQuery || statusFilter !== 'all' || dateFilter) && (
                  <Button variant="ghost" onClick={clearFilters} size="sm">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings found.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Classroom</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map(booking => {
                      const bookingDate = parseISO(`${booking.date}T${booking.startTime}`);
                      const isPastBooking = isPast(bookingDate);
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="font-medium">{booking.userName}</div>
                            <div className="text-sm text-muted-foreground">ID: {booking.userId}</div>
                          </TableCell>
                          <TableCell>
                            <div>{booking.classroomName}</div>
                            <div className="text-sm text-muted-foreground">ID: {booking.classroomId}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {isToday(parseISO(booking.date)) && (
                                <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                                  Today
                                </Badge>
                              )}
                              <div>
                                <div>{format(parseISO(booking.date), 'MMM d, yyyy')}</div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.startTime} - {booking.endTime}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={booking.purpose}>
                              {booking.purpose}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Select 
                                defaultValue={booking.status}
                                onValueChange={(value: Booking['status']) => handleStatusChange(booking, value)}
                                disabled={booking.status === 'cancelled' || booking.status === 'rejected'}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Change status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="confirmed">Confirm</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                  <SelectItem value="cancelled">Cancel</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteBooking(booking)}
                                    disabled={isProcessing}
                                    className="text-destructive"
                                  >
                                    {isProcessing && selectedBooking?.id === booking.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      'Delete Booking'
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination - only show if there are more than 7 bookings */}
            {filteredBookings.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              You are about to change the booking status for {selectedBooking?.classroomName} to <strong>{newStatus}</strong>.
              {newStatus === 'rejected' && " This will notify the user that their booking has been rejected."}
              {newStatus === 'confirmed' && " This will confirm the booking and notify the user."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Change'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ManageBookings;
