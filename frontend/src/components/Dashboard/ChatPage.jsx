import React, { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../utils/api';
import ChatPanel from '../Jobs/ChatPanel';

const ChatPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredConversations(conversations);
        } else {
            const lower = search.toLowerCase();
            setFilteredConversations(conversations.filter(c => {
                const other = getOtherParticipant(c.participants);
                const title = c.type === 'JOB' ? c.contextId?.title : other?.name;
                return title?.toLowerCase().includes(lower);
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, conversations]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data);
            setFilteredConversations(res.data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOtherParticipant = (participants) => {
        return participants.find(p => p._id !== user._id) || participants[0];
    };

    return (
        <div className="h-full flex w-full bg-background overflow-hidden relative">
            {/* Sidebar List - Mobile: Hidden when chat active. Desktop: Always visible */}
            <div className={`
                flex-col border-r bg-card h-full shrink-0
                md:w-1/3 lg:w-1/4 md:flex
                ${selectedConversation ? 'hidden md:flex' : 'flex w-full'}
            `}>
                <div className="p-4 border-b shrink-0 h-16 flex items-center">
                    <h2 className="text-xl font-bold tracking-tight">Messages</h2>
                </div>

                <div className="p-3 border-b shrink-0 bg-background/50 backdrop-blur-sm z-10">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                        ))
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                            No conversations found.
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const otherUser = getOtherParticipant(conv.participants);
                            const isJob = conv.type === 'JOB';
                            const title = isJob ? conv.contextId?.title || 'Unknown Job' : otherUser?.name;
                            const isActive = selectedConversation?._id === conv._id;

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border
                                        ${isActive ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted border-transparent hover:border-border'}
                                    `}
                                >
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={otherUser?.profilePhoto} />
                                        <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                {title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                {new Date(conv.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {conv.lastMessageContent || 'Start chatting...'}
                                        </p>
                                    </div>
                                    {conv.unreadCounts?.[user._id] > 0 && (
                                        <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Panel (Right Side) */}
            <div className={`flex-1 h-full flex flex-col overflow-hidden ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                {selectedConversation ? (
                    <ChatPanel
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground p-8">
                        <div className="bg-background p-6 rounded-full mb-4 shadow-sm">
                            <MessageCircle className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No Chat Selected</h3>
                        <p className="text-sm text-center max-w-xs opacity-70">
                            Select a conversation from the list to start messaging.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
