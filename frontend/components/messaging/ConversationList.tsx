"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns"; // Check if date-fns is installed
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Wait, avatar wasn't in list_dir

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
    return (
        <div className="flex flex-col h-full bg-card/30 backdrop-blur-md border-r">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-emerald-500">Messages</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No conversations yet.
                    </div>
                ) : (
                    conversations.map((conv) => {
                        // Find the other participant
                        const otherParticipant = conv.participants.find(
                            (p) => p.user.id !== currentUserId
                        )?.user;

                        const lastMessage = conv.messages[0];
                        const isActive = activeConversationId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`p-4 cursor-pointer transition-all border-b border-white/5 hover:bg-emerald-500/10 ${isActive ? "bg-emerald-500/20 border-r-4 border-r-emerald-500" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                                        {otherParticipant?.name?.[0] || "?"}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-baseline gap-2">
                                            <h3 className={`font-semibold truncate ${isActive ? "text-emerald-400" : "text-foreground"}`}>
                                                {otherParticipant?.name || "Unknown User"}
                                            </h3>
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ""}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate italic">
                                            {lastMessage ? lastMessage.text : "No messages yet"}
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
