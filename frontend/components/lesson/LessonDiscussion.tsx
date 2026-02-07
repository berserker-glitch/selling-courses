import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or use Input
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconLoader2, IconTrash, IconMessageCircle, IconSend } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
// import { useToast } from "@/components/ui/use-toast";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    user: {
        id: string;
        name: string;
        role: "STUDENT" | "TEACHER" | "ADMIN";
    };
}

interface LessonDiscussionProps {
    lessonId: string;
    currentUserId?: string; // To check ownership for deletion
    currentUserRole?: string; // To check permission for deletion
}

export function LessonDiscussion({ lessonId, currentUserId, currentUserRole }: LessonDiscussionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // const { toast } = useToast();

    useEffect(() => {
        if (lessonId) {
            fetchComments();
        }
    }, [lessonId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/comments/${lessonId}`);
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const comment = await api.post("/comments", {
                lessonId,
                content: newComment
            });

            // Add new comment to top or fetch again
            setComments(prev => [comment, ...prev]);
            setNewComment("");

        } catch (error) {
            console.error("Failed to post comment", error);
            alert("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            await api.delete(`/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment", error);
            alert("Failed to delete comment");
        }
    };

    const canDelete = (comment: Comment) => {
        if (!currentUserId) return false;
        if (currentUserRole === 'TEACHER' || currentUserRole === 'ADMIN') return true;
        return comment.userId === currentUserId;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <IconMessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Discussion</h3>
                <span className="text-sm text-muted-foreground ml-2">({comments.length})</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Ask a question or share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting || !newComment.trim()} size="sm" className="gap-2">
                            {submitting ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconSend className="w-4 h-4" />}
                            Post Comment
                        </Button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <IconLoader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading discussion...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                        <p>No comments yet. Be the first to start the discussion!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="group flex gap-4 p-4 rounded-lg bg-card border hover:border-primary/20 transition-colors">
                            <Avatar className="w-10 h-10 border">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user.name}`} />
                                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${comment.user.role === 'TEACHER' ? 'text-primary' : ''}`}>
                                            {comment.user.name}
                                        </span>
                                        {comment.user.role === 'TEACHER' && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium border border-primary/20">
                                                TEACHER
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {canDelete(comment) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(comment.id)}
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
