import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../utils/api';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const ChatDialog = ({ job, recipient, isOpen, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = React.useCallback(async () => {
        try {
            let response;
            if (job?._id) {
                response = await chatAPI.getMessages(job._id);
            } else if (recipient?._id) {
                response = await chatAPI.getDirectMessages(recipient._id);
            }
            if (response) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    }, [job?._id, recipient?._id]);

    useEffect(() => {
        if (isOpen && (job?._id || recipient?._id)) {
            loadMessages();

            // Initialize Socket.io connection
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            socketRef.current = io(backendUrl, {
                query: { userId: user._id }
            });

            // Join Room: Job ID for jobs, User ID for DMs (handshake logic usually handles connecting to own room, 
            // but for DMs we might listen to 'receive_direct_message' which is emitted to User's socket)
            if (job?._id) {
                socketRef.current.emit('join_chat', job._id);
            } else {
                // For DMs, we rely on the backend emitting to our user ID (socket)
                // Ensure we identify ourselves if needed, or if the socket connection is authenticated naturally
            }

            // Listen for incoming messages
            const handleMessage = (message) => {
                // Verify context: 
                // If Job Chat: message.job === job._id
                // If DM: (message.sender === recipient._id || message.recipient === recipient._id) && !message.job

                const isRelevantJob = job && message.job === job._id;
                const isRelevantDM = recipient && (
                    (message.sender._id === recipient._id) ||
                    (message.sender === recipient._id) ||
                    (message.recipient === recipient._id) ||
                    (message.recipient._id === recipient._id)
                ) && !message.job;

                if (isRelevantJob || isRelevantDM) {
                    setMessages((prevMessages) => {
                        if (prevMessages.some(m => m._id === message._id)) return prevMessages;
                        return [...prevMessages, message];
                    });
                }
            };

            socketRef.current.on('receive_message', handleMessage);
            socketRef.current.on('receive_direct_message', handleMessage);

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [isOpen, job, recipient, loadMessages, user._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            if (job?._id) {
                await chatAPI.sendMessage(job._id, newMessage);
            } else if (recipient?._id) {
                await chatAPI.sendDirectMessage(recipient._id, newMessage);
            }
            setNewMessage('');
            // No need to call loadMessages() manually, the socket event should trigger update
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!job && !recipient) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full h-[100dvh] sm:h-[600px] sm:max-w-md flex flex-col p-0 gap-0 sm:rounded-lg overflow-hidden">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {job ? `Chat: ${job.title}` : `Chat with ${recipient.name}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground pt-10">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg) => {
                            // If sender is null (deleted user), treat as 'other' and show 'Deleted User'
                            const senderId = msg.sender?._id || msg.sender;
                            const isMe = user && senderId === user._id;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="text-[10px] opacity-70 block mt-1 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSend} className="flex gap-3 items-center">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                            className="rounded-full border-primary/50 focus-visible:ring-primary px-6"
                        />
                        <Button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            variant="ghost"
                            size="icon"
                            className="rounded-full w-12 h-12 shrink-0 hover:bg-primary/10"
                        >
                            <Send className="w-6 h-6 text-primary fill-primary rotate-45 mr-1" />
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatDialog;
