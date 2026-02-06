"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { Loader2 } from "lucide-react";

interface Conversation {
    id: string;
    title: string | null;
    updatedAt: string;
    participants: {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }[];
    messages: {
        text: string;
        createdAt: string;
    }[];
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const userStr = localStorage.getItem("user");
                let user: any = null;
                if (userStr) {
                    user = JSON.parse(userStr);
                    setCurrentUser(user);
                }

                const data = await api.get("/messages/conversations");
                setConversations(data);
                if (data.length > 0 && !activeConversationId) { // Modified condition
                    setActiveConversationId(data[0].id);
                }

                const socket = getSocket();
                socket.on("new-conversation", (newConv: Conversation) => {
                    // If I am staff, I should see all new student conversations
                    // Even if I'm not the specific one contacted (as I might want to jump in)
                    const myRole = user?.role;
                    const isStaff = myRole === 'ADMIN' || myRole === 'TEACHER';

                    const isParticipant = newConv.participants.some((p: any) => p.user.id === user?.id);

                    if (isStaff || isParticipant) {
                        setConversations(prev => {
                            if (prev.find(c => c.id === newConv.id)) return prev;
                            return [newConv, ...prev];
                        });
                    }
                });

                return () => {
                    socket.off("new-conversation");
                };
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
            </div>
        );
    }

    const activeConversation = conversations.find((c: Conversation) => c.id === activeConversationId);
    const otherParticipant = activeConversation?.participants.find((p: any) => p.user.id !== currentUser?.id)?.user;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Page Header */}
            <div className="p-8 pb-4 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground mt-1">Manage student support and conversations.</p>
            </div>

            <div className="flex-grow flex p-8 pt-0 overflow-hidden">
                <div className="flex w-full bg-card/10 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
                    {/* Conversation List Sidebar */}
                    <div className="w-80 border-r shrink-0 flex flex-col bg-muted/20">
                        <ConversationList
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={setActiveConversationId}
                            currentUserId={currentUser?.id}
                        />
                    </div>

                    {/* Chat Area */}
                    <div className="flex-grow flex flex-col min-w-0 bg-background/50">
                        {activeConversationId ? (
                            <ChatWindow
                                conversationId={activeConversationId}
                                currentUserId={currentUser?.id}
                                title={otherParticipant?.name}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="italic">Select a conversation to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
