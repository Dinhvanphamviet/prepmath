"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    BookOpen,
    Clock,
    FileText,
    PlayCircle,
    CheckCircle
} from "lucide-react";
import { JoinCourseDialog } from "@/components/courses/join-course-dialog"; // Import
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseSyllabusProps {
    course: any;
    chapters: any[];
    isEnrolled: boolean;
}

export function CourseSyllabus({ course, chapters, isEnrolled }: CourseSyllabusProps) {
    const searchParams = useSearchParams();
    const [showJoinDialog, setShowJoinDialog] = useState(false);

    // Auto-open join dialog if redirected from learn page
    useEffect(() => {
        if (searchParams.get('join') === 'true' && !isEnrolled) {
            setShowJoinDialog(true);
        }
    }, [searchParams, isEnrolled]);

    // Determine the button text/action
    const buttonText = isEnrolled ? "Tiếp tục học" : "Đăng ký ngay";
    // If not enrolled, maybe open a dialog? For now assuming this page is seen mainly by enrolled or potential students.

    return (
        <div className="space-y-6">
            {/* Banner Section */}
            <div className="relative w-full h-[300px] rounded-xl overflow-hidden shadow-lg">
                <Image
                    src="/bg1.gif"
                    alt={course.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                    <div className="text-white space-y-2">
                        <Badge className="bg-primary/80 hover:bg-primary">{course.category}</Badge>
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="text-lg opacity-90 max-w-2xl text-white">{course.description}</p>
                        <div className="pt-4">
                            {isEnrolled ? (
                                <Link href={`/dashboard/courses/${course.id}/learn`}>
                                    <Button size="lg" className="font-game text-lg px-8" variant="pixel">
                                        {buttonText}
                                    </Button>
                                </Link>
                            ) : (
                                <JoinCourseDialog>
                                    <Button size="lg" className="font-game text-lg px-8" variant="pixel">
                                        {buttonText}
                                    </Button>
                                </JoinCourseDialog>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="syllabus" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0">
                    <TabsTrigger
                        value="description"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 text-base font-game"
                    >
                        Mô tả khóa học
                    </TabsTrigger>
                    <TabsTrigger
                        value="syllabus"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 text-base font-game"
                    >
                        Đề cương khóa học
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold mb-4 font-game">Giới thiệu</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {course.description || "Chưa có mô tả chi tiết."}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="syllabus" className="pt-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <Accordion type="multiple" defaultValue={chapters.length > 0 ? [chapters[0].id] : []} className="w-full space-y-4">
                                {chapters.map((chapter, index) => {
                                    const isFirstChapter = index === 0;
                                    const canViewDetails = isEnrolled || isFirstChapter;

                                    return (
                                        <div key={chapter.id} className="border rounded-lg bg-card overflow-hidden">
                                            <AccordionItem value={chapter.id} className="border-b-0">
                                                <AccordionTrigger className="px-6 py-4 hover:no-underline bg-muted/30">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <div className="text-left">
                                                            <div className="text-sm font-bold text-muted-foreground uppercase mb-1">CHƯƠNG {index + 1}</div>
                                                            <div className="text-lg font-bold font-game">{chapter.title}</div>
                                                        </div>
                                                        {!canViewDetails && (
                                                            <Badge variant="secondary" className="ml-2">
                                                                🔒 Cần đăng ký
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-0 pb-0">
                                                    {canViewDetails && (
                                                        <div className="divide-y relative">
                                                            {/* Vertical connecting line */}
                                                            <div className="absolute left-8 top-0 bottom-0 w-px bg-border -z-10 hidden md:block" />

                                                            {chapter.lessons.map((lesson: any) => (
                                                                <Link
                                                                    key={lesson.id}
                                                                    href={isEnrolled ? `/dashboard/courses/${course.id}/learn?lessonId=${lesson.id}` : "#"}
                                                                    onClick={(e) => {
                                                                        console.log('Lesson clicked - isEnrolled:', isEnrolled);
                                                                        if (!isEnrolled) {
                                                                            e.preventDefault();
                                                                            console.log('Opening join dialog');
                                                                            setShowJoinDialog(true);
                                                                        }
                                                                    }}
                                                                    className={`block transition-colors hover:bg-muted/50 ${!isEnrolled ? 'cursor-pointer' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-4 p-4 pl-8 bg-background">
                                                                        <div className="h-8 w-8 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0 z-10">
                                                                            {lesson.lesson_type === 'video' ? (
                                                                                <PlayCircle className="h-4 w-4 text-primary" />
                                                                            ) : (
                                                                                <FileText className="h-4 w-4 text-orange-500" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-base text-blue-600 dark:text-blue-400 group-hover:underline">
                                                                                {lesson.title}
                                                                            </h4>
                                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                                                {lesson.duration_minutes > 0 && (
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Clock className="h-3 w-3" /> {lesson.duration_minutes} phút
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </div>
                                    );
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Join Dialog for unenrolled students clicking on lessons */}
            {showJoinDialog && (
                <JoinCourseDialog
                    open={showJoinDialog}
                    onOpenChange={setShowJoinDialog}
                />
            )}
        </div>
    );
}
