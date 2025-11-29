import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from './index';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            tenantId?: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        role: UserRole;
        tenantId?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        tenantId?: string;
    }
}
