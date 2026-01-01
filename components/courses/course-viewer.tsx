"use client";

import { useState, useEffect } from "react";
import {
    BookOpen,
    FileText,
    Video,
    CheckCircle,
    PlayCircle,
    ChevronLeft,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface CourseViewerProps {
    course: any;
    chapters: any[];
    hasAccess: boolean;
}

export function CourseViewer({ course, chapters, hasAccess }: CourseViewerProps) {
    const searchParams = useSearchParams();
    const lessonIdParam = searchParams.get('lessonId');
    const router = useRouter();
    const pathname = usePathname();

    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [activeResource, setActiveResource] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // State to track completed lessons locally
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

    // Initialize completed lessons from course enrollment data passed in (not yet passed, need to fetch or props)
    // For now we assume we fetch it or it's passed. 
    // TODO: Ideally `chapters` prop should include `is_completed` for each lesson if we joined correctly.
    // Let's assume we maintain a list.

    // Auto-select lesson based on URL or first available
    useEffect(() => {
        if (lessonIdParam) {
            let foundLesson = null;
            for (const chapter of chapters) {
                const found = chapter.lessons.find((l: any) => l.id === lessonIdParam);
                if (found) {
                    foundLesson = found;
                    break;
                }
            }
            if (foundLesson) {
                setActiveLesson(foundLesson);
                return;
            }
        }

        if (!activeLesson && chapters.length > 0 && chapters[0].lessons.length > 0) {
            // Set initial lesson if none selected and no URL param
            const firstLesson = chapters[0].lessons[0];
            setActiveLesson(firstLesson);
            // Optional: Update URL to reflect default lesson
            // router.replace(`${pathname}?lessonId=${firstLesson.id}`);
        }
    }, [lessonIdParam, chapters]); // Removed activeLesson from dependency to prevent revert loops

    // Initialize completed lessons from data
    useEffect(() => {
        const completed = new Set<string>();
        chapters.forEach((chapter: any) => {
            chapter.lessons?.forEach((lesson: any) => {
                if (lesson.isCompleted) {
                    completed.add(lesson.id);
                }
            });
        });
        setCompletedLessons(completed);
    }, [chapters]);

    // Auto-select first resource when lesson changes
    useEffect(() => {
        if (activeLesson && activeLesson.resources && activeLesson.resources.length > 0) {
            setActiveResource(activeLesson.resources[0]);
        } else {
            setActiveResource(null);
        }
    }, [activeLesson]);

    const handleLessonSelect = (lesson: any) => {
        // Update URL to match selected lesson
        const params = new URLSearchParams(searchParams.toString());
        params.set('lessonId', lesson.id);
        router.push(`${pathname}?${params.toString()}`);
        // State will update via useEffect when URL param changes
    };

    const handleCompleteLesson = async () => {
        if (!activeLesson) return;

        const isCompleted = completedLessons.has(activeLesson.id);
        const newState = !isCompleted;

        // Optimistic update
        setCompletedLessons(prev => {
            const next = new Set(prev);
            if (newState) next.add(activeLesson.id);
            else next.delete(activeLesson.id);
            return next;
        });

        try {
            await fetch(`/api/courses/${course.id}/progress`, {
                method: 'POST',
                body: JSON.stringify({
                    lessonId: activeLesson.id,
                    isCompleted: newState
                })
            });
        } catch (error) {
            console.error("Failed to update progress", error);
            // Revert on error
            setCompletedLessons(prev => {
                const next = new Set(prev);
                if (newState) next.delete(activeLesson.id);
                else next.add(activeLesson.id);
                return next;
            });
        }
    };

    const isCurrentLessonCompleted = activeLesson ? completedLessons.has(activeLesson.id) : false;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Bar inside Viewer */}
            <div className="border-b bg-background p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg font-game line-clamp-1">{activeLesson?.title || course.title}</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Player */}
                <div className="flex-1 flex flex-col overflow-hidden bg-black/5 relative">
                    {activeLesson ? (
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="max-w-5xl mx-auto space-y-6">
                                {/* Player */}
                                <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg group">
                                    {activeResource ? (
                                        <>
                                            {activeResource.resource_type === 'video' && activeResource.resource_url ? (
                                                <iframe
                                                    src={activeResource.resource_url}
                                                    title={activeResource.title || activeLesson.title}
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            ) : activeResource.resource_type === 'document' && activeResource.resource_url ? (
                                                <iframe
                                                    src={activeResource.resource_url.replace('/view?usp=sharing', '/preview')}
                                                    title={activeResource.title || activeLesson.title}
                                                    className="absolute top-0 left-0 w-full h-full bg-white"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                                                    <div className="text-center p-6">
                                                        <FileText className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                                                        <h3 className="text-xl font-bold font-game mb-2">Tài liệu học tập</h3>
                                                        <p className="text-muted-foreground mb-4">Hãy tải tài liệu hoặc đọc nội dung bên dưới.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white bg-slate-900">
                                            <div className="text-center">
                                                <PlayCircle className="h-20 w-20 mx-auto mb-4 text-primary opacity-80 group-hover:scale-110 transition-transform" />
                                                <p className="text-xl font-medium">Chưa có tài liệu</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Resource List - Show if lesson has resources */}
                                {activeLesson.resources && activeLesson.resources.length > 0 && (
                                    <div className="bg-background rounded-lg p-4 shadow-sm border">
                                        <h3 className="text-lg font-bold font-game mb-4">Nội dung bài học</h3>
                                        <div className="space-y-2">
                                            {activeLesson.resources.map((resource: any, index: number) => (
                                                <button
                                                    key={resource.id}
                                                    onClick={() => setActiveResource(resource)}
                                                    className={`w-full text-left p-3 rounded-lg transition-colors ${activeResource?.id === resource.id
                                                        ? 'bg-primary/10 border-2 border-primary'
                                                        : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 ${activeResource?.id === resource.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            {resource.resource_type === 'video' ? (
                                                                <PlayCircle className="h-5 w-5" />
                                                            ) : (
                                                                <FileText className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-medium text-sm mb-1 ${activeResource?.id === resource.id ? 'text-primary' : 'text-foreground'}`}>
                                                                {resource.title || `${resource.resource_type === 'video' ? 'Video' : 'Tài liệu'} ${index + 1}`}
                                                            </h4>
                                                            {resource.description && (
                                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                                    {resource.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-background rounded-lg p-6 shadow-sm border">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold font-game mb-2">{activeLesson.title}</h2>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="secondary">
                                                    {activeLesson.resources && activeLesson.resources.length > 0
                                                        ? `${activeLesson.resources.length} tài liệu`
                                                        : 'Bài học'}
                                                </Badge>
                                                <span>•</span>
                                                <span>Cập nhật mới nhất</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="font-game"
                                            variant={isCurrentLessonCompleted ? "default" : "outline"}
                                            onClick={handleCompleteLesson}
                                        >
                                            <CheckCircle className={`mr-2 h-4 w-4 ${isCurrentLessonCompleted ? "fill-white text-white" : ""}`} />
                                            {isCurrentLessonCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                                        </Button>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground">
                                        <p>{activeLesson.content || "Chưa có mô tả cho bài học này."}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Chọn bài học để bắt đầu
                        </div>
                    )}
                </div>

                {/* Sidebar - Course Content (Right Side) */}
                <div className={`${sidebarOpen ? 'w-80' : 'w-0'} border-l bg-background flex flex-col transition-all duration-300 overflow-hidden`}>
                    <div className="p-4 border-b bg-muted/30">
                        <h2 className="font-bold text-base flex items-center gap-2">
                            <Menu className="h-4 w-4" /> Đề cương khóa học
                        </h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <Accordion type="multiple" defaultValue={chapters.map(c => c.id)} className="w-full">
                            {chapters.map((chapter, index) => (
                                <AccordionItem key={chapter.id} value={chapter.id} className="border-b-0">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/10 text-sm font-semibold border-b">
                                        <div className="text-left">
                                            <span className="font-game line-clamp-1">CHƯƠNG {index + 1}: {chapter.title}</span>
                                            {/* Calculate completed count for chapter */}
                                            <div className="text-xs font-normal text-muted-foreground mt-0.5">
                                                {chapter.lessons.filter((l: any) => completedLessons.has(l.id)).length}/{chapter.lessons.length} hoàn thành
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-0 pb-0">
                                        <div className="flex flex-col">
                                            {chapter.lessons.map((lesson: any) => {
                                                const isActive = activeLesson?.id === lesson.id;
                                                const isCompleted = completedLessons.has(lesson.id);

                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleLessonSelect(lesson)}
                                                        className={`flex items-center gap-3 p-3 text-sm transition-colors text-left border-l-4 border-b
                                                            ${isActive
                                                                ? "border-l-primary bg-primary/10 text-primary font-medium"
                                                                : "border-l-transparent border-b-border/40 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                                            }`}
                                                    >
                                                        <div className="shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                lesson.lesson_type === 'video'
                                                                    ? <PlayCircle className="h-4 w-4" />
                                                                    : <FileText className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 line-clamp-2 text-xs md:text-sm">
                                                            {lesson.title}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
