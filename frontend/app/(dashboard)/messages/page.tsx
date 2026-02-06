"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setCurrentUser(user);
                }

                const data = await api.get("/messages/conversations");
                setConversations(data);
                if (data.length > 0) {
                    setActiveConversationId(data[0].id);
                }
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

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const otherParticipant = activeConversation?.participants.find(p => p.user.id !== currentUser?.id)?.user;

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
            <div className="w-80 border-r shrink-0">
                <ConversationList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={setActiveConversationId}
                    currentUserId={currentUser?.id}
                />
            </div>
            <div className="flex-grow bg-muted/5">
                {activeConversationId ? (
                    <ChatWindow
                        conversationId={activeConversationId}
                        currentUserId={currentUser?.id}
                        title={otherParticipant?.name}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground italic">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
