import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Play,
  Users,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Course, Lesson, Student } from '@/lib/mock-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CourseManagementProps {
  courses: Course[];
  students: Student[];
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onEditCourse: (courseId: string, updates: Partial<Course>) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddLesson: (courseId: string, lesson: Omit<Lesson, 'id'>) => void;
  onEditLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onDeleteLesson: (courseId: string, lessonId: string) => void;
}

export function CourseManagement({
  courses,
  students,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}: CourseManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Form states
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
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
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCourse({ ...newCourse, lessons: [] });
    setNewCourse({ title: '', description: '', category: '', thumbnail: '📚' });
    setIsAddCourseOpen(false);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourseId) {
      onAddLesson(selectedCourseId, newLesson);
      setNewLesson({ title: '', description: '', duration: '', videoUrl: '' });
      setIsAddLessonOpen(false);
      setSelectedCourseId(null);
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Builder Control
          </span>
          <h1 className="text-4xl font-bold text-foreground">Course Management</h1>
          <p className="max-w-2xl text-sm font-medium text-muted-foreground">
            Draft, tweak, and launch learning blocks. Bold moves only.
          </p>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button className="min-w-[180px] justify-center">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">Create New Course</DialogTitle>
              <DialogDescription className="text-xs font-medium uppercase text-muted-foreground">
                Ship a new module to the curriculum
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-semibold uppercase">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Advanced Typography"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-semibold uppercase">Description</Label>
                <Textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Build a fearless curriculum with depth and personality."
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-semibold uppercase">Category</Label>
                  <Input
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    placeholder="Design Systems"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-xs font-semibold uppercase">Thumbnail</Label>
                  <Input
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                    placeholder="📚"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Course</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
        <Input
          placeholder="Search brutal courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12"
        />
      </div>

      {/* Courses List */}
      <div className="space-y-5">
        {filteredCourses.map((course) => {
          const enrolledStudents = getEnrolledStudents(course.id);
          const avgProgress = getAverageProgress(course.id);
          const isExpanded = expandedCourses.has(course.id);

          return (
            <Card key={course.id} className="shadow-sm border">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary text-2xl text-primary-foreground">
                      {course.thumbnail}
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl font-bold">
                        {course.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
                        <Badge variant="secondary">{course.category}</Badge>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons.length} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {enrolledStudents.length} students
                        </span>
                      </div>
                      {enrolledStudents.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase text-foreground">
                            <span>Average Progress</span>
                            <span>{avgProgress}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCourseExpansion(course.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setIsAddLessonOpen(true);
                          }}
                          className="font-semibold uppercase"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-semibold uppercase">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="font-semibold uppercase text-red-600"
                          onClick={() => onDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 bg-background">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black uppercase text-foreground">Lessons</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setIsAddLessonOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </Button>
                  </div>

                  {course.lessons.length === 0 ? (
                    <div className="rounded-lg border bg-muted/50 py-10 text-center text-sm font-medium text-muted-foreground uppercase">
                      <BookOpen className="mx-auto mb-3 h-8 w-8" />
                      No lessons yet. Add your first block to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {course.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold uppercase text-foreground">{lesson.title}</h5>
                              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="font-semibold uppercase">
                                <Play className="h-4 w-4 mr-2" />
                                Preview Lesson
                              </DropdownMenuItem>
                              <DropdownMenuItem className="font-semibold uppercase">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Lesson
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="font-semibold uppercase text-red-600"
                                onClick={() => onDeleteLesson(course.id, lesson.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Lesson
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Lesson Dialog */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Add a lesson to {selectedCourseId && courses.find(c => c.id === selectedCourseId)?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <Label htmlFor="lessonTitle">Lesson Title</Label>
              <Input
                id="lessonTitle"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Enter lesson title"
                required
              />
            </div>
            <div>
              <Label htmlFor="lessonDescription">Description</Label>
              <Textarea
                id="lessonDescription"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                placeholder="Enter lesson description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                  placeholder="e.g., 10:30"
                  required
                />
              </div>
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  placeholder="Video file URL"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Lesson</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
