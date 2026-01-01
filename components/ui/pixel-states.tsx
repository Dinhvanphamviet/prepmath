import { RefreshCw } from "lucide-react";
import { Button } from "./button";

interface PixelLoadingProps {
    text?: string;
    size?: "sm" | "md" | "lg";
}

export function PixelLoading({ text = "Đang tải...", size = "md" }: PixelLoadingProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            {/* Pixel Spinner */}
            <div className={`${sizeClasses[size]} relative animate-spin`}>
                <div className="absolute inset-0 pixel-spinner"></div>
            </div>

            <p className="text-sm font-game text-muted-foreground animate-pulse">
                {text}
            </p>

            <style jsx>{`
                .pixel-spinner {
                    background-image: 
                        linear-gradient(90deg, currentColor 25%, transparent 25%),
                        linear-gradient(90deg, transparent 75%, currentColor 75%),
                        linear-gradient(0deg, currentColor 25%, transparent 25%),
                        linear-gradient(0deg, transparent 75%, currentColor 75%);
                    background-size: 50% 50%;
                    background-position: 0 0, 0 0, 0 0, 0 0;
                    color: hsl(var(--primary));
                }
            `}</style>
        </div>
    );
}

interface PixelErrorProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function PixelError({
    title = "Lỗi!",
    message,
    onRetry
}: PixelErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
            {/* Pixel Skull/Error Icon */}
            <div className="text-6xl font-game select-none">
                💀
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold font-game text-destructive">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    {message}
                </p>
            </div>

            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="outline"
                    className="font-game gap-2 pixel-border"
                >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                </Button>
            )}

            <style jsx>{`
                .pixel-border {
                    border-width: 2px;
                    border-style: solid;
                    box-shadow: 
                        2px 2px 0 0 currentColor,
                        4px 4px 0 0 rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}

export function PixelCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="relative aspect-[16/10] w-full bg-muted pixel-shimmer"></div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded pixel-shimmer"></div>
                <div className="h-4 bg-muted rounded w-3/4 pixel-shimmer"></div>
                <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-muted rounded w-20 pixel-shimmer"></div>
                    <div className="h-8 bg-muted rounded w-16 pixel-shimmer"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pixel-shimmer {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .pixel-shimmer {
                    animation: pixel-shimmer 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export function PixelEmptyState({
    icon = "📦",
    title = "Trống!",
    message = "Không có dữ liệu",
    action
}: {
    icon?: string;
    title?: string;
    message?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="text-8xl select-none animate-bounce">
                {icon}
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold font-game">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    {message}
                </p>
            </div>

            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
}
