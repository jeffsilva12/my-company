import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    LayoutGrid,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';
import { index as solicitationsIndex } from '@/routes/solicitations';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Solicitações',
        href: solicitationsIndex(),
        icon: ClipboardList,
        permission: 'solicitations.view',
    },
    {
        title: 'Usuários',
        href: usersIndex(),
        icon: Users,
        permission: 'users.manage',
    },
    {
        title: 'Perfis',
        href: rolesIndex(),
        icon: Shield,
        permission: 'roles.manage',
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const items = mainNavItems.filter(
        (item) =>
            !item.permission || auth.permissions.includes(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
