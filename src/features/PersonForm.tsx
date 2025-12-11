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
const appendLag = z
  .string()
  .transform((e) => (typeof e === "string" ? "LAG" + e : undefined));
const ston = z.string().transform((e) => (e === "" ? 0 : Number(e)));

const formSchema = z.object({
  firstName: z.string().min(1, "First name must be entered"),
  lastName: z.string().min(1, "last name must be entered"),
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
  // FIXME: Password restriced to only digits
    passcode: optionalString.pipe(
    z.optional(
      z
        .string()
        .min(4, { message: "Passcode must be at least 4 characters long" })
        .max(4, { message: "Passcode must be at most 4 characters"}),
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
});

function PersonForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["static-residents"],
    queryFn: lookupResidents,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: createPerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
    onSettled: () => {
      form.reset();
      setShow(false);
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
      category: "RESIDENT" as Category,
      durationOfStay: "",
      employerId: "",
      residentId: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = formSchema.safeParse(value);
      if (!result.success) {
        console.error("Form validation failed", result.error);
        return;
      }
      console.log("Clean Data", result.data);
      mutation.mutateAsync(result.data, {
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

  const something = useField({
    form,
    name: "category",
  });
  const currentCategory = something.state.value;

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
              "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
            )}
          >
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {mutation.error instanceof AxiosError
                    ? `${mutation.error.message}\n${mutation.error.response ? mutation.error.response.data.message.join(" ") : ""}`
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
                        field.handleBlur;
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
                        field.handleBlur;
                      }}
                      onChange={(event) => {
                        const value = event.target.value;
                        const numericVal = value.replace(/\D/, "");
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
                      Lagos ID
                    </field.FieldLabel>
                    <div
                      className={cn(
                        "relative flex items-center",
                        "rounded-md border border-input",
                        " focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                      )}
                    >
                      <span
                        className={cn(
                          "text-black-500",
                          "px-2 border-r rounded-l-md",
                          "font-mono text-sm",
                        )}
                      >
                        LAG
                      </span>
                      <field.Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        className="border-none ring-0 shadow-none rounded-l-none"
                        onBlur={(e) => {
                          field.handleChange(e.target.value.trim());
                          field.handleBlur();
                        }}
                        onChange={(event) => {
                          const numericVal = event.target.value.replace(
                            /\D/,
                            "",
                          );
                          field.handleChange(numericVal);
                        }}
                        placeholder="Lagos ID"
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
                        field.handleBlur;
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
                    {/*Dropdown menu*/}
                    <field.ChooseMenu
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
                        if (option.value !== "RESIDENT")
                          form.setFieldValue("passcode", "");
                        if (option.value !== "DEPENDENT")
                          form.setFieldValue("residentId", "");
                        if (option.value !== "SUPERVISOR")
                          form.setFieldValue("passcode", "");
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
                      placeholder="Duration..."
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />

            {["RESIDENT", "SUPERVISOR"].includes(currentCategory) && (
              <form.AppField
                name="passcode"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <field.Field>
                      <field.FieldLabel htmlFor={field.name}>
                        Passcode
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
                        placeholder="Passcode..."
                        autoComplete="off"
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
