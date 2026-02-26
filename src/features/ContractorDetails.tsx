import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import type { CreateContractorType } from "@/lib/contractorTypes";
import {
  updateContractor,
  getOneContractor,
  deleteContractor,
  restoreContractor,
} from "@/services/contractorService";
import {
  useStore,
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Loader,
  ArrowLeft,
  Trash2,
  RotateCcw,
  Edit,
  X,
  ChevronDown,
} from "lucide-react";
import * as z from "zod";
import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import DisplayLoading from "@/components/loading";
import DisplayError from "@/components/error";
import FormSuccess from "@/components/form-success";
import FormError from "@/components/form-error";
import { cn } from "@/lib/utils";

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
  },
  fieldContext,
  formComponents: {
    Button,
    FieldGroup,
  },
  formContext,
});

const formSchema = z.object({
  name: z.string().min(1, "Name must be entered"),
  email: z.email({ message: "Email is not valid" }),
  phone: z
    .string()
    .regex(/^(070|080|090|081|091)\d{8}$/, { message: "Invalid phone number" }),
  passcode: z
    .string()
    .min(5, "Passcode must be at least 5 characters long")
    .or(z.literal("")),
});

function ContractorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpandState] = useState(false);

  if (!id) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Contractor ID is missing.</AlertDescription>
      </Alert>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["contractor-details", id],
    queryFn: () => getOneContractor(id),
  });

  const baseValues = useMemo(
    () => ({
      name: data?.data.contractor.name ?? "",
      phone: data?.data.contractor.phone ?? "",
      email: data?.data.contractor.email ?? "",
      passcode: "",
    }),
    [data],
  );

  const editContractor = useMutation({
    mutationFn: updateContractor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contractor-details", id],
      });
      setShowSuccess(true);
      scrollTo({ top: 0, behavior: "smooth" });
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const removeContractor = useMutation({
    mutationFn: deleteContractor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contractor-details", id],
      });
      await queryClient.invalidateQueries({ queryKey: ["contractors"] });
      navigate(-1);
    },
  });

  const reactivateContractor = useMutation({
    mutationFn: restoreContractor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contractor-details", id],
      });
      await queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });

  function stripUnchanged<T extends object>(
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
    original: Omit<CreateContractorType, "passcode">,
    formValues: CreateContractorType,
  ) {
    const { passcode, ...rest } = formValues;
    const diff = stripUnchanged(original, rest);
    return {
      ...diff,
      ...(passcode.trim() ? { passcode } : {}),
    };
  }

  const form = useAppForm({
    defaultValues: baseValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      if (!data) return;
      const payload = buildUpdatePayload(data.data.contractor, value);
      if (Object.keys(payload).length === 0) {
        return;
      }
      editContractor.mutate({
        id: id,
        payload,
      });
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(baseValues);
    }
  }, [data, baseValues, form]);

  const formState = useStore(form.store, (state) => state.isDirty);

  if (isLoading) {
    return <DisplayLoading />;
  }

  if (error) {
    return <DisplayError description="Failed to load contractor details" />;
  }

  return (
    <div>
      <section>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </section>
      <section className="flex flex-col container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Information</h3>
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
                editContractor.reset();
              }}
            >
              <X className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Cancel</span>
            </Button>
          )}
        </div>
        <div>
          <form
            id="contractor-update-form"
            onSubmit={(event) => {
              event.preventDefault();
              editContractor.reset();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <FormSuccess
                hasSuccess={showSuccess}
                title="Update Successful"
                message="Contractor updated successfully"
              />
              <FormError error={editContractor.error} title="Update Failed" />
              <form.AppField
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Name..."
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
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      <field.Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /\D/g,
                            "",
                          );
                          field.handleChange(numericValue);
                        }}
                        placeholder="Phone..."
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
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Email..."
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
                name="passcode"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <InputPassword
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const validValue = e.target.value.replace(/\s/g, "");
                          field.handleChange(validValue);
                        }}
                        placeholder="Password..."
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
            </FieldGroup>
          </form>
          {isEditing && (
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={editContractor.isPending}
                onClick={() => {
                  form.reset(baseValues);
                }}
              >
                Reset
              </Button>
              <Button
                disabled={!formState || editContractor.isPending}
                type="submit"
                form="contractor-update-form"
              >
                {editContractor.isPending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save</>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>
      {/* Danger Zone */}
      <section>
        <Button
          className={cn(expanded ? "underline" : "")}
          onClick={() => {
            setExpandState(!expanded);
            if (expanded === false) {
              scrollTo({ top: window.outerHeight, behavior: "smooth" });
            } else {
              scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          variant="link"
        >
          Advanced Options
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              expanded ? "rotate-180" : "rotate-0",
            )}
          />
        </Button>
        <div
          className={cn(
            "mb-2 rounded-lg border border-destructive/50 bg-destructive/5 p-4",
            "grid transition-all duration-300 ease-in-out",
            expanded
              ? "grid-rows-[1fr] opacity-100 mt-4"
              : "grid-rows-[0fr] opacity-0 mt-0",
          )}
        >
          <h3 className="mb-2 text-lg font-medium text-destructive">
            Deactivate Contractor
          </h3>

          {data?.data.contractor.deletedAt === null ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Deactivating a contractor will remove all their site engagements
                and assignments.
                <br />
                <span className="font-bold">
                  You can restore the contractor later if needed.
                </span>
              </p>
              <div className="flex justify-start">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={removeContractor.isPending}
                    >
                      {removeContractor.isPending ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Deactivate Contractor
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all site engagements and assignments
                        for
                        <br />
                        <span className="font-bold">
                          "{(data?.data.contractor.name ?? "").toUpperCase()}"
                        </span>
                        <br />
                        You can restore the contractor later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeContractor.mutate(id)}
                        className="bg-destructive text-white hover:bg-destructive/70"
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <FormError
                error={removeContractor.error}
                title="Failed to Update"
              />
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                This contractor has been deleted. You can restore them to make
                them active again.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={reactivateContractor.isPending}
                  >
                    {reactivateContractor.isPending ? (
                      <>
                        Restoring...
                        <Loader className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore Contractor
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore contractor?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will restore "{data?.data.contractor.name}" and make
                      them active again. Previous site engagements will not be
                      restored.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => reactivateContractor.mutate(id)}
                    >
                      Restore
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <FormError
                error={reactivateContractor.error}
                title="Failed to Update"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
export default ContractorDetails;
