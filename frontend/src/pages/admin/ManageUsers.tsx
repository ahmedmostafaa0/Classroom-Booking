
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UserRole } from '@/types';
import { usersApi } from '@/services/realApi';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MoreVertical, Search } from 'lucide-react';

const ManageUsers = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users data
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });

  // Redirect if not admin - moved after all hooks are called
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  // Filter users based on search query
  const filteredUsers = users 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleRoleChange = async (user: User, role: UserRole) => {
    if (user.role === role) return; // No change needed
    
    if (user.role === 'admin' && role !== 'admin') {
      // Downgrading an admin, show confirmation dialog
      setSelectedUser(user);
      setNewRole(role);
      setIsConfirmDialogOpen(true);
      return;
    }
    
    // For other role changes, proceed directly
    await updateUserRole(user, role);
  };

  const updateUserRole = async (user: User, role: UserRole) => {
    try {
      await usersApi.updateUserRole(user.id, role);
      toast({
        title: "Role updated",
        description: `${user.name}'s role has been updated to ${role}.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
    setIsConfirmDialogOpen(false);
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'admin') {
      toast({
        title: "Cannot delete admin",
        description: "You cannot delete administrator accounts.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedUser(user);
    setIsDeleting(true);
    try {
      await usersApi.deleteUser(user.id);
      toast({
        title: "User deleted",
        description: `${user.name} has been removed from the system.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };

  const confirmRoleChange = () => {
    if (selectedUser && newRole) {
      updateUserRole(selectedUser, newRole);
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground mt-2">
            View and manage user accounts and permissions.
          </p>
        </div>
        
        <Separator />
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center space-x-2">
                            <Select 
                              defaultValue={user.role}
                              onValueChange={(value: UserRole) => handleRoleChange(user, value)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
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
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={user.role === 'admin' || isDeleting}
                                  className={user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : 'text-destructive'}
                                >
                                  {isDeleting && selectedUser?.id === user.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete User'
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              You are about to change {selectedUser?.name}'s role from admin to {newRole}. 
              This will remove their administrative privileges.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ManageUsers;
