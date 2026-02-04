import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Search,
  Plus,
  Mail,
  Calendar,
  Trash2,
  Smartphone
} from 'lucide-react';


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student, Course, Category } from '@/types'; // Update imports path if needed, usually '@/types'

interface StudentManagementProps {
  students: Student[];
  courses: Course[];
  categories: Category[]; // New prop
  onAddStudent: (student: Omit<Student, 'id' | 'enrolledCourses' | 'progress'>) => void;
  onDeleteStudent: (studentId: string) => void;
  onEnrollCategory: (studentId: string, categoryId: string) => void;
  onUpdateDeviceLimit: (studentId: string, maxDevices: number) => void; // New prop for device limit
}

export function StudentManagement({
  students,
  courses,
  categories,
  onAddStudent,
  onDeleteStudent,
  onEnrollCategory,
  onUpdateDeviceLimit
}: StudentManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: ''
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      ...newStudent,
      joinDate: new Date().toISOString().split('T')[0]
    });
    setNewStudent({ name: '', email: '' });
    setIsAddStudentOpen(false);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const getStudentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStudentStats = (student: Student) => {
    const enrolledCourses = student.enrolledCourses.length;
    const totalLessons = student.enrolledCourses.reduce((sum, courseId) => {
      const course = courses.find(c => c.id === courseId);
      return sum + (course?.lessons.length || 0);
    }, 0);
    const completedLessons = Object.values(student.progress).filter(progress => progress === 100).length;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      enrolledCourses,
      totalLessons,
      completedLessons,
      overallProgress
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Students</h1>

        </div>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a new student account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <Label htmlFor="studentName">Full Name</Label>
                <Input
                  id="studentName"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Email Address</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="Enter student's email"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Student</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Progress</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const stats = getStudentStats(student);

              return (
                <TableRow
                  key={student.id}
                  onClick={() => handleViewStudent(student)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getStudentInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/60">{student.email}</TableCell>
                  <TableCell className="text-foreground/60">
                    {new Date(student.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{stats.enrolledCourses} enrolled</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{stats.overallProgress}%</span>
                      <div className="h-2 w-16 rounded-full bg-secondary">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${stats.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Student Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[420px] shadow-xl sm:w-[560px]">
          {selectedStudent && (
            <>
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="text-3xl font-black uppercase text-foreground">Student Details</SheetTitle>
                <SheetDescription className="text-xs font-semibold uppercase text-foreground/60">
                  View detailed information about {selectedStudent.name}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-8 space-y-6">
                {/* Student Info */}
                <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-5">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                      {getStudentInitials(selectedStudent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedStudent.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{selectedStudent.email}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Joined {new Date(selectedStudent.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>



                {/* Enrolled Categories */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase text-foreground">Enrolled Categories</h4>
                  {!selectedStudent.enrolledCategories || selectedStudent.enrolledCategories.length === 0 ? (
                    <div className="rounded-lg border bg-muted/50 py-8 text-center text-sm font-medium text-muted-foreground">
                      Not enrolled in any categories yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.enrolledCategories.map((categoryId) => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <div key={categoryId} className="rounded-lg border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-lg text-secondary-foreground font-bold">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <h5 className="text-base font-bold text-foreground">{category.name}</h5>
                                <p className="text-xs font-medium text-muted-foreground">{category.description || 'No description'}</p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Device Limit Setting */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Device Limit
                  </h4>
                  <div className="rounded-lg border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Label className="mb-2 block text-sm">Max Devices Allowed</Label>
                        <p className="text-xs text-muted-foreground">
                          Limit how many devices this student can use simultaneously.
                          If exceeded, all devices will be logged out.
                        </p>
                      </div>
                      <Select
                        value={String(selectedStudent.maxDevices || 1)}
                        onValueChange={(val) => {
                          onUpdateDeviceLimit(selectedStudent.id, Number(val));
                          // Update local state for immediate UI feedback
                          setSelectedStudent(prev => prev ? { ...prev, maxDevices: Number(val) } : null);
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? 'device' : 'devices'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Category Enrollment */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase text-foreground">Category Enrollment</h4>
                  <div className="flex items-center gap-4 rounded-lg border bg-card p-5 shadow-sm">
                    <div className="flex-1">
                      <Label className="mb-2 block">Enroll in Category</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        if (selectedCategory && selectedStudent) {
                          onEnrollCategory(selectedStudent.id, selectedCategory);
                          setSelectedCategory('');
                        }
                      }}
                      disabled={!selectedCategory}
                      className="mt-6"
                    >
                      Enroll
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 border-t pt-5">
                  <Button
                    variant="destructive"
                    className="flex-1 shadow-sm"
                    onClick={() => {
                      onDeleteStudent(selectedStudent.id);
                      setIsDrawerOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Student
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
