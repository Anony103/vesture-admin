import { z } from "zod";

export const schemaLogin = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(2, "Username is required"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters"),
});

export const schemaChangePassword = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email address"),
});
export const schemaForgotPassword = z.object({
  password: z.string({
    required_error: "Password is required",
  }),
  confirmPassword: z.string({
    required_error: "Confirm Password is required",
  }),
});

// Base schema (shared fields)

// Schema for CREATE (password + confirmPassword required)
export const createSchema = z
  .object({
    username: z.string({
      required_error: "Username is required",
    }),
    name: z.string({
      required_error: "Username is required",
    }),
    phone: z.string({
      required_error: "Phone is required",
    }),
    password: z.string({
      required_error: "Password is required",
    }),
    confirmPassword: z.string({
      required_error: "Confirm Password is required",
    }),
    status: z.string({
      required_error: "Status is required",
    }),
    staffNumber: z.string({
      required_error: "Staff Number is required",
    }),
    role: z.string({
      required_error: "role is required",
    }),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  category: z.string().min(1, "Category is required"),
  // subCategory: z.string().min(1, "Sub category is required"),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .min(1, "Amount must be greater than 0"),
  maxTenor: z.string().min(1, "Max tenor is required"),
  availableUnits: z
    .number({
      required_error: "Avalaible Units is required",
      invalid_type_error: "Available Units must be a number",
    })
    .min(1, "Amount must be greater than 0"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  image: z.string().optional(),
});
export const createRateSchema = z.object({
  id: z.string().optional(),
  savingsType: z
    .string()
    .min(1, { message: "Savings type is required" })
    .trim(),

  annualRate: z
    .number({
      required_error: "Annual rate is required",
      invalid_type_error: "Annual rate must be a number",
    })
    .min(0.01, { message: "Annual rate must be greater than 0" })
    .max(100, { message: "Annual rate cannot exceed 100%" }),

  active: z.boolean({
    required_error: "Status is required",
    invalid_type_error: "Status must be true or false",
  }),
});
export const createCategorySchema = z.object({
  categoryName: z
    .string({
      required_error: "Category Name is required",
    })
    .min(1, "Category Name is required"),
});
export const createSubCategorySchema = z.object({
  subCategoryName: z
    .string({
      required_error: "Category Name is required",
    })
    .min(1, "Category Name is required"),
});

export const updateUserSchema = z.object({
  status: z.string({
    required_error: "status is required",
  }),
});
