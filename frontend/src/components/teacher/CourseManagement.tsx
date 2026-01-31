import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Search,
  Plus,
  Trash2,
  Play,
  Users,
  Clock,
  BookOpen,
  MoreVertical
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, Lesson, Student, Category } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CourseManagementProps {
  courses: Course[];
  students: Student[];
  categories: Category[]; // Added prop
  onAddCourse: (course: any) => void; // looser type for now to handle migration or Omit<Course, 'id'> with categoryId
  onEditCourse: (courseId: string, updates: Partial<Course>) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddLesson: (courseId: string, lesson: Omit<Lesson, 'id'>) => void;
  onEditLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onDeleteLesson: (courseId: string, lessonId: string) => void;
}

export function CourseManagement({
  courses,
  students,
  categories, // Destructure new prop
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}: CourseManagementProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);

  // Form states
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    categoryId: '',
    thumbnail: '📚'
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: '',
    videoUrl: ''
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.category?.name || 'Uncategorized').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCourse({ ...newCourse, lessons: [] });
    setNewCourse({ title: '', description: '', categoryId: '', thumbnail: '📚' });
    setIsAddCourseOpen(false);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourseId) {
      onAddLesson(selectedCourseId, newLesson);
      setNewLesson({ title: '', description: '', duration: '', videoUrl: '' });
      setIsAddLessonOpen(false);
      // Don't close the sheet, just the add dialog if it was separate, but here we might do it inline or separate. 'selectedCourseId' is used for the adding logic.
      // If we are "managing" a course, we want to keep that open.
    }
  };

  const getEnrolledStudents = (courseId: string) => {
    return students.filter(student => student.enrolledCourses.includes(courseId));
  };

  const getAverageProgress = (courseId: string) => {
    const enrolledStudents = getEnrolledStudents(courseId);
    if (enrolledStudents.length === 0) return 0;
    const totalProgress = enrolledStudents.reduce((sum, student) =>
      sum + (student.progress[courseId] || 0), 0
    );
    return Math.round(totalProgress / enrolledStudents.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Courses</h1>

        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Design a new learning module for your students.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g. Advanced Typography"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Briefly describe the course content..."
                  minLength={10}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newCourse.categoryId}
                    onValueChange={(value) => setNewCourse({ ...newCourse, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
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
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <Input
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                    placeholder="Emoji or URL"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Avg. Progress</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => {
              const enrolledStudents = getEnrolledStudents(course.id);
              const avgProgress = getAverageProgress(course.id);

              return (
                <TableRow
                  key={course.id}
                  onClick={() => navigate(`/teacher/course/${course.id}`)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-xl text-primary">
                        {course.thumbnail}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{course.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{course.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium">
                      {course.category?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {course.lessons?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {enrolledStudents.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{avgProgress}%</span>
                      <div className="h-2 w-16 rounded-full bg-secondary">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${avgProgress}%` }}
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

      {/* Course Manager Sheet */}
      <Sheet open={!!managingCourse} onOpenChange={(open) => !open && setManagingCourse(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {managingCourse && (
            <>
              <SheetHeader className="mb-6 space-y-4">
                <SheetTitle className="text-2xl font-bold">{managingCourse.title}</SheetTitle>
                <SheetDescription>
                  Manage lessons and course settings.
                </SheetDescription>
                <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/50 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getEnrolledStudents(managingCourse.id).length} Enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {managingCourse.lessons.reduce((acc, l) => {
                        const [min, sec] = l.duration.split(':').map(Number);
                        return acc + min;
                      }, 0)} mins total
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Lessons</h3>
                  <Button size="sm" onClick={() => {
                    setSelectedCourseId(managingCourse.id);
                    setIsAddLessonOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>

                {managingCourse.lessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    <BookOpen className="mb-3 h-8 w-8 opacity-50" />
                    <p className="text-sm font-medium">No lessons yet</p>
                    <p className="text-xs">Add your first lesson to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {managingCourse.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="relative flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-foreground">{lesson.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDeleteLesson(managingCourse.id, lesson.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-3 border-t pt-5 mt-8">
                <Button
                  variant="destructive"
                  className="flex-1 shadow-sm"
                  onClick={() => {
                    onDeleteCourse(managingCourse.id);
                    setManagingCourse(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Course
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Lesson Dialog (Can be triggered from Sheet) */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>Add a new video lesson to this course.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (mm:ss)</Label>
                <Input
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                  placeholder="10:00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddLessonOpen(false)}>Cancel</Button>
              <Button type="submit">Add Lesson</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
