"use strict";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputPassword } from "@/components/ui/input-password";
import { updatePassword } from "@/services/adminService";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertCircle, Edit2, Loader } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { formContext, fieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    Field,
    FieldError,
    FieldLabel,
    InputPassword,
  },
  fieldContext,
  formComponents: {
    FieldGroup,
  },
  formContext,
});

const formSchema = z
  .object({
    password: z
      .string()
      .regex(/^.{5,}$/, {
        message: "Password must be at least 5 characters long",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain one uppercase character",
      })
      .regex(/[0-9]/, { message: "Password must contain one digit" }),
    repeatPassword: z.string(),
    oldPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

function UpdateAdminPasswordForm() {
  const [show, setShow] = useState<boolean>(false);
  const updatePasswordFn = useMutation({
    mutationFn: updatePassword,
    onSuccess: async () => {
      form.reset();
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
      repeatPassword: "",
      oldPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await formSchema.safeParseAsync(value);
      if (result.error) {
        return;
      }
      updatePasswordFn.mutate({
        password: result.data.password,
        oldPassword: result.data.oldPassword,
      });
    },
  });

  function generateErrorMessage(err: Error) {
    if (err instanceof AxiosError) {
      if (err.status === 401) {
        return "Old password is incorrect";
      } else if (err.code?.charAt(0) === "5") {
        return err.message ?? "Internal Server Error";
      }
    }
    return err.message;
  }

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit2 className="h-5 w-5 mr-2" />
          <span> Change Password </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Change Admin Password</DialogHeader>
        <DialogDescription>Set a new admin password</DialogDescription>
        <form
          id="update-admin-password"
          onSubmit={(e) => {
            e.preventDefault();
            updatePasswordFn.reset();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup>
            {updatePasswordFn.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {generateErrorMessage(updatePasswordFn.error)}
                </AlertDescription>
              </Alert>
            )}
            <form.AppField
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel>New Password</field.FieldLabel>
                    <field.InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="New password ..."
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />

            <form.AppField
              name="repeatPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel>Repeat Password</field.FieldLabel>
                    <field.InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Repeat password ..."
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />

            <form.AppField
              name="oldPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel>Old Password</field.FieldLabel>
                    <field.InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Old password ..."
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppForm>
              <Field orientation="vertical">
                <Button type="submit" disabled={updatePasswordFn.isPending}>
                  {updatePasswordFn.isPending ? (
                    <>
                      Updating...{" "}
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>Update</>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={updatePasswordFn.isPending}
                  >
                    Close
                  </Button>
                </DialogClose>
              </Field>
            </form.AppForm>
          </form.FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateAdminPasswordForm;
