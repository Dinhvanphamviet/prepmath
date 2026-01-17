import Header from "../_components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

export default function TeachersPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="space-y-6 max-w-md mx-auto">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                            <Construction className="w-24 h-24 text-primary relative z-10" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
                            Đang Xây Dựng!
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-sans">
                            Đội ngũ giáo viên siêu hạng của PrepMath đang soạn giáo án. Hãy quay lại sau nhé!
                        </p>
                    </div>

                    <div className="pt-8">
                        <Link href="/">
                            <Button size="lg" className="rounded-full px-8 font-heading text-lg group">
                                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                Về Trang Chủ
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border">
                © 2025 PrepMath. Thiết kế với 🤍 bởi Đinh Việt.
            </footer>
        </div>
    );
}
