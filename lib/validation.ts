import { z } from "zod";
import { PASSWORD_MIN_LENGTH, evaluatePasswordRules } from "@/lib/password-rules";

export const ALLOWED_EMAIL_DOMAINS = ["mnu.kz", "kazguu.kz"] as const;
const allowedEmailDomainMessage = "Разрешены только домены @mnu.kz и @kazguu.kz";

export function isAllowedEmailDomain(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  if (!domain) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(domain as (typeof ALLOWED_EMAIL_DOMAINS)[number]);
}

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`)
  .refine((value) => evaluatePasswordRules(value).hasLower, {
    message: "Пароль должен содержать хотя бы одну строчную букву"
  })
  .refine((value) => evaluatePasswordRules(value).hasUpper, {
    message: "Пароль должен содержать хотя бы одну заглавную букву"
  })
  .refine((value) => evaluatePasswordRules(value).hasDigit, {
    message: "Пароль должен содержать хотя бы одну цифру"
  });

const restrictedEmailSchema = z
  .string()
  .email()
  .refine((value) => isAllowedEmailDomain(value), {
    message: allowedEmailDomainMessage
  });

export const posterFeatureBlockSchema = z.object({
  title: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1).max(3)
});

export const posterTimelineItemSchema = z.object({
  time: z.string().min(1),
  text: z.string().min(1)
});

export const tourPlanItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1)
});

export const posterTemplateSchema = z.object({
  posterA: z.object({
    heroTagline: z.string().min(1).default("-"),
    featureBlocks: z.array(posterFeatureBlockSchema).min(1).max(8).default([{ title: "-", lines: ["-"] }]),
    priceLabel: z.string().min(1).default("-")
  }).default({
    heroTagline: "-",
    featureBlocks: [{ title: "-", lines: ["-"] }],
    priceLabel: "-"
  }),
  posterB: z.object({
    programTitle: z.string().min(1).default("-"),
    timeline: z.array(posterTimelineItemSchema).min(1).max(16).default([{ time: "-", text: "-" }]),
    priceLabel: z.string().min(1).default("-"),
    registerNote: z.string().min(1).default("-")
    }).default({
      programTitle: "-",
      timeline: [{ time: "-", text: "-" }],
      priceLabel: "-",
      registerNote: "-"
    }),
  tourDetails: z.object({
    included: z.array(z.string().min(1)).default([]),
    excluded: z.array(z.string().min(1)).default([]),
    plan: z.array(tourPlanItemSchema).default([])
  }).default({
    included: [],
    excluded: [],
    plan: []
  }),
  posterUrls: z.array(z.string().url()).default([])
});

export const translationInputSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  posterTemplateData: posterTemplateSchema,
  translationStatus: z.enum(["MANUAL", "AUTO_GENERATED", "AUTO_EDITED"]).optional(),
  translationVersion: z.number().int().min(1).optional(),
  sourceRuHash: z.string().optional().nullable()
});

export const tourInputSchema = z.object({
  slug: z.string().min(3),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  coverImage: z.string().url(),
  gallery: z.array(z.string().url()),
  price: z.number().int().nonnegative(),
  studentLimit: z.number().int().positive().max(500).default(40),
  duration: z.string().min(1),
  meetingTime: z.string().min(1),
  tourDate: z.string().min(1),
  place: z.string().min(1),
  location: z.string().min(1),
  translations: z.object({
    kz: translationInputSchema,
    ru: translationInputSchema,
    en: translationInputSchema
  })
});

export const translateRequestSchema = z.object({
  ru: translationInputSchema,
  overwrite: z.boolean().optional().default(false)
});

export const posterSettingsSchema = z.object({
  brandTitle: z.string().min(1),
  brandSubtitle: z.string().min(1),
  instagramHandle: z.string().min(1),
  footerAddress: z.string().min(1),
  topFrameText: z.string().min(1),
  bottomFrameText: z.string().min(1),
  decorTokens: z.record(z.string(), z.any()).optional()
});

export const userCreateSchema = z.object({
  email: restrictedEmailSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "MANAGER", "STUDENT"]),
  isActive: z.boolean()
});

export const userUpdateSchema = z.object({
  email: restrictedEmailSchema.optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional()
});

export const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "STUDENT"])
});

export const teamMemberCreateSchema = z.object({
  fullNameRu: z.string().min(2),
  fullNameKz: z.string().min(2),
  fullNameEn: z.string().min(2),
  positionRu: z.string().min(2),
  positionKz: z.string().min(2),
  positionEn: z.string().min(2),
  photoUrl: z.string().url(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true)
});

export const teamMemberUpdateSchema = z.object({
  fullNameRu: z.string().min(2).optional(),
  fullNameKz: z.string().min(2).optional(),
  fullNameEn: z.string().min(2).optional(),
  positionRu: z.string().min(2).optional(),
  positionKz: z.string().min(2).optional(),
  positionEn: z.string().min(2).optional(),
  photoUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

export const studentRegisterSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  university: z.string().min(2),
  email: restrictedEmailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(PASSWORD_MIN_LENGTH)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const studentProfileUpdateSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  university: z.string().min(2),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(400).optional().or(z.literal(""))
});

export const studentMomentCreateSchema = z.object({
  tourPostId: z.string().min(1),
  photoUrl: z.string().url(),
  captionRu: z.string().min(2),
  captionKz: z.string().min(2),
  captionEn: z.string().min(2)
});

export const studentTourApplicationCreateSchema = z.object({
  tourPostId: z.string().min(1),
  comment: z.string().max(1000).optional()
});

export const adminApplicationStatusUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "GOING", "NOT_GOING"]),
  note: z.string().max(1000).optional()
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email()
});

export const forgotPasswordConfirmSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  password: passwordSchema,
  confirmPassword: z.string().min(PASSWORD_MIN_LENGTH)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
