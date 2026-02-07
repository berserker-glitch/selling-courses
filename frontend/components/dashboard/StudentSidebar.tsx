import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { IconX, IconLoader2, IconDeviceDesktop, IconDotsVertical, IconKey, IconBan, IconDeviceDesktopOff, IconCheck, IconPlus } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Student {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    maxDevices: number;
    createdAt: string;
    suspended?: boolean;
    enrolledCategories?: { id: string, name?: string }[];
}

interface Category {
    id: string;
    name: string;
}

interface StudentSidebarProps {
    student: Student | null;
    onClose: () => void;
    onUpdate: () => void;
}

export function StudentDetailsSidebar({ student, onClose, onUpdate }: StudentSidebarProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        maxDevices: 1
    });
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

    const [passwordOpen, setPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                phoneNumber: student.phoneNumber || "",
                maxDevices: student.maxDevices || 1
            });
            // Initialize selected categories
            if (student.enrolledCategories) {
                setSelectedCategoryIds(student.enrolledCategories.map(c => c.id));
            } else {
                setSelectedCategoryIds([]);
            }
        }
    }, [student]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await api.get('/categories');
            setAvailableCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    if (!student) return null;

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update Basic Info
            const promises = [
                api.put(`/auth/users/${student.id}`, {
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    categoryIds: selectedCategoryIds // Send updated categories
                })
            ];

            // Update Device Limit (Separate Endpoint)
            if (formData.maxDevices !== student.maxDevices) {
                promises.push(
                    api.put(`/auth/users/${student.id}/device-limit`, {
                        maxDevices: parseInt(String(formData.maxDevices))
                    })
                );
            }

            await Promise.all(promises);

            alert("Student updated successfully");
            onUpdate(); // Refresh parent list
        } catch (error: any) {
            console.error("Update failed", error);
            alert(error.message || "Failed to update student");
        } finally {
            setLoading(false);
        }
    };

    const handleUnbind = async () => {
        if (!confirm("Are you sure? This will force logout the student from all devices.")) return;
        try {
            await api.post(`/auth/users/${student.id}/unbind-device`, {});
            alert("Device unbound successfully");
        } catch (e: any) {
            alert(e.message || "Failed to unbind");
        }
    };

    const handleToggleSuspend = async () => {
        const action = student.suspended ? "unsuspend" : "suspend";
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const res = await api.post(`/auth/users/${student.id}/toggle-suspension`, {});
            alert(res.message);
            onUpdate();
        } catch (e: any) {
            alert(e.message || `Failed to ${action}`);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            await api.put(`/auth/users/${student.id}/change-password`, { password: newPassword });
            alert("Password changed successfully");
            setPasswordOpen(false);
            setNewPassword("");
        } catch (e: any) {
            alert(e.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="h-full bg-background flex flex-col w-full overflow-hidden">
            {/* Header with Actions */}
            <div className="flex items-center justify-between p-6 border-b shrink-0">
                <h2 className="text-xl font-semibold">Student Details</h2>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <IconDotsVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
                                <IconKey className="mr-2 h-4 w-4" /> Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleUnbind}>
                                <IconDeviceDesktopOff className="mr-2 h-4 w-4" /> Unbind Device
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleToggleSuspend} className={student.suspended ? "text-green-600 focus:text-green-600" : "text-red-600 focus:text-red-600"}>
                                {student.suspended ? (
                                    <><IconCheck className="mr-2 h-4 w-4" /> Unsuspend User</>
                                ) : (
                                    <><IconBan className="mr-2 h-4 w-4" /> Suspend User</>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <IconX className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4 relative">
                        {student.name.charAt(0).toUpperCase()}
                        {student.suspended && (
                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-background">
                                <IconBan className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <h3 className="text-lg font-medium">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>

                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                            Joined: {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                        {student.suspended ? (
                            <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium border border-red-200">
                                Suspended
                            </div>
                        ) : (
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium border border-green-200">
                                Active
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-6" />

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone Number</Label>
                        <Input
                            id="edit-phone"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        />
                    </div>

                    {/* Multi-Select Category UI */}
                    <div className="space-y-2">
                        <Label className="flex justify-between items-center">
                            Enrolled Categories
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-6 gap-1">
                                        <IconPlus className="w-3 h-3" /> Manage
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Select Categories</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {availableCategories.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">No categories found</div>
                                    ) : (
                                        availableCategories.map(cat => (
                                            <DropdownMenuCheckboxItem
                                                key={cat.id}
                                                checked={selectedCategoryIds.includes(cat.id)}
                                                onCheckedChange={() => toggleCategory(cat.id)}
                                            >
                                                {cat.name}
                                            </DropdownMenuCheckboxItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Label>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/10">
                            {selectedCategoryIds.length === 0 ? (
                                <span className="text-sm text-muted-foreground italic">No categories assigned</span>
                            ) : (
                                selectedCategoryIds.map(id => {
                                    const cat = availableCategories.find(c => c.id === id);
                                    // Fallback to finding name in student's original enrolledCategories if not in available (edge case)
                                    const name = cat?.name || student.enrolledCategories?.find(c => c.id === id)?.name || "Unknown";
                                    return (
                                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                                            {name}
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(id)}
                                                className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5"
                                            >
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max-devices" className="flex items-center gap-2">
                            <IconDeviceDesktop className="w-4 h-4" />
                            Max Devices
                        </Label>
                        <Input
                            id="max-devices"
                            type="number"
                            min={1}
                            max={10}
                            value={formData.maxDevices}
                            onChange={(e) => handleChange("maxDevices", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Maximum simultaneous logins allowed.</p>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for {student.name}. This will force them to login again.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={passwordLoading}>
                                {passwordLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Change Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
