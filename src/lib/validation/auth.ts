import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-posta zorunludur.").email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre zorunludur."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "E-posta zorunludur.").email("Geçerli bir e-posta adresi girin."),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
    passwordConfirm: z.string().min(1, "Şifre tekrarı zorunludur."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifreler eşleşmiyor.",
    path: ["passwordConfirm"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(1, "Ad soyad zorunludur."),
  phone: z.string(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Ad soyad zorunludur."),
    companyName: z.string().min(1, "Firma/kuruluş adı zorunludur."),
    email: z.string().min(1, "E-posta zorunludur.").email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
    passwordConfirm: z.string().min(1, "Şifre tekrarı zorunludur."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifreler eşleşmiyor.",
    path: ["passwordConfirm"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;
