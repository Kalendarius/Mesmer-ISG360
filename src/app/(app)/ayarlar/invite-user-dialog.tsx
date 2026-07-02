"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validation/organization";
import { USER_ROLE_LABELS } from "@/lib/utils/enums";
import { inviteUserAction } from "./actions";

const INVITABLE_ROLES = ["organization_admin", "safety_expert", "viewer"] as const;

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: "", role: "safety_expert" },
  });

  const onSubmit = (data: InviteUserInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await inviteUserAction(data);
      if (result?.error) setFormError(result.error);
      else {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" />}>
        <Plus className="size-4" />
        Kullanıcı Davet Et
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kullanıcı Davet Et</DialogTitle>
          <DialogDescription>
            Girilen e-posta adresine bir davet bağlantısı gönderilir; kullanıcı bağlantıya tıklayıp kendi şifresini
            belirler.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="invite_email">E-posta *</Label>
            <Input id="invite_email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-risk-high">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite_role">Rol *</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} items={USER_ROLE_LABELS}>
                  <SelectTrigger id="invite_role" className="w-full">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {USER_ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {formError && <p className="text-sm text-risk-high">{formError}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Gönderiliyor..." : "Daveti Gönder"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
