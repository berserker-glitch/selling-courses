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
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Page Header */}
            <div className="p-8 pb-4 shrink-0 max-w-5xl mx-auto w-full">
                <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                    <MessageSquarePlus className="w-8 h-8" />
                    Support Chat
                </h1>
                <p className="text-muted-foreground mt-2">
                    Need help? Our team is active and ready to assist you.
                </p>
            </div>

            <div className="flex-grow flex p-8 pt-0 overflow-hidden max-w-5xl mx-auto w-full">
                <div className="flex w-full bg-card/10 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-2xl relative">
                    {/* Decorative Background Element */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                    {conversation ? (
                        <div className="flex-grow flex flex-col min-w-0 bg-background/50 relative z-10">
                            <ChatWindow
                                conversationId={conversation.id}
                                currentUserId={currentUser?.id}
                                title="LMS Support Team"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full p-12 text-center space-y-6 relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group">
                                <MessageSquarePlus className="w-10 h-10 text-primary transition-transform group-hover:scale-110 duration-300" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Unable to connect</h2>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    We couldn't establish a connection to our support team. This might be a temporary network issue.
                                </p>
                            </div>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="border-primary/20 hover:bg-primary/5 px-8 rounded-xl font-semibold"
                            >
                                Retry Connection
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
