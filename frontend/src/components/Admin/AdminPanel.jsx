import React, { useState, useEffect } from 'react';
import { Users, Briefcase, AlertTriangle, TrendingUp, Trash2, Search, Ghost, MoreVertical, ShieldAlert, UserMinus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { adminAPI } from '../../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatDialog from '../Jobs/ChatDialog';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchJob, setSearchJob] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { login, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleOpenDirectChat = (user) => {
    setSelectedChatUser(user);
    setShowChat(true);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) fetchUsers();
    if (activeTab === 'jobs' && jobs.length === 0) fetchJobs();
    if (activeTab === 'reports' && reports.length === 0) fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load stats');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ limit: 50 });
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await adminAPI.getJobs({ limit: 50 });
      setJobs(res.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await adminAPI.getReports({ status: 'pending' });
      setReports(res.data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
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

  const handleDeleteUserPermanent = async (userId, userName) => {
    if (!window.confirm(`🔥 DANGER: PERMANENTLY DELETE ${userName}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success(`User ${userName} obliterated.`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, userName, newRole) => {
    if (!window.confirm(`Change ${userName}'s role to ${newRole}?`)) return;
    try {
      await adminAPI.changeRole(userId, newRole);
      toast.success(`User promoted/demoted successfully`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error('Failed to change role');
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
    <div className="space-y-6 max-w-full">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-center md:text-left">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats?.overview?.totalUsers || 0}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-center md:text-left">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats?.overview?.totalJobs || 0}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-center md:text-left">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats?.overview?.openJobs || 0}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-center md:text-left">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{reports.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start h-auto flex flex-wrap gap-2 bg-muted/50 p-1 md:p-2">
          <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          <TabsTrigger value="jobs" className="flex-1">Jobs</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-full"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user._id}>
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name}</p>
                        {user.isBanned && <Badge variant="destructive" className="h-5 text-[10px]">Banned</Badge>}
                        {user.role === 'admin' && <Badge className="h-5 text-[10px]">Admin</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
                    <Button
                      variant={user.isBanned ? 'outline' : 'destructive'}
                      size="sm"
                      onClick={() => handleBanUser(user._id)}
                      className={`flex-1 ${user.isBanned ? "border-red-500 text-red-500" : ""}`}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDirectChat(user)}
                      className="flex-1"
                    >
                      Message
                    </Button>

                    {isSuperAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>God Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleImpersonate(user._id, user.name)}>
                            <Ghost className="w-4 h-4 mr-2" /> Login as User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user._id, user.name, user.role === 'admin' ? 'user' : 'admin')}>
                            {user.role === 'admin' ? <UserMinus className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUserPermanent(user._id, user.name)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 pt-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10 w-full"
              value={searchJob}
              onChange={(e) => setSearchJob(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <Card key={job._id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium line-clamp-1">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.postedBy?.name || 'Unknown'} • ₹{job.paymentAmount}
                      </p>
                    </div>
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                      {job.status}
                    </Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4 pt-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No pending reports</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report._id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold capitalize">{report.targetType} Report</span>
                        <Badge variant="warning">{report.status}</Badge>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded-md">{report.reason}</p>
                      <p className="text-xs text-muted-foreground text-right">
                        Reported by {report.reportedBy?.name || 'Unknown'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedChatUser && (
        <ChatDialog
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          recipientId={selectedChatUser._id}
        />
      )}
    </div>
  );
};

export default AdminPanel;
