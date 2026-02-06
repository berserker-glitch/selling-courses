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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from "@/components/ui/table";
import { StudentDetailsSidebar } from "@/components/dashboard/StudentSidebar";

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
                // api.get returns the parsed JSON directly.
                // If backend returns array, res is the array.
                const data = Array.isArray(res) ? res : (res.data || []);
                setCategories(data);
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
            fetchStudents(); // Refresh list
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create student");
        } finally {
            setLoading(false);
        }
    };

    // Students List State
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await api.get('/auth/users?role=STUDENT');
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch students", error);
        }
    };

    console.log("Students state:", students); // Debugging

    // Selected Student State for Sidebar
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    return (
        <div className="flex h-full">
            {/* Sidebar Section */}
            {selectedStudent && (
                <div className="w-1/3 min-w-[320px] h-[calc(100vh-64px)] overflow-hidden border-r bg-background animate-in slide-in-from-left-10 duration-300">
                    <StudentDetailsSidebar
                        student={selectedStudent}
                        onClose={() => setSelectedStudent(null)}
                        onUpdate={() => {
                            fetchStudents(); // Refresh list
                            setSelectedStudent(null); // Close sidebar or keep open with updated data? Let's close for now or fetch updated data. 
                            // Better UX: keep open. But let's start simple.
                            // Actually, let's just close it or we'd need to re-fetch the specific student logic.
                        }}
                    />
                </div>
            )}

            {/* Main Content Section */}
            <div className="flex-1 p-8 h-[calc(100vh-64px)] overflow-auto transition-all duration-300">
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
                                    {/* Form fields remain unchanged */}
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

                <div className="border rounded-md">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Max Devices</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No students found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedStudent?.id === student.id ? 'bg-muted' : ''}`}
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>
                                            {student.enrolledCategories && student.enrolledCategories.length > 0
                                                ? categories.find(c => c.id === student.enrolledCategories[0]?.id)?.name || "Unknown"
                                                : "None"
                                            }
                                        </TableCell>
                                        <TableCell>{student.maxDevices}</TableCell>
                                        <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
