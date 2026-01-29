import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Smile, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../utils/api';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
};

const normalizePath = (path = '') =>
    path.startsWith('/uploads') ? path : `/uploads/${path.replace(/^uploads\//, '')}`;

const ChatPanel = ({ conversation, recipientId, jobId, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);


    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const containerRef = useRef(null);
    const endRef = useRef(null);
    const socketRef = useRef(null);
    const joinedConvRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const firstLoadRef = useRef(true);

    /* ---------------- INIT ---------------- */
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setMessages([]);
            firstLoadRef.current = true;

            try {
                let conv = conversation;
                if (!conv && (recipientId || jobId)) {
                    const res = await chatAPI.startConversation(recipientId, jobId);
                    conv = res.data;
                }
                if (!conv) return;

                setActiveConversation(conv);
                const res = await chatAPI.getConversationMessages(conv._id);
                setMessages(res.data);
                connectSocket(conv._id);
            } catch {
                toast.error('Failed to load chat');
            } finally {
                setLoading(false);
            }
        };

        if (conversation || recipientId || jobId) init();
        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation, recipientId, jobId]);

    /* ---------------- SOCKET ---------------- */
    const connectSocket = (conversationId) => {
        if (joinedConvRef.current === conversationId) return;
        cleanup();

        const socket = io(BACKEND_URL, { query: { userId: user._id } });
        socket.emit('join_conversation', conversationId);

        socket.on('receive_message', (msg) => {
            if (msg.conversationId !== conversationId) return;

            setMessages((prev) => {
                // 1. Identify if this is an optimistic message confirmation
                // We match based on tempId (localId) OR content+timestamp proximity if tempId missing
                const optimisticIndex = prev.findIndex(
                    (m) =>
                        (m.localId && m.localId === msg.localId) || // Direct match if backend returns it
                        (m.sender?._id === msg.sender?._id &&
                            m.content === msg.content &&
                            Math.abs(new Date(m.createdAt || Date.now()) - new Date(msg.createdAt)) < 20000 && // Loose time window
                            !m._id.match(/^[0-9a-fA-F]{24}$/)) // Ensure we are matching a temp ID (not a real one)
                );

                if (optimisticIndex !== -1) {
                    const updated = [...prev];
                    updated[optimisticIndex] = msg; // Replace optimistic with real
                    return updated;
                }

                // 2. Strict Duplicate Check
                if (prev.some((m) => m._id === msg._id)) {
                    return prev;
                }

                return [...prev, msg];
            });
        });

        socketRef.current = socket;
        joinedConvRef.current = conversationId;
    };

    const cleanup = () => {
        if (socketRef.current) socketRef.current.disconnect();
        socketRef.current = null;
        joinedConvRef.current = null;
        clearTimeout(typingTimeoutRef.current);
    };

    /* ---------------- SCROLL ---------------- */
    useLayoutEffect(() => {
        if (!containerRef.current || messages.length === 0) return;

        const scrollToBottom = () => {
            endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        };

        if (firstLoadRef.current) {
            requestAnimationFrame(() => {
                scrollToBottom();
                setTimeout(scrollToBottom, 150);
            });
            firstLoadRef.current = false;
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        const last = messages[messages.length - 1];
        const isMine = last?.sender?._id === user._id || last?.sender === user._id;

        if (isNearBottom || isMine) {
            scrollToBottom();
        }
    }, [messages, user._id]);

    /* ---------------- INPUT ---------------- */
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!socketRef.current || !activeConversation) return;

        socketRef.current.emit('typing', { conversationId: activeConversation._id });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('stop_typing', { conversationId: activeConversation._id });
        }, 1500);
    };

    const handleEmoji = (emoji) => {
        const cursor = textareaRef.current.selectionStart;
        const text =
            newMessage.slice(0, cursor) + emoji.emoji + newMessage.slice(cursor);
        setNewMessage(text);
        requestAnimationFrame(() => {
            textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd =
                cursor + emoji.emoji.length;
            textareaRef.current.focus();
        });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image too large (max 5MB)');
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearAttachment = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (loading || (!newMessage.trim() && !selectedFile)) return;
        if (!activeConversation) return;

        let attachment = null;

        if (selectedFile) {
            const fd = new FormData();
            fd.append('file', selectedFile);
            try {
                const res = await chatAPI.uploadAttachment(fd);
                attachment = { path: res.data.path, type: 'image' };
            } catch {
                toast.error('Image upload failed');
                return;
            }
        }

        const tempId = Date.now().toString();
        const optimistic = {
            _id: tempId,
            localId: tempId,
            conversationId: activeConversation._id,
            sender: { _id: user._id, name: user.name },
            content: newMessage,
            attachment,
            createdAt: new Date().toISOString(),
        };

        setMessages((p) => [...p, optimistic]);
        setNewMessage('');
        clearAttachment();

        try {
            await chatAPI.sendConversationMessage(
                activeConversation._id,
                optimistic.content,
                attachment
            );
        } catch {
            toast.error('Message failed');
        }
    };

    const otherUser =
        activeConversation?.participants?.find((p) => p._id !== user._id) || {};

    const grouped = messages.reduce((acc, m) => {
        const d = formatDate(m.createdAt);
        acc[d] = acc[d] || [];
        acc[d].push(m);
        return acc;
    }, {});

    /* ---------------- UI ---------------- */
    // (Defensive check moved to top of render)

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background border-l relative min-h-0">
            {/* Header */}
            <div className="h-14 px-4 border-b flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-20">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => otherUser?._id && navigate(`/dashboard/profile/${otherUser._id}`)}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm truncate max-w-[150px]">{otherUser?.name}</span>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 w-full overscroll-none">
                {Object.entries(grouped).map(([d, msgs]) => (
                    <div key={d}>
                        <div className="text-[10px] text-center text-muted-foreground mb-3 font-medium uppercase tracking-wider">{d}</div>
                        {msgs.map((m) => {
                            const isMe = m.sender?._id === user._id || m.sender === user._id;
                            return (
                                <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200`}>
                                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-card border rounded-tl-sm'
                                        }`}>
                                        {m.content}
                                        {m.attachment?.type === 'image' && (
                                            <img
                                                src={`${BACKEND_URL}${normalizePath(m.attachment.path)}`}
                                                alt="Attachment"
                                                className="mt-2 rounded-lg max-w-full sm:max-w-[220px]"
                                                loading="lazy"
                                                onLoad={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                            />
                                        )}
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {formatTime(m.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={endRef} className="h-px w-full" />
            </div>

            {/* Input */}
            <div className="p-2 sm:p-3 border-t bg-background shrink-0 w-full z-20">
                <div className="flex gap-2 items-end w-full">
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileSelect} />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-primary">
                                <Smile className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 border-none shadow-xl" side="top">
                            <EmojiPicker onEmojiClick={handleEmoji} previewConfig={{ showPreview: false }} height={350} />
                        </PopoverContent>
                    </Popover>

                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="shrink-0 h-10 w-10 text-muted-foreground hover:text-primary">
                        <ImageIcon className="w-5 h-5" />
                    </Button>

                    <div className="flex-1 relative">
                        {previewUrl && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border rounded-lg shadow-lg flex gap-2 animate-in slide-in-from-bottom-5">
                                <div className="relative">
                                    <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-md object-cover" />
                                    <button
                                        onClick={clearAttachment}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm hover:bg-destructive/90"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <Textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                            placeholder="Type a message..."
                            rows={1}
                            className="min-h-[44px] max-h-[120px] py-3 resize-none rounded-2xl border-muted-foreground/20 focus-visible:ring-primary/20"
                        />
                    </div>

                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!newMessage.trim() && !selectedFile}
                        className="shrink-0 h-11 w-11 rounded-full shadow-sm"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
