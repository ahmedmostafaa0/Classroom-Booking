import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";
import { authApi, usersApi } from '@/services/realApi';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Call the real API to update the user profile
      const updatedUser = await usersApi.updateUserProfile(user.id, {
        name: profileData.name,
        avatar: profileData.avatar
      });
      
      // Update the user in the auth context
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Call the real API to change password
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6  p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <Separator />

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-1/3">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">{user.name}</CardTitle>
                <CardDescription className="mt-1">{user.email}</CardDescription>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                  {user.role === 'admin' ? 'Administrator' : user.role === 'faculty' ? 'Faculty' : 'Student'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Account created: <span className="font-medium">April 12, 2023</span>
              </p>
            </CardContent>
          </Card>
          
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <form onSubmit={handleProfileUpdate}>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          readOnly
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          To change your email, please contact support.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                          id="avatar"
                          value={profileData.avatar}
                          onChange={(e) => setProfileData({...profileData, avatar: e.target.value})}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <form onSubmit={handlePasswordChange}>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                        />
                      </div>

                      <Alert>
                        <AlertDescription>
                          Password must be at least 6 characters long and contain a mix of letters, numbers, and special characters.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
