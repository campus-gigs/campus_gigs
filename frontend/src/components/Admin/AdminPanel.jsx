import React, { useState, useEffect } from 'react';
import { Users, Briefcase, AlertTriangle, TrendingUp, Ban, Trash2, Search, Ghost } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { adminAPI } from '../../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchJob, setSearchJob] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, jobsRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getJobs({ limit: 50 }),
        adminAPI.getReports({ status: 'pending' }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setJobs(jobsRes.data.jobs);
      setReports(reportsRes.data.reports);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const response = await adminAPI.banUser(userId);
      toast.success(response.data.msg);
      setUsers(users.map((u) => (u._id === userId ? { ...u, isBanned: !u.isBanned } : u)));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update user');
    }
  };


  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await adminAPI.deleteJob(jobId);
      toast.success('Job deleted');
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete job');
    }
  };

  const handleImpersonate = async (userId, userName) => {
    if (!window.confirm(`⚠️ GOD MODE: Login as ${userName}?`)) return;
    try {
      const response = await adminAPI.impersonateUser(userId);
      await login(response.data.token);
      toast.success(`Now logged in as ${userName}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Impersonation failed');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchJob.toLowerCase()) ||
      j.description?.toLowerCase().includes(searchJob.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.overview?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.overview?.totalJobs || 0}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.overview?.openJobs || 0}</p>
                <p className="text-sm text-muted-foreground">Open Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <Card key={user._id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                    {user.role === 'admin' && <Badge>Admin</Badge>}
                  </div>
                  {user.role !== 'admin' && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleImpersonate(user._id, user.name)}
                        title="God Mode: Login as User"
                      >
                        <Ghost className="w-4 h-4 mr-1" />
                        Login As
                      </Button>
                      <Button
                        variant={user.isBanned ? 'outline' : 'destructive'}
                        size="sm"
                        onClick={() => handleBanUser(user._id)}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10"
              value={searchJob}
              onChange={(e) => setSearchJob(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredJobs.map((job) => (
              <Card key={job._id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      By {job.postedBy?.name || 'Unknown'} • ₹{job.paymentAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === 'open' ? 'success' : 'secondary'}>
                      {job.status}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteJob(job._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending reports
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <Card key={report._id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {report.targetType === 'job' ? 'Job Report' : 'User Report'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reported by {report.reportedBy?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant="warning">{report.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
