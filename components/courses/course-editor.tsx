"use client";

import * as React from "react";
import Image from "next/image";
import {
    BookOpen,
    FileText,
    LayoutDashboard,
    List,
    Settings,
    Users,
    Video,
    Plus,
    MoreVertical,
    Pencil,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface CourseEditorProps {
    course: any;
    chapters: any[];
    isTeacher: boolean;
}

export function CourseEditor({ course, chapters, isTeacher }: CourseEditorProps) {

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-game tracking-tight">{course.title}</h1>
                    <p className="text-muted-foreground">{course.description}</p>
                </div>
                {isTeacher && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline">Preview</Button>
                        <Button variant="pixel" className="font-game">Publish</Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="curriculum" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="curriculum">Chương trình</TabsTrigger>
                    {isTeacher && <TabsTrigger value="students">Học viên</TabsTrigger>}
                    {isTeacher && <TabsTrigger value="settings">Cài đặt</TabsTrigger>}
                </TabsList>

                <TabsContent value="curriculum" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold font-game">Nội dung khóa học</h2>
                        {isTeacher && (
                            <Button size="sm" variant="outline" className="font-game">
                                <Plus className="mr-2 h-4 w-4" /> Thêm chương
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-game">Danh sách chương</CardTitle>
                            <CardDescription>
                                Quản lý các chương và bài học trong khóa học này.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                {chapters.map((chapter) => (
                                    <AccordionItem key={chapter.id} value={chapter.id}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold font-game text-lg">{chapter.title}</span>
                                                <Badge variant="secondary">{chapter.lessons.length} bài học</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2 pb-4 px-2">
                                            <div className="flex flex-col gap-2">
                                                {chapter.lessons.map((lesson: any) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center justify-between p-3 rounded-md bg-muted/50 border hover:bg-muted transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {lesson.lesson_type === 'video' ? <Video className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-orange-500" />}
                                                            <span className="font-medium">{lesson.title}</span>
                                                            {lesson.duration_minutes > 0 && (
                                                                <span className="text-xs text-muted-foreground">({lesson.duration_minutes} phút)</span>
                                                            )}
                                                        </div>
                                                        {isTeacher && (
                                                            <div className="flex items-center gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {isTeacher && (
                                                    <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground mt-2" size="sm">
                                                        <Plus className="mr-2 h-4 w-4" /> Thêm bài học
                                                    </Button>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            {chapters.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    Chưa có nội dung nào. Hãy bắt đầu bằng cách thêm chương đầu tiên.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-game">Quản lý học viên</CardTitle>
                            <CardDescription>
                                Danh sách học viên và mã đăng ký.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Tính năng đang phát triển...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-game">Cài đặt khóa học</CardTitle>
                            <CardDescription>
                                Chỉnh sửa thông tin cơ bản và quyền riêng tư.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Tính năng đang phát triển...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
