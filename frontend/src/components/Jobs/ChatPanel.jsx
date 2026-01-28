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
                // Try to match optimistic message
                const optimisticIndex = prev.findIndex(
                    (m) =>
                        m.localId &&
                        m.sender?._id === msg.sender?._id &&
                        m.content === msg.content &&
                        Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 5000
                );

                // Replace optimistic message
                if (optimisticIndex !== -1) {
                    const updated = [...prev];
                    updated[optimisticIndex] = msg;
                    return updated;
                }

                // Avoid duplicates
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
        <div className="flex flex-col h-full overflow-hidden bg-background border-l">
            {/* Header */}
            <div className="h-16 px-4 border-b flex items-center justify-between shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => otherUser?._id && navigate(`/dashboard/profile/${otherUser._id}`)}
                >
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{otherUser?.name}</span>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {Object.entries(grouped).map(([d, msgs]) => (
                    <div key={d}>
                        <div className="text-xs text-center text-muted-foreground mb-2">{d}</div>
                        {msgs.map((m) => {
                            const isMe = m.sender?._id === user._id || m.sender === user._id;
                            return (
                                <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                                        {m.content}
                                        {m.attachment?.type === 'image' && (
                                            <img
                                                src={`${BACKEND_URL}${normalizePath(m.attachment.path)}`}
                                                alt="Attachment"
                                                className="mt-2 rounded max-w-[220px]"
                                                loading="lazy"
                                            />
                                        )}
                                        <div className="text-[10px] opacity-60 mt-1 text-right">
                                            {formatTime(m.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="relative p-3 border-t flex gap-2 items-end shrink-0 bg-background">
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileSelect} />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Smile className="w-5 h-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <EmojiPicker onEmojiClick={handleEmoji} previewConfig={{ showPreview: false }} />
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="w-5 h-5" />
                </Button>

                {previewUrl && (
                    <div className="absolute bottom-full left-4 mb-2 p-2 bg-background border rounded shadow flex gap-2">
                        <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded object-cover" />
                        <button onClick={clearAttachment}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <Textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                    rows={1}
                    className="resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                />

                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!newMessage.trim() && !selectedFile}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default ChatPanel;
