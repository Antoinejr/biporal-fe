import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { cn } from "@/lib/utils";
import { createContractor } from "@/services/contractorService";
import { Dialog, DialogClose } from "@radix-ui/react-dialog";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    Field,
    FieldLabel,
    FieldError,
    Input,
    InputPassword,
  },
  formComponents: {
    FieldGroup,
    Button,
  },
  fieldContext,
  formContext,
});

const formSchema = z.object({
  name: z.string().min(1, "Name must be entered"),
  phone: z
    .string()
    .min(1, "Phone must be entered")
    .regex(/^(070|080|090|081|091)\d{8}$/, {
      message: "Invalid phone number",
    }),
  email: z.email({ message: "Email is not valid" }),
  passcode: z.string().min(5, "Passcode must be at least 5 characters long"),
});

function ContractorForm() {
  const queryClient = useQueryClient();
  const [show, setShow] = useState<boolean>(false);
  const mutation = useMutation({
    mutationFn: createContractor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contractors"],
      });
      await queryClient.refetchQueries({
        queryKey: ["static-contractors"],
        exact: true,
      });
      form.reset();
      mutation.reset();
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      passcode: "",
    },
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      const cleanedValue = {
        name: value.name.trim().toLowerCase(),
        phone: value.phone.replace(/[\D\s]/g, ""),
        email: value.email.replace(/\s/g, "").toLowerCase(),
        passcode: value.passcode.trim(),
      };
      console.log("Submitting contractor form", cleanedValue);
      mutation.mutate(cleanedValue);
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="default">Register</Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Register Contractor</DialogTitle>
        </DialogHeader>
        <form
          id="contractor-form"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup className="gap-2">
            <FormError error={mutation.error} title="Failed to Create" />
            <form.AppField
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field data-invalid={isInvalid}>
                    <field.FieldLabel htmlFor={field.name}>
                      Name
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Name..."
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppField
              name="phone"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Phone
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        field.handleChange(numericValue);
                      }}
                      placeholder="Phone..."
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppField
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Email
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Email..."
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppField
              name="passcode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Password
                    </field.FieldLabel>
                    <field.InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(e) => {
                        const validValue = e.target.value.replace(/\s/g, "");
                        field.handleChange(validValue);
                      }}
                      placeholder="Password..."
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppForm>
              <Field orientation="horizontal">
                <form.Button type="submit">
                  {mutation.isPending ? (
                    <>
                      Submitting....{" "}
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </form.Button>
                <DialogClose asChild>
                  <form.Button type="button" variant="outline">
                    Close
                  </form.Button>
                </DialogClose>
              </Field>
            </form.AppForm>
          </form.FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ContractorForm;
