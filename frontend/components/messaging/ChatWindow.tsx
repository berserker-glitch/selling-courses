"use client";

import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Wait, scroll-area might not exist, checked list_dir earlier
import { Send, Loader2 } from "lucide-react";

// Check if ScrollArea exist in components/ui, from list_dir it wasn't there
// I'll use a standard div with overflow-y-auto for now.

interface Message {
    id: string;
    text: string;
    senderId: string;
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
                setMessages((prev) => [...prev, message]);
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

        // Send via socket
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
        <Card className="flex flex-col h-[calc(100vh-12rem)] border-none bg-transparent shadow-none">
            <CardHeader className="border-b bg-card/50 backdrop-blur-sm px-6 py-4 rounded-t-xl">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    {title || "Conversation"}
                    {typingUser && <span className="text-sm font-normal text-muted-foreground animate-pulse ml-2 italic">{typingUser}</span>}
                </CardTitle>
            </CardHeader>

            <CardContent
                className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar"
                ref={scrollRef}
            >
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] p-3 rounded-2xl ${isMe
                                        ? "bg-emerald-600 text-white rounded-br-none"
                                        : "bg-muted text-foreground rounded-bl-none"
                                    }`}
                            >
                                {!isMe && (
                                    <div className="text-xs font-bold mb-1 text-emerald-400">
                                        {msg.sender.name}
                                    </div>
                                )}
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                <div
                                    className={`text-[10px] mt-1 text-right ${isMe ? "text-emerald-100" : "text-muted-foreground"
                                        }`}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>

            <CardFooter className="p-4 bg-card/50 backdrop-blur-sm border-t rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={handleTyping}
                        className="flex-grow bg-background/50 border-emerald-500/20 focus-visible:ring-emerald-500"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export default ChatWindow;
