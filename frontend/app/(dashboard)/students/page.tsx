"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { api } from "@/lib/api";

interface Category {
    id: string;
    name: string;
}

export default function StudentsPage() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        categoryId: "",
        password: "",
    });

    useEffect(() => {
        // Fetch categories for the dropdown
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                // Ensure we safe-guard against undefined data
                setCategories(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/create-student', {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                categoryId: formData.categoryId || undefined,
                password: formData.password || undefined
            });

            alert("Student created successfully!");
            setOpen(false);
            setFormData({
                name: "",
                email: "",
                phoneNumber: "",
                categoryId: "",
                password: "",
            });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Students Management</h2>
                    <p className="text-muted-foreground mt-2">View and manage your students here.</p>
                </div>
                <div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <IconPlus className="w-4 h-4" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>
                                    Create a new student account. They will receive their credentials via email.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Assign Category</Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(value) => handleChange("categoryId", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                const randomPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                                                handleChange("password", randomPass);
                                            }}
                                        >
                                            Auto-generate
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            id="password"
                                            type="text"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            placeholder="Leave empty to auto-generate on server"
                                        />
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            If left empty, a password will be generated automatically and sent to the student.
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter className="mt-4">
                                    <Button type="submit" disabled={loading}>
                                        {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
