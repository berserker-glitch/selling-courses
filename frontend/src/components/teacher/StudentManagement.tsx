import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  Eye
} from 'lucide-react';
import { Student, Course } from '@/lib/mock-data';

interface StudentManagementProps {
  students: Student[];
  courses: Course[];
  onAddStudent: (student: Omit<Student, 'id' | 'enrolledCourses' | 'progress'>) => void;
  onDeleteStudent: (studentId: string) => void;
}

export function StudentManagement({
  students,
  courses,
  onAddStudent,
  onDeleteStudent
}: StudentManagementProps) {
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
          <p className="text-foreground/60">Manage your students and their enrollments.</p>
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
      <div className="border border-foreground/10 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const stats = getStudentStats(student);

              return (
                <TableRow key={student.id}>
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
                      <div className="w-16 bg-foreground/10 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${stats.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-card p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary">
                      {getStudentStats(selectedStudent).overallProgress}%
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase">Overall Progress</div>
                  </div>
                  <div className="rounded-lg border bg-card p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold text-foreground">
                      {getStudentStats(selectedStudent).enrolledCourses}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase">Courses Enrolled</div>
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase text-foreground">Enrolled Courses</h4>
                  {selectedStudent.enrolledCourses.length === 0 ? (
                    <div className="rounded-lg border bg-muted/50 py-8 text-center text-sm font-medium text-muted-foreground">
                      Not enrolled in any courses yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.enrolledCourses.map((courseId) => {
                        const course = courses.find(c => c.id === courseId);
                        const progress = selectedStudent.progress[courseId] || 0;

                        return course ? (
                          <div key={courseId} className="rounded-lg border bg-card p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-xl text-primary-foreground">
                                  {course.thumbnail}
                                </span>
                                <div>
                                  <h5 className="text-base font-bold text-foreground">{course.title}</h5>
                                  <p className="text-xs font-medium text-muted-foreground uppercase">{course.category}</p>
                                </div>
                              </div>
                              <Badge variant={progress === 100 ? 'default' : 'secondary'} className="shadow-sm">
                                {progress === 100 ? 'Completed' : `${progress}%`}
                              </Badge>
                            </div>
                            <Progress value={progress} className="h-3" />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
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
