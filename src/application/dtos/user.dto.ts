import z from "zod";
import type { ID } from "../../domain/types/types.js";

export const UserInputSchema = z.object({
  username: z.string("Username must be a defined string").min(1, { message: "Username cannot be empty" }),
  name: z.string("Name must be a defined string").min(1, { message: "Name cannot be empty" }),
  lastName: z.string("Last name must be a defined string").min(1, { message: "Last name cannot be empty" }),
  email: z.email("Email must be a valid email address"),
  password: z.string("Password must be a defined string")
});

export type UserInput = z.infer<typeof UserInputSchema>;

export interface UserOutput {
  id: ID;
  username: string;
  fullName: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}