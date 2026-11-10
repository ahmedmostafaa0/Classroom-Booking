import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ManageContactMessages = () => {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contact`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      updateMessageStatus(message.id, 'read');
    }
  };

  const updateMessageStatus = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update message status');
      }
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status } : msg
      ));
      
      // If viewing the message in dialog, update selected message
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      
      toast({
        title: "Status updated",
        description: `Message marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      // Update local state
      setMessages(messages.filter(msg => msg.id !== id));
      
      // Close dialog if the deleted message was being viewed
      if (selectedMessage && selectedMessage.id === id) {
        setIsDialogOpen(false);
      }
      
      toast({
        title: "Message deleted",
        description: "Contact message has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Unread</Badge>;
      case 'read':
        return <Badge variant="outline">Read</Badge>;
      case 'replied':
        return <Badge variant="success">Replied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
            <p className="text-muted-foreground mt-2">
              Manage and respond to messages from the contact form.
            </p>
          </div>
          <Button onClick={fetchMessages} variant="outline">
            Refresh
          </Button>
        </div>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle>All Messages</CardTitle>
            <CardDescription>
              View and manage all contact form submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contact messages found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} className={message.status === 'unread' ? 'font-medium' : ''}>
                      <TableCell>
                        {format(new Date(message.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewMessage(message)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedMessage && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                From {selectedMessage.name} ({selectedMessage.email}) on {format(new Date(selectedMessage.createdAt), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="status">Status:</Label>
                <Select 
                  value={selectedMessage.status} 
                  onValueChange={(value) => updateMessageStatus(selectedMessage.id, value)}
                >
                  <SelectTrigger id="status" className="w-32">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteMessage(selectedMessage.id)}
              >
                Delete
              </Button>
              <div>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                    updateMessageStatus(selectedMessage.id, 'replied');
                  }}
                >
                  Reply via Email
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </MainLayout>
  );
};

export default ManageContactMessages;

