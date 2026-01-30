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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import type { Category } from "@/lib/activityLogsTypes";
import { cn } from "@/lib/utils";
import { createPerson, lookupResidents } from "@/services/personService";
import {
  createFormHook,
  createFormHookContexts,
  useField,
} from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertCircle, Loader } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import ChooseMenu from "./ChooseMenu";
import { Textarea } from "@/components/ui/textarea";

type PersonFormProps = {
  category: Category
}

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    Textarea,
    Input,
    InputPassword,
    ChooseMenu,
  },
  formComponents: {
    Button,
    FieldGroup,
  },
  fieldContext,
  formContext,
});

const optionalString = z.string().transform((e) => (e === "" ? undefined : e));
const appendLag = z.optional(
  z.string().transform((e) => (typeof e === "string" ? "LAG" + e : undefined)),
);
const ston = z.string().transform((e) => (e === "" ? 0 : Number(e)));

const formSchema = z
  .object({
    firstName: z.string().min(1, "First name must be entered"),
    lastName: z.string().min(1, "Last name must be entered"),
    mobile: z
      .string()
      .min(1, "Phone must be entered")
      .regex(/^(070|080|090|081|091)\d{8}$/, {
        message: "Invalid phone number",
      }),
    address: z.string().min(1, { message: "Address cannot be empty" }),
    lagId: optionalString.pipe(
      appendLag.pipe(
        z.optional(
          z.string().regex(/^LAG\d{10}$/, { message: "Invalid Lag ID" }),
        ),
      ),
    ),
    passcode: optionalString.pipe(
      z.optional(
        z
          .string()
          .min(4, { message: "Passcode must be at least 4 characters long" })
          .max(4, { message: "Passcode must be at most 4 characters" })
      ),
    ),
    category: z.enum(["RESIDENT", "WORKER", "DEPENDENT", "SUPERVISOR"], {
      message: "Category is one of options",
    }),
    durationOfStay: ston.pipe(
      z
        .int({ message: "None integers not allowed" })
        .min(1, { message: "Minimum allowed days is 1" }),
    ),
    residentId: optionalString.pipe(
      z.optional(z.uuidv4({ message: "residentId has to be a valid uuidv4" })),
    ),
    employerId: optionalString.pipe(
      z.optional(z.uuidv4({ message: "employerId has to be a valid uuidv4" })),
    ),
  })
  .superRefine((data, ctx) => {
    if (["SUPERVISOR"].includes(data.category) && !data.passcode) {
      ctx.addIssue({
        code: "custom",
        message: "Passcode is required for supervisors",
        path: ["passcode"],
      });
    }

    if (data.category === "DEPENDENT" && !data.residentId) {
      ctx.addIssue({
        code: "custom",
        message: "Resident is required for dependents",
        path: ["residentId"],
      });
    }

    if (data.category === "WORKER" && !data.employerId) {
      ctx.addIssue({
        code: "custom",
        message: "Employer is required for workers",
        path: ["employerId"],
      });
    }
  });

function PersonForm({ category }: PersonFormProps) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["static-residents"],
    queryFn: lookupResidents,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: createPerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["persons"] });
      setShow(false);
      form.reset();
    },
  });

  const [show, setShow] = useState<boolean>(false);
  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      address: "",
      lagId: "",
      passcode: "",
      category: category as Category,
      durationOfStay: "",
      employerId: "",
      residentId: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await formSchema.safeParseAsync(value);
      if (!result.success) {
        console.error("Form validation failed", result.error);
        return;
      }
      console.log("Clean Data", result.data);
      mutation.mutate(result.data, {
        onSuccess: async () => {
          if (result.data.category === "RESIDENT") {
            await queryClient.refetchQueries({
              queryKey: ["static-residents"],
              exact: true,
            });
          }
        },
      });
    },
  });

  const fieldState = useField({
    form,
    name: "category",
  });
  const currentCategory = fieldState.state.value;

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="default">Register</Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Register Person</DialogTitle>
        </DialogHeader>
        <form
          id="person-form"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.reset();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup
            className={cn(
              "grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))]",
            )}
          >
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
              name="firstName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      First Name
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="First Name..."
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
              name="lastName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Last Name
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Last Name..."
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
              name="mobile"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Mobile
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleChange(e.target.value.trim());
                        field.handleBlur();
                      }}
                      onChange={(event) => {
                        const value = event.target.value;
                        const numericVal = value.replace(/\D/g, "");
                        field.handleChange(numericVal);
                      }}
                      placeholder="Mobile"
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
              name="lagId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      {" "}
                      Lagos ID{" "}
                    </field.FieldLabel>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        LAG
                      </span>
                      <field.Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        className="rounded-l-none"
                        onBlur={(e) => {
                          field.handleChange(e.target.value.trim());
                          field.handleBlur();
                        }}
                        onChange={(event) => {
                          const numericVal = event.target.value.replace(
                            /\D/g,
                            "",
                          );
                          field.handleChange(numericVal);
                        }}
                        placeholder="Lagos Resident ID"
                        autoComplete="off"
                        maxLength={10}
                      />
                    </div>
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
                  <field.Field className={cn("col-span-full")}>
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Address"
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
              name="category"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field className={cn("col-span-full")}>
                    <field.FieldLabel htmlFor={field.name}>
                      Category
                    </field.FieldLabel>
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                    <field.ChooseMenu
                      disabled={true}
                      options={[
                        { name: "Resident", value: "RESIDENT" as Category },
                        { name: "Worker", value: "WORKER" as Category },
                        { name: "Dependent", value: "DEPENDENT" as Category },
                        { name: "Supervisor", value: "SUPERVISOR" as Category },
                      ]}
                      state={field.state.value}
                      label={field.state.value}
                      handleSelect={(option) => {
                        field.handleChange(option.value);
                        if (option.value !== "WORKER")
                          form.setFieldValue("employerId", "");
                        if (
                          !["RESIDENT", "SUPERVISOR"].includes(option.value)
                        ) {
                          form.setFieldValue("passcode", "");
                        }
                        if (option.value !== "DEPENDENT")
                          form.setFieldValue("residentId", "");
                      }}
                    />
                  </field.Field>
                );
              }}
            />

            <form.AppField
              name="durationOfStay"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Duration
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const value = event.target.value;
                        let numericVal = value.replace(/\D/g, "");
                        if (numericVal.length > 1) {
                          numericVal = numericVal.replace(/^0+(?=\d)/, "");
                        }
                        field.handleChange(numericVal);
                      }}
                      placeholder="Length of days of access"
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />

            {["SUPERVISOR"].includes(currentCategory) && (
              <form.AppField
                name="passcode"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <field.Field>
                      <field.FieldLabel htmlFor={field.name}>
                        Pin
                      </field.FieldLabel>
                      <field.InputPassword
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const validValue = e.target.value.replace(/\D/g, "");
                          field.handleChange(validValue);
                        }}
                        placeholder="Pin..."
                        autoComplete="off"
                        maxLength={4}
                      />
                      {isInvalid && (
                        <field.FieldError errors={field.state.meta.errors} />
                      )}
                    </field.Field>
                  );
                }}
              />
            )}
            {currentCategory === "DEPENDENT" && (
              <form.AppField
                name="residentId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <field.Field>
                      <field.FieldLabel htmlFor={field.name}>
                        Resident
                      </field.FieldLabel>
                      <field.ChooseMenu
                        options={data ?? []}
                        state={field.state.value}
                        label={
                          data?.find((item) => item.value === field.state.value)
                            ?.name ?? "Select Resident"
                        }
                        handleSelect={(option) =>
                          field.handleChange(option.value)
                        }
                      />
                      {isInvalid && (
                        <field.FieldError errors={field.state.meta.errors} />
                      )}
                    </field.Field>
                  );
                }}
              />
            )}

            {currentCategory === "WORKER" && (
              <form.AppField
                name="employerId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <field.Field>
                      <field.FieldLabel htmlFor={field.name}>
                        Employer
                      </field.FieldLabel>
                      <field.ChooseMenu
                        options={data ?? []}
                        state={field.state.value}
                        label={
                          data?.find((item) => item.value === field.state.value)
                            ?.name ?? "Select Employer"
                        }
                        handleSelect={(option) =>
                          field.handleChange(option.value)
                        }
                      />
                      {isInvalid && (
                        <field.FieldError errors={field.state.meta.errors} />
                      )}
                    </field.Field>
                  );
                }}
              />
            )}
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

export default PersonForm;
