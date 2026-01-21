import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateSiteType, SiteType } from "@/lib/siteTypes";
import { cn, formatCurrency } from "@/lib/utils";
import { findSite, updateSite } from "@/services/siteService";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader,
  Edit,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    Textarea,
    Input,
  },
  fieldContext,
  formComponents: {
    Button,
    FieldGroup,
  },
  formContext,
});

const optionalString = z.string().transform((e) => (e === "" ? undefined : e));
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  owner: optionalString.pipe(z.string().min(1, {message: "Address must be entered"})),
  contact: optionalString.pipe(z
    .string()
    .min(1, "Phone must be entered")
    .regex(/^(070|080|090|081|091)\d{8}$/, {
      message: "Invalid phone number",
    })),
});

function SiteDetails() {
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["site-details", id],
    queryFn: () => findSite(id),
  });

  const editSite = useMutation({
    mutationFn: updateSite, onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-details", id] });
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 4000);
    },
  });

  const baseValues = useMemo(
    () => ({
      name: data?.name ?? "",
      address: data?.address ?? "",
      owner: data?.owner ?? "",
      contact: data?.contact ?? "",
    }),
    [data],
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

  function buildUpdatePayload(original: SiteType, formValues: CreateSiteType) {
    const { id, balance, createdAt, updatedAt, deletedAt, contractors, ...rest } = original;
    const diff = stripUnchanged(rest, formValues);
    return diff;
  }

  const form = useAppForm({
    defaultValues: baseValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      if (!data) return;
      const payload = buildUpdatePayload(data, value);
      if (Object.keys(payload).length === 0) return;
      editSite.mutate({ id, payload });
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(baseValues);
    }
  }, [data, baseValues, form]);

  const formState = useStore(form.store, (state) => state.isDirty);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load person details. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("grid gap-10 container mx-auto max-w-full")}>
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div
        className={cn(
          "flex flex-col",
          "w-full",
          "gap-5",
          "justify-center",
          "items-center",
        )}
      >
        <div className="flex-1 flex flex-col gap-4 p-6 border rounded-lg bg-muted/50 min-w-2xl w-full max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Site Information</h3>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Current Balance
            </span>
            <span className="text-2xl font-bold">
              {formatCurrency(data?.balance ?? 0)}
            </span>
          </div>
        </div>
        <form
          id="site-update-form"
          onSubmit={(event) => {
            event.preventDefault();
            editSite.reset();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup className="shrink-0 w-2xl">
            {showSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>Site updated successfully.</AlertDescription>
              </Alert>
            )}

            {editSite.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {editSite.error instanceof AxiosError
                    ? `${editSite.error.message}\n${
                        editSite.error.response
                          ? editSite.error.response.data.message
                          : ""
                      }`
                    : editSite.error instanceof Error
                      ? editSite.error.message
                      : "Failed to update site. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            {!isEditing ? (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset(baseValues);
                    editSite.reset();
                  }}
                >
                  <X className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Cancel</span>
                </Button>
              </div>
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            {isEditing && (
              <form.AppForm>
                <Field orientation="responsive">
                  <form.Button
                    disabled={editSite.isPending || !formState}
                    type="submit"
                  >
                    {editSite.isPending ? (
                      <>
                        Saving...
                        <Loader className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>Save</>
                    )}
                  </form.Button>
                  <form.Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(baseValues)}
                    disabled={editSite.isPending}
                  >
                    Reset
                  </form.Button>
                </Field>
              </form.AppForm>
            )}
          </form.FieldGroup>
        </form>
      </div>
    </div>
  );
}

export default SiteDetails;
