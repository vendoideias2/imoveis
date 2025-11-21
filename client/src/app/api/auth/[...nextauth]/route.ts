import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    // Check if user exists in our backend
                    // We can't easily call the backend here if it's on a different port/process without a full URL
                    // Ideally, we should have a backend endpoint to "upsert" the user

                    // For now, we will assume the backend handles this or we just allow login
                    // In a real production app with separate backend, we'd call an API here

                    // Example:
                    // await fetch('http://localhost:3001/api/auth/google-callback', {
                    //   method: 'POST',
                    //   body: JSON.stringify({ user, account })
                    // })

                    return true;
                } catch (error) {
                    console.error("Error in google signin callback", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            // Add user id to session if available
            if (session.user) {
                // session.user.id = token.sub; // or fetch from backend
            }
            return session;
        }
    },
});

export { handler as GET, handler as POST };
