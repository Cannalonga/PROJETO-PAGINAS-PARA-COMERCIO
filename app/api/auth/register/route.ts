import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = registerSchema.parse(body);

        // Verificar se email já existe
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email já está em uso' },
                { status: 400 }
            );
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Separar nome e sobrenome
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'CLIENTE_USER',
                isActive: true,
            },
        });

        // Remover senha do retorno
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
            message: 'Conta criada com sucesso!',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error('Erro ao registrar usuário:', error);
        return NextResponse.json(
            { error: 'Erro ao criar conta. Tente novamente.' },
            { status: 500 }
        );
    }
}
