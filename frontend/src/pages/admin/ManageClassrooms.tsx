
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { Classroom } from '@/types';
import { classroomsApi } from '@/services/realApi';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MoreVertical, Plus, Search } from 'lucide-react';

const ManageClassrooms = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState<Partial<Classroom>>({
    name: '',
    capacity: 0,
    building: '',
    floor: 0,
    roomNumber: '',
    features: [],
    available: true
  });

  // Features options
  const featureOptions = [
    { id: 'projector', label: 'Projector' },
    { id: 'computer', label: 'Computer' },
    { id: 'whiteboard', label: 'Whiteboard' },
    { id: 'smart_board', label: 'Smart Board' },
    { id: 'audio_system', label: 'Audio System' },
    { id: 'video_conference', label: 'Video Conferencing' },
    { id: 'wheelchair_access', label: 'Wheelchair Access' },
    { id: 'air_conditioning', label: 'Air Conditioning' },
  ];

  // Fetch classrooms data
  const { data: classrooms, isLoading, refetch } = useQuery({
    queryKey: ['classrooms'],
    queryFn: classroomsApi.getClassrooms,
  });

  // Redirect if not admin - moved after all hooks are called
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  // Filter classrooms based on search query
  const filteredClassrooms = classrooms 
    ? classrooms.filter(classroom => 
        classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const currentFeatures = prev.features || [];
      if (currentFeatures.includes(feature)) {
        return { ...prev, features: currentFeatures.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...currentFeatures, feature] };
      }
    });
  };

  const openEditDialog = (classroom: Classroom) => {
    setIsEditing(true);
    setSelectedClassroom(classroom);
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity,
      building: classroom.building,
      floor: classroom.floor,
      roomNumber: classroom.roomNumber,
      features: classroom.features,
      available: classroom.available
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setIsEditing(false);
    setSelectedClassroom(null);
    setFormData({
      name: '',
      capacity: 0,
      building: '',
      floor: 0,
      roomNumber: '',
      features: [],
      available: true
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && selectedClassroom) {
        // Update existing classroom
        await classroomsApi.updateClassroom(selectedClassroom.id, formData);
        toast({
          title: "Classroom updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add new classroom
        await classroomsApi.addClassroom(formData as Omit<Classroom, 'id'>);
        toast({
          title: "Classroom added",
          description: `${formData.name} has been added successfully.`,
        });
      }
      
      // Close dialog and refetch data
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await classroomsApi.deleteClassroom(id);
        toast({
          title: "Classroom deleted",
          description: `${name} has been deleted successfully.`,
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete classroom. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Classrooms</h1>
            <p className="text-muted-foreground mt-2">
              Add, edit, or remove classrooms from the system.
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Classroom
          </Button>
        </div>
        
        <Separator />
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                placeholder="Search classrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredClassrooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No classrooms found.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Capacity</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead className="text-center">Features</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClassrooms.map(classroom => (
                      <TableRow key={classroom.id}>
                        <TableCell className="font-medium">{classroom.name}</TableCell>
                        <TableCell>{`${classroom.building}, Floor ${classroom.floor}, Room ${classroom.roomNumber}`}</TableCell>
                        <TableCell className="text-center">{classroom.capacity}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch 
                              checked={classroom.available}
                              onCheckedChange={async (checked) => {
                                try {
                                  await classroomsApi.updateClassroom(classroom.id, { available: checked });
                                  refetch();
                                  toast({
                                    title: `Classroom ${checked ? 'enabled' : 'disabled'}`,
                                    description: `${classroom.name} is now ${checked ? 'available' : 'unavailable'} for booking.`,
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                }
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {classroom.features?.length || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(classroom)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(classroom.id, classroom.name)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Add/Edit Classroom Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Classroom' : 'Add New Classroom'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update classroom details below.' : 'Enter classroom details below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Classroom Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Computer Lab 101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.building || ''}
                    onChange={(e) => setFormData({...formData, building: e.target.value})}
                    placeholder="e.g., Science Block"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor || ''}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    placeholder="e.g., A101"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {featureOptions.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.id}
                        checked={formData.features?.includes(feature.id)}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                      />
                      <label
                        htmlFor={feature.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({...formData, available: checked})}
                />
                <Label htmlFor="available">Available for booking</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Add Classroom'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ManageClassrooms;
