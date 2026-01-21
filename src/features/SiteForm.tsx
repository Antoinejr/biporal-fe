import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createSite } from "@/services/siteService";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertCircle, Loader } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  formComponents: {
    FieldGroup,
    Button,
  },
  fieldComponents: {
    Input,
    Textarea,
    Field,
    FieldLabel,
    FieldError,
  },
  fieldContext,
  formContext,
});

const formSchema = z.object({
  name: z.string().trim().min(1, "Name must be entered"),
  address: z.string().trim().min(1, "Address must be entered"),
  owner: z.string().trim().min(1, "Address must be entered"),
  contact: z
    .string()
    .min(1, "Phone must be entered")
    .regex(/^(070|080|090|081|091)\d{8}$/, {
      message: "Invalid phone number",
    }),
});

const SiteForm = () => {
  const queryClient = useQueryClient();
  const [show, setShow] = useState<boolean>(false);
  const mutation = useMutation({
    mutationFn: createSite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sites"],
      });
      await queryClient.refetchQueries({
        queryKey: ["static-sites"],
        exact: true,
      });
      form.reset();
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      address: "",
      owner: "",
      contact: ""
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = formSchema.safeParse(value);
      if (!result.success) {
        console.error("Form validaiton faild", result.error);
        return;
      }
      console.log("Submitting clean data", result.data);
      mutation.mutate(result.data);
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="default">Register</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Site</DialogTitle>
        </DialogHeader>
        <form
          id="site-form"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.reset();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup className={cn("grid grid-cols-1]")}>
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {mutation.error instanceof AxiosError
                    ? `${mutation.error.message}\n${mutation.error.response ? mutation.error.response.data.message : ""}`
                    : mutation.error instanceof Error
                      ? mutation.error.message
                      : "Failed to create contractor. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            <form.AppField
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
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
              name="address"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Address
                    </field.FieldLabel>
                    <field.Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Address..."
                      autoComplete="off"
                      aria-multiline
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />

            <form.AppField
              name="owner"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Owner
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
                      placeholder="Owner..."
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
              name="contact"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Contact
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
                      placeholder="Contact..."
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
};
export default SiteForm;
