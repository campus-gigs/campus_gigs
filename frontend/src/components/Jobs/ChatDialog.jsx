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

const ChatDialog = ({ job, isOpen, onClose }) => {
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
            const response = await chatAPI.getMessages(job._id);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    }, [job?._id]);

    useEffect(() => {
        if (isOpen && job?._id) {
            loadMessages();

            // Initialize Socket.io connection
            // Uses the same backend URL as the API
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            socketRef.current = io(backendUrl);

            // Join the specific chat room for this job
            socketRef.current.emit('join_chat', job._id);

            // Listen for incoming messages
            socketRef.current.on('receive_message', (message) => {
                setMessages((prevMessages) => {
                    // Check if message already exists to verify against potential duplicates
                    if (prevMessages.some(m => m._id === message._id)) return prevMessages;
                    return [...prevMessages, message];
                });

                // If the message is from me, scrollToBottom is handled by sending logic or effect
                // If from other, you might want to show a toast or auto-scroll
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [isOpen, job?._id, loadMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic UI update could go here, but for now we wait for server confirmation/socket echo
        // Actually, backend emits 'receive_message', so we can wait for that or just loadMessages().
        // Let's rely on the socket event to update the UI for consistency.

        setSending(true);
        try {
            await chatAPI.sendMessage(job._id, newMessage);
            setNewMessage('');
            // No need to call loadMessages() manually, the socket event should trigger update
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Chat: {job.title}
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
