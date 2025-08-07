import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

// Placeholder for your email sending function
async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  // Implement your email sending logic here (e.g., using nodemailer, resend, etc.)
  console.log(`Send email to ${to}: ${subject} - ${text}`);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  plugins: [nextCookies()], // Enable automatic cookie setting for server actions
});