import { v4 as uuidv4 } from "uuid";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/actions/mailer";
import { findUserByEmail, updateUser } from "@/models/user.model";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin?: boolean;
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      isVerified?: boolean;
      image?: string | null;
      otp?: string;
      brandId?: string;
      otpExpires?: number;
      status?: string;
      notificationId?: string  | null ;  
    };
    accessToken?: string;
  }
  interface User {
    id?: string;
    email?: string;
    userName?: string;
    username?: string;
    role?: string;
    isVerified?: boolean;
    emailVerified?: boolean;
    passwordToken?: string;
    passwordTokenExpire?: Date;
    otp?: string;
    otpExpires?: number;
    brandId?: string;
    brandName?: string;
    status?: string;
    notificationId?: string | null ;
  
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    // Email + Password
    CredentialsProvider({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await findUserByEmail({ email: credentials.email });
        if (!user) throw new Error("No user found Please Sign-up again");

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!passwordMatches) throw new Error("Your password is incorrect . Please Try Again ");

        if (user.status === "deactivated") {
         throw new Error("ACCOUNT_DEACTIVATED");
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.username || user.firstName || "",
          role: user.role ?? "brand",
          isVerified: user.emailVerified ?? false,
          status: user.status,
          notificationId: user.notificationId, 
        
        };
      },
    }),

    CredentialsProvider({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        token: { label: "Token", type: "text" },
        action: { label: "Action", type: "text" },
        otpToken: { label: "otpToken", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.action) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        if (credentials.action === "send") {
          try {
            const otp = crypto.randomInt(100000, 999999).toString();
            const expires = Date.now() + 5 * 60 * 1000;
            const token = uuidv4();
            await sendOTPEmail(email, otp);
            const hashedOtp = bcrypt.hashSync(otp, 10);
            return {
              id: token,
              email: email,
              token: token,
              otp: hashedOtp,
              otpExpires: expires,
            };
          } catch (error) {
            console.error("Failed to send OTP:", error);
            return null;
          }
        }

        if (credentials.action === "verify") {
          if (!credentials.otp) {
            return null;
          }
          const verify = await bcrypt.compare(
            credentials.otp,
            credentials?.otpToken
          );

          if (verify) {
            await updateUser({ email: email }, { emailVerified: true });
          }

          // ✅ Fetch user to get notificationId
          const user = await findUserByEmail({ email: email });

          return {
            id: user?.id || uuidv4(),
            email: email,
            image: null,
            isVerified: true,
            notificationId: user?.notificationId, // ✅ ADD THIS
          };
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email =
        user.email && user.email !== "undefined" ? user.email : token.email;
        token.name = user.userName || user.username || token.name || "";
        token.role = user.role ?? token.role ?? "brand";
        token.isVerified = user.isVerified ?? token.isVerified ?? false;
        token.brandId = user.brandId;
        token.status = user.status ?? token.status;
        token.notificationId = user.notificationId; // ✅ ADD THIS
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.role = token.role as string;
      session.user.isVerified = token.isVerified as boolean;
      session.accessToken = token.accessToken as string;
      session.user.brandId = token.brandId as string | undefined;
      session.user.status = token.status as string;
      session.user.notificationId = token.notificationId as string; // ✅ ADD THIS
      return session;
    },
  },

  pages: { signIn: "/accounts/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
};