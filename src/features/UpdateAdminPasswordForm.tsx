import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputPassword } from "@/components/ui/input-password";
import { Separator } from "@/components/ui/separator";
import { updatePassword } from "@/services/adminService";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Loader, ShieldCheck } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { formContext, fieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {},
  fieldContext,
  formComponents: {},
  formContext,
});

const PASSWORD_SCHEMA = z
  .object({
    oldPassword: z.string().min(1, "Please enter the current password"),
    password: z
      .string()
      .regex(/^.{5,}$/, {
        message: "Password must be at least 5 characters",
      })
      .regex(/[A-Z]/, {
        message: "Include at least one capital letter",
      })
      .regex(/[0-9]/, { message: "Include at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords you entered do not match",
    path: ["confirmPassword"],
  });

function UpdateAdminPasswordForm() {
  const [show, setShow] = useState<boolean>(false);
  const mutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: async () => {
      form.reset();
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
      oldPassword: "",
    },
    validators: {
      onSubmit: PASSWORD_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      const result = await PASSWORD_SCHEMA.safeParseAsync(value);
      if (result.error) {
        return;
      }
      mutation.mutate({
        password: result.data.password,
        oldPassword: result.data.oldPassword,
      });
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          Update Password
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Login Password</DialogTitle>
          <DialogDescription>
            Changes will take effect immediately. You will use the new password
            for your next login.
          </DialogDescription>
        </DialogHeader>

        <form
          id="update-admin-password"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.reset();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FormError error={mutation.error} title="Password Update Failed" />

            <form.AppField
              name="oldPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>Old Password</FieldLabel>
                    <InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="••••••••"
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <Separator className="my-4" />

            <form.AppField
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="••••••••"
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <Separator className="my-4" />

            <form.AppField
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="••••••••"
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.AppForm>
              <Field orientation="vertical">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>Confirm Password Change</>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={mutation.isPending}
                  >
                    Keep Current Password
                  </Button>
                </DialogClose>
              </Field>
            </form.AppForm>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateAdminPasswordForm;
