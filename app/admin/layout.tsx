/**
 * Admin Layout
 * Layout wrapper for admin pages with access check
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: {
        template: '%s | Admin',
        default: 'Painel Admin',
    },
    description: 'Painel de administração',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    // Redirect non-admins
    if (!user?.isAdmin) {
        redirect('/dashboard');
    }

    return children;
}
