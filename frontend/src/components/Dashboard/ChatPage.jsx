import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, chatAPI } from '../../utils/api';
import ChatDialog from '../Jobs/ChatDialog';

const ChatPage = () => {
    const { user } = useAuth();
    const [activeJobs, setActiveJobs] = useState([]);
    const [directChats, setDirectChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsRes, dmsRes] = await Promise.all([
                jobAPI.getMyJobs(),
                chatAPI.getDMs()
            ]);

            // Process Jobs
            const allJobs = [...jobsRes.data.posted, ...jobsRes.data.accepted];
            const chatableJobs = allJobs.filter(job =>
                job.status !== 'open' &&
                (job.acceptedBy?._id || job.acceptedBy)
            );
            setActiveJobs(chatableJobs);

            // Process DMs
            setDirectChats(dmsRes.data);

        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = (job) => {
        setSelectedJob(job);
        setSelectedUser(null);
        setShowChat(true);
    };

    const handleOpenDM = (user) => {
        setSelectedUser(user);
        setSelectedJob(null);
        setShowChat(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                <p className="text-muted-foreground">
                    Your active conversations.
                </p>
            </div>

            {/* Direct Messages Section */}
            {directChats.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5" /> Direct Messages
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {directChats.map((dmUser) => (
                            <Card key={dmUser._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenDM(dmUser)}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline">Direct Message</Badge>
                                        {dmUser.role === 'admin' || dmUser.role === 'superadmin' ? <Badge>Admin</Badge> : null}
                                    </div>
                                    <CardTitle className="text-lg truncate">{dmUser.name}</CardTitle>
                                    <CardDescription>{dmUser.email}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" size="sm" variant="secondary">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Open Chat
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Job Chats Section */}
            <div className="space-y-4">
                {activeJobs.length > 0 && (
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Job Chats
                    </h3>
                )}

                {activeJobs.length === 0 && directChats.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No active conversations</h3>
                            <p className="text-muted-foreground max-w-sm">
                                You can only chat for jobs that are accepted, in-progress, or completed.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeJobs.map((job) => {
                            const isOwner = user._id === (job.postedBy?._id || job.postedBy);
                            const counterpartName = isOwner
                                ? (job.acceptedBy?.name || 'Worker')
                                : (job.postedBy?.name || 'Poster');

                            return (
                                <Card key={job._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenChat(job)}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={job.status === 'completed' ? 'secondary' : 'default'}>
                                                {job.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg truncate">{job.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            Chat with {counterpartName}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" size="sm">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Open Chat
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {(selectedJob || selectedUser) && (
                <ChatDialog
                    job={selectedJob}
                    recipient={selectedUser}
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default ChatPage;
