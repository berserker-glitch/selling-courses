"use client";

import React from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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

interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    currentUserId: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    currentUserId,
}) => {
    const [localConversations, setLocalConversations] = React.useState(conversations);

    React.useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    React.useEffect(() => {
        const handleUpdate = (e: any) => {
            const { conversationId, text } = e.detail;
            setLocalConversations(prev => prev.map(conv => {
                if (conv.id === conversationId) {
                    return {
                        ...conv,
                        messages: [{ text, createdAt: new Date().toISOString() }],
                        updatedAt: new Date().toISOString()
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        };

        window.addEventListener('update-last-message', handleUpdate);
        return () => window.removeEventListener('update-last-message', handleUpdate);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {localConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                            ?
                        </div>
                        <p className="text-sm text-muted-foreground">No conversations yet.</p>
                    </div>
                ) : (
                    localConversations.map((conv) => {
                        const otherParticipant = conv.participants.find(
                            (p) => p.user.id !== currentUserId
                        )?.user;

                        const lastMessage = conv.messages[0];
                        const isActive = activeConversationId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={cn(
                                    "p-4 cursor-pointer transition-all border-b border-border/50 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10"
                                        : "hover:bg-muted/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-inner transition-transform duration-300 group-hover:scale-105",
                                            isActive ? "bg-primary shadow-primary/20" : "bg-muted-foreground/40"
                                        )}>
                                            {otherParticipant?.name?.[0].toUpperCase() || "?"}
                                        </div>
                                        {/* Status Dot - can be functional later */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center shadow-sm">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        </div>
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={cn(
                                                "font-semibold text-sm truncate uppercase tracking-wide",
                                                isActive ? "text-primary" : "text-foreground"
                                            )}>
                                                {otherParticipant?.name || "Support"}
                                            </h3>
                                            <span className="text-[10px] font-medium text-muted-foreground opacity-70">
                                                {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs truncate transition-colors",
                                            isActive ? "text-foreground/80 font-medium" : "text-muted-foreground"
                                        )}>
                                            {lastMessage ? lastMessage.text : "Start a conversation..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
