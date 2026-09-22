import { users } from "@/db/schema/users";
import { InferInsertModel } from "drizzle-orm";
import { User } from "@/db/type";

export interface AnchorType {
  href: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}
export type ButtonType = {
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
};
export interface InputFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
type ExtraUserFields = {
  lastUsernameChanged?: {
    allowed: boolean;
    pending: Date;
  };
};

export type InsertUsers = {
  user: InferInsertModel<typeof users> & ExtraUserFields;
};

export type UserResponse = {
  success: boolean;
  message: string;
  user: User;
};
export interface FormFieldError {
  message?: string | number | number[];
  type?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
