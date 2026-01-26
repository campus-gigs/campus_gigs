import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { jobAPI } from '../../utils/api';
import ChatDialog from '../Jobs/ChatDialog';

const ChatPage = () => {
    const { user } = useAuth();
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    const fetchActiveJobs = async () => {
        try {
            const { data } = await jobAPI.getMyJobs();
            // Combine posted and accepted jobs
            const allJobs = [...data.posted, ...data.accepted];

            // Filter for jobs that can have chat (accepted/in-progress/completed)
            const chatableJobs = allJobs.filter(job =>
                job.status !== 'open' &&
                (job.acceptedBy?._id || job.acceptedBy) // Ensure someone accepted it
            );

            setActiveJobs(chatableJobs);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = (job) => {
        setSelectedJob(job);
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
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                <p className="text-muted-foreground">
                    Chat with workers or job posters for your active gigs.
                </p>
            </div>

            {activeJobs.length === 0 ? (
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

            {selectedJob && (
                <ChatDialog
                    job={selectedJob}
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default ChatPage;
