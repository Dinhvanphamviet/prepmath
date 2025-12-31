import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4 font-game text-primary">Dashboard</h1>
            <div className="bg-card p-6 rounded-lg shadow-md border">
                <p className="text-lg mb-2">Xin chào, <span className="font-bold">{session.user?.name}</span>!</p>
                <p className="text-muted-foreground">Email: {session.user?.email}</p>
                <p className="text-muted-foreground">Role: {session.user?.role}</p>
                <p className="text-muted-foreground">ID: {session.user?.id}</p>

                <div className="mt-6">
                    <p>Chào mừng bạn đến với hệ thống Prep HSA.</p>
                </div>
            </div>
        </div>
    );
}
