import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { Textarea } from "@/components/ui/textarea";
import type { CreatePersonType, Person } from "@/lib/personTypes";
import {
  getOnePerson,
  lookupResidents,
  updatePerson,
} from "@/services/personService";
import {
  createFormHook,
  createFormHookContexts,
  useField,
  useStore,
} from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader, Edit, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as z from "zod";
import ChooseMenu from "./ChooseMenu";
import type { Category } from "@/lib/activityLogsTypes";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import DisplayLoading from "@/components/loading";
import DisplayError from "@/components/error";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {},
  fieldContext,
  formComponents: {},
  formContext,
});

type PersonCategory = Exclude<Category, "ARTISAN">;

const optionalString = z.string().transform((e) => (e === "" ? undefined : e));
const appendLag = z.optional(
  z.string().transform((e) => (typeof e === "string" ? "LAG" + e : undefined)),
);

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name must be entered" }),
    lastName: z.string().min(1, { message: "Last name must be entered" }),
    mobile: z
      .string()
      .min(1, { message: "Phone must be entered" })
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
          .max(4, { message: "Passcode must be at most 4 characters" }),
      ),
    ),
    category: z.enum(["RESIDENT", "WORKER", "DEPENDENT", "SUPERVISOR"], {
      message: "Category is one of options",
    }),
    residentId: optionalString.pipe(
      z.optional(z.uuidv4({ message: "residentId has to be a valid uuid" })),
    ),
    employerId: optionalString.pipe(
      z.optional(z.uuidv4({ message: "employerId has to be a valid uuid" })),
    ),
  })
  .superRefine((data, ctx) => {
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

function PersonDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (!id) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Person ID is missing.</AlertDescription>
      </Alert>
    );
  }

  const personQuery = useQuery({
    queryKey: ["person-details", id],
    queryFn: () => getOnePerson(id),
  });

  const lookupQuery = useQuery({
    queryKey: ["static-residents"],
    queryFn: lookupResidents,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const editPerson = useMutation({
    mutationFn: updatePerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["person-details", id] });
      scrollTo({ top: 0, behavior: "smooth" });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const baseValues = useMemo(
    () => ({
      firstName: personQuery.data?.firstName ?? "",
      lastName: personQuery.data?.lastName ?? "",
      mobile: personQuery.data?.mobile ?? "",
      address: personQuery.data?.address ?? "",
      category: personQuery.data?.category ?? "RESIDENT",
      lagId: personQuery.data?.lagId?.slice(3) ?? "",
      employerId:
        personQuery.data?.category === "WORKER"
          ? personQuery.data.residentId
          : "",
      residentId:
        personQuery.data?.category === "DEPENDENT"
          ? personQuery.data.residentId
          : "",
      passcode: "",
    }),
    [personQuery.data],
  );

  function stripUnchanged<T extends Record<string, unknown>>(
    original: T,
    updated: T,
  ): Partial<T> {
    const result: Partial<T> = {};
    for (const key of Object.keys(updated) as (keyof T)[]) {
      if (updated[key] !== original[key]) {
        result[key] = updated[key];
      }
    }
    return result;
  }

  function buildUpdatePayload(
    original: Person,
    formValues: Omit<CreatePersonType, "durationOfStay">,
  ) {
    const { passcode, residentId, employerId, ...rest } = formValues;

    const commonFields = {
      firstName: rest.firstName,
      lastName: rest.lastName,
      mobile: rest.mobile,
      address: rest.address,
      category: rest.category,
      lagId: rest.lagId,
    };

    const diff = stripUnchanged(
      {
        firstName: original.firstName,
        lastName: original.lastName,
        mobile: original.mobile,
        address: original.address,
        category: original.category,
        lagId: original.lagId,
      },
      commonFields,
    );

    if (diff.lagId) {
      diff.lagId = "LAG" + diff.lagId;
    }

    if (formValues.category === "DEPENDENT" && residentId) {
      (diff as any).residentId = residentId;
    }
    if (formValues.category === "WORKER" && employerId) {
      (diff as any).employerId = employerId;
    }
    if (
      ["RESIDENT", "SUPERVISOR"].includes(formValues.category) &&
      passcode?.trim()
    ) {
      (diff as any).passcode = passcode;
    }

    if (
      formValues.category !== "DEPENDENT" &&
      (diff as any).residentId !== undefined
    ) {
      delete (diff as any).residentId;
    }
    if (
      formValues.category !== "WORKER" &&
      (diff as any).employerId !== undefined
    ) {
      delete (diff as any).employerId;
    }
    if (original.category === formValues.category) {
      if (
        formValues.category === "DEPENDENT" &&
        formValues.residentId === original.residentId
      ) {
        delete (diff as any).residentId;
      } else if (
        formValues.category === "WORKER" &&
        formValues.employerId === original.residentId
      )
        delete (diff as any).employerId;
    }
    console.log(diff);
    return diff;
  }

  const form = useAppForm({
    defaultValues: baseValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      if (!personQuery.data) return;
      const payload = buildUpdatePayload(personQuery.data, value);
      if (Object.keys(payload).length === 0) return;
      editPerson.mutate({ id, payload });
    },
  });

  useEffect(() => {
    if (personQuery.data) {
      form.reset(baseValues);
    }
  }, [personQuery.data, baseValues, form]);

  const formState = useStore(form.store, (state) => state.isDirty);

  const fieldState = useField({
    form,
    name: "category",
  });
  const currentCategory = fieldState.state.value;

  if (personQuery.isLoading) {
    <DisplayLoading />;
  }

  if (personQuery.error) {
    return <DisplayError description="Failed to load details." />;
  }

  return (
    <div>
      <Button
        className="flex justify-start w-fit"
        variant="ghost"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="flex flex-col gap-10 container mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Person Details</h2>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                form.reset(baseValues);
                editPerson.reset();
              }}
            >
              <X className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Cancel</span>
            </Button>
          )}
        </div>
        <form
          id="person-update-form"
          onSubmit={(event) => {
            event.preventDefault();
            editPerson.reset();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FormSuccess
              hasSuccess={showSuccess}
              title="Update Success"
              message="Person details updated"
            />
            <FormError error={editPerson.error} title="Failed to Update" />

            <form.AppField
              name="firstName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                    <Input
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
                      disabled={!isEditing}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                    <Input
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
                      disabled={!isEditing}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Mobile</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
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
                      placeholder="Mobile"
                      autoComplete="off"
                      disabled={!isEditing}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Lagos ID</FieldLabel>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        LAG
                      </span>
                      <Input
                        id={field.name}
                        name={field.name}
                        disabled={!isEditing}
                        className="rounded-l-none"
                        value={field.state.value}
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                    <Textarea
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
                      disabled={!isEditing}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <ChooseMenu
                      disabled={true}
                      options={[
                        {
                          name: "Resident",
                          value: "RESIDENT" as PersonCategory,
                        },
                        { name: "Worker", value: "WORKER" as PersonCategory },
                        {
                          name: "Dependent",
                          value: "DEPENDENT" as PersonCategory,
                        },
                        {
                          name: "Supervisor",
                          value: "SUPERVISOR" as PersonCategory,
                        },
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
                  </Field>
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
                    <Field>
                      <FieldLabel htmlFor={field.name}>Pin</FieldLabel>
                      <InputPassword
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
                        disabled={!isEditing}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
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
                    <Field>
                      <FieldLabel htmlFor={field.name}>Resident</FieldLabel>
                      <ChooseMenu
                        options={lookupQuery.data ?? []}
                        state={field.state.value}
                        label={
                          lookupQuery.data?.find(
                            (item) => item.value === field.state.value,
                          )?.name ?? "Select Resident"
                        }
                        handleSelect={(option) =>
                          field.handleChange(option.value)
                        }
                        disabled={!isEditing}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
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
                    <Field>
                      <FieldLabel htmlFor={field.name}>Employer</FieldLabel>
                      <ChooseMenu
                        options={lookupQuery.data ?? []}
                        state={field.state.value}
                        label={
                          lookupQuery.data?.find(
                            (item) => item.value === field.state.value,
                          )?.name ?? "Select Employer"
                        }
                        handleSelect={(option) =>
                          field.handleChange(option.value)
                        }
                        disabled={!isEditing}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            )}

            {isEditing && (
              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset(baseValues)}
                  disabled={editPerson.isPending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  form="person-update-form"
                  disabled={editPerson.isPending || !formState}
                >
                  {editPerson.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

export default PersonDetails;
