"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { signupSchema, type SignupInput } from "./schemas";

export async function signUpAction(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ["An account with this email already exists."],
        },
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and company in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      // Create a default company for the user
      await tx.company.create({
        data: {
          name: name ? `${name}'s Company` : "My Company",
          ownerId: newUser.id,
        },
      });

      return newUser;
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    };
  }
}

export async function signInAction(
  _prevState: unknown,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  });

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: {
        _form: ["Invalid email or password. Please try again."],
      },
    };
  }
}

export async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}
