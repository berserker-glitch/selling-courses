import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { IconX, IconLoader2, IconDeviceDesktop } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

interface Student {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    maxDevices: number;
    createdAt: string;
    enrolledCategories?: { id: string, name?: string }[];
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

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                phoneNumber: student.phoneNumber || "",
                maxDevices: student.maxDevices || 1
            });
        }
    }, [student]);

    if (!student) return null;

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update Basic Info
            await api.put(`/auth/users/${student.id}`, {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber
            });

            // Update Device Limit (Separate Endpoint)
            if (formData.maxDevices !== student.maxDevices) {
                await api.put(`/auth/users/${student.id}/device-limit`, {
                    maxDevices: parseInt(String(formData.maxDevices))
                });
            }

            alert("Student updated successfully");
            onUpdate(); // Refresh parent list
        } catch (error: any) {
            console.error("Update failed", error);
            alert(error.message || "Failed to update student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full border-r bg-background p-6 w-full max-w-md overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Student Details</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <IconX className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4">
                    {student.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-medium">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.email}</p>
                <div className="mt-2 text-xs bg-muted px-2 py-1 rounded">
                    Joined: {new Date(student.createdAt).toLocaleDateString()}
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
    );
}
