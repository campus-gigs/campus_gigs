import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Phone, FileText, Star, Briefcase, CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../utils/api';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState({ jobsPosted: 0, jobsCompleted: 0, averageRating: 0 });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  });

  // Delete Account State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isMyProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    if (isMyProfile && currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
      });
      setProfileUser(currentUser);
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser, isMyProfile]);

  const fetchProfile = async () => {
    try {
      if (isMyProfile) {
        const response = await profileAPI.getProfile();
        setStats(response.data.stats);
      } else {
        const response = await profileAPI.getPublicProfile(userId);
        setProfileUser(response.data.user);
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileAPI.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'delete account') {
      return;
    }

    setDeleteLoading(true);
    try {
      await profileAPI.deleteAccount();
      toast.success('Account deleted successfully');
      setDeleteDialogOpen(false);
      logout();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  if (!profileUser && !isMyProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const displayUser = isMyProfile ? currentUser : profileUser;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Avatar className="w-20 h-20">
              <AvatarImage src={displayUser?.profilePhoto || "/logo.svg"} className="object-cover" />
              <AvatarFallback className="text-2xl">
                {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold font-display">{displayUser?.name}</h2>
              <p className="text-muted-foreground">{displayUser?.email}</p>
              {displayUser?.bio && (
                <p className="text-sm text-foreground/80 mt-2 max-w-md">{displayUser.bio}</p>
              )}
              {displayUser?.rating > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{displayUser.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({displayUser.ratingCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isMyProfile && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.jobsPosted || 0}</p>
              <p className="text-sm text-muted-foreground">Jobs Posted</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.jobsCompleted}</p>
            <p className="text-sm text-muted-foreground">Jobs Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{stats.averageRating || '-'}</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit profile form - ONLY for My Profile */}
      {isMyProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={displayUser?.email || ''}
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Your phone number"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    className="pl-10"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone - ONLY for My Profile */}
      {isMyProfile && (
        <Card className="border-destructive/20 mb-8">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your account and all your data.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                To confirm, type <span className="font-bold select-none">delete account</span> below:
              </Label>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="delete account"
                className="border-destructive/50 focus-visible:ring-destructive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmationText('');
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== 'delete account' || deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
