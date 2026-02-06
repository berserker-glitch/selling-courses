"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ChatWindow from "@/components/messaging/ChatWindow";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentMessagesPage() {
    const [conversation, setConversation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setCurrentUser(user);
                }

                // Check for existing conversation or create NEW one with admin
                const data = await api.post("/messages/conversations", {});
                setConversation(data);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-500 flex items-center gap-3">
                        <MessageSquarePlus className="w-8 h-8" />
                        Contact Admin
                    </h1>
                    <p className="text-muted-foreground">Send a message to our support team. We'll get back to you as soon as possible!</p>
                </div>
            </div>

            <div className="flex-grow bg-card/20 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                {conversation ? (
                    <ChatWindow
                        conversationId={conversation.id}
                        currentUserId={currentUser?.id}
                        title="Admin Support"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <MessageSquarePlus className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-semibold">Unable to connect</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            We couldn't establish a connection to our support team. Please try refreshing the page.
                        </p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="border-emerald-500/20">
                            Retry Connection
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
