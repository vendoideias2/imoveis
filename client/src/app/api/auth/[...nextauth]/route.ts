import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import CredentialsProvider from "next-auth/providers/credentials";

const providers: any[] = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;

            try {
                const res = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                });

                const data = await res.json();

                if (res.ok && data.user) {
                    return {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        image: data.user.image,
                        token: data.token
                    };
                }
                return null;
            } catch (error) {
                console.error("Login error:", error);
                return null;
            }
        }
    })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

const handler = NextAuth({
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login", // Correct path
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).token;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // TODO: Implement backend sync for Google users if needed
                return true;
            }
            return true;
        }
    },
    session: {
        strategy: "jwt",
    },
});

export { handler as GET, handler as POST };
