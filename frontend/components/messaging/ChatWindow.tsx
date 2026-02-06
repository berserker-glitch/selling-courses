"use client";

import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

// Check if ScrollArea exist in components/ui, from list_dir it wasn't there
// I'll use a standard div with overflow-y-auto for now.

interface Message {
    id: string;
    text: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: string;
    };
}

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    title?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId, title }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();

    useEffect(() => {
        // Fetch message history
        const fetchMessages = async () => {
            try {
                setIsLoading(true);
                const data = await api.get(`/messages/messages/${conversationId}`);
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (conversationId) {
            fetchMessages();

            // Join conversation room
            socket.emit("join-conversation", conversationId);

            // Listen for new messages
            socket.on("new-message", (message: Message) => {
                console.log("[ChatWindow] Received new-message:", message);

                setMessages((prev) => {
                    // Check if message already exists (optimistic update)
                    if (prev.find(m => m.id === message.id || (m.text === message.text && m.senderId === message.senderId && Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000))) {
                        return prev.map(m => m.id.length < 10 && m.text === message.text ? message : m);
                    }
                    return [...prev, message];
                });

                // Custom event to notify the parent list that a message arrived
                // (This is simple way to communicate between siblings in this context)
                window.dispatchEvent(new CustomEvent('update-last-message', {
                    detail: { conversationId: message.conversationId, text: message.text }
                }));
            });

            // Listen for typing status
            socket.on("user-typing", (data: { userId: string; typing: boolean }) => {
                if (data.userId !== currentUserId) {
                    setTypingUser(data.typing ? "Someone is typing..." : null);
                }
            });
        }

        return () => {
            socket.emit("leave-conversation", conversationId);
            socket.off("new-message");
            socket.off("user-typing");
        };
    }, [conversationId, currentUserId]);

    useEffect(() => {
        // Auto scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const tempId = Date.now().toString();
        const optimisticMessage: Message = {
            id: tempId,
            text: newMessage,
            senderId: currentUserId,
            conversationId,
            createdAt: new Date().toISOString(),
            sender: {
                id: currentUserId,
                name: "You",
                role: "USER"
            }
        };

        // UI Optimistic Update
        console.log("[ChatWindow] Optimistically adding message:", optimisticMessage);
        setMessages(prev => [...prev, optimisticMessage]);

        // Send via socket
        console.log("[ChatWindow] Emitting send-message:", { conversationId, text: newMessage });
        socket.emit("send-message", {
            conversationId,
            text: newMessage,
        });

        setNewMessage("");
        socket.emit("typing", { conversationId, typing: false });
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        socket.emit("typing", { conversationId, typing: e.target.value.length > 0 });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b bg-card/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                        {title?.[0].toUpperCase() || "C"}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">{title || "Conversation"}</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                {typingUser ? typingUser : "Active now"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Placeholder for actions like search, info, etc. */}
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-card/5"
                ref={scrollRef}
            >
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUserId;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const isSameSender = prevMsg?.senderId === msg.senderId;

                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300",
                                isMe ? "items-end" : "items-start",
                                isSameSender ? "mt-1" : "mt-4"
                            )}
                        >
                            <div className={cn(
                                "max-w-[80%] flex items-end gap-2 group",
                                isMe ? "flex-row-reverse" : "flex-row"
                            )}>
                                {/* Minimal Avatar for others */}
                                {!isMe && !isSameSender && (
                                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mb-1">
                                        {msg.sender.name[0].toUpperCase()}
                                    </div>
                                )}
                                {!isMe && isSameSender && <div className="w-6 shrink-0" />}

                                <div
                                    className={cn(
                                        "relative px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md",
                                        isMe
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted/80 text-foreground rounded-bl-none border border-border/50 backdrop-blur-sm"
                                    )}
                                >
                                    {!isMe && !isSameSender && (
                                        <div className="text-[10px] font-bold mb-1 text-primary tracking-wider uppercase opacity-80">
                                            {msg.sender.name}
                                        </div>
                                    )}
                                    <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                                    <div className={cn(
                                        "text-[9px] mt-1 opacity-0 group-hover:opacity-70 transition-opacity absolute bottom-[-14px]",
                                        isMe ? "right-0" : "left-0"
                                    )}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card/40 border-t shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto w-full">
                    <div className="flex-grow relative">
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={handleTyping}
                            className="w-full bg-background/50 border-border/50 focus-visible:ring-primary h-12 rounded-2xl pr-12 shadow-inner"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {/* Placeholder for emoji/attach icons */}
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
