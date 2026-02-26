import DisplayError from "@/components/error";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import DisplayLoading from "@/components/loading";
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
import { AlertCircle, ArrowLeft, Loader, Edit, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {},
  fieldContext,
  formComponents: {},
  formContext,
});

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  address: z.string().trim().min(1, { message: "Address is required" }),
  owner: z.string().trim().min(1, { message: "Owner is required" }),
  contact: z
    .string()
    .trim()
    .min(1, "Phone must be entered")
    .regex(/^(070|080|090|081|091)\d{8}$/, {
      message: "Invalid phone number",
    }),
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
        <AlertDescription>Site ID is missing.</AlertDescription>
      </Alert>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["site-details", id],
    queryFn: () => findSite(id),
  });

  const editSite = useMutation({
    mutationFn: updateSite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-details", id] });
      scrollTo({ top: 0, behavior: "smooth" });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
    const {
      id,
      balance,
      createdAt,
      updatedAt,
      deletedAt,
      contractors,
      ...rest
    } = original;
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
      const v = formSchema.partial().parse(payload);
      editSite.mutate({ id, payload: v });
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
    return <DisplayError description="Failed to load site details" />;
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
      <div className={cn("grid gap-4 container mx-auto max-w-2xl")}>
        <section className="flex-1 flex flex-col gap-4 p-6 border rounded-lg bg-muted/50 min-w-2xl w-full max-w-2xl">
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
        </section>

        <section className="w-full flex justify-end">
          {!isEditing ? (
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  scrollTo({
                    top: window.innerHeight,
                    behavior: "smooth",
                  });
                  setIsEditing(true);
                }}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  form.reset(baseValues);
                  editSite.reset();
                }}
              >
                <X className="mh-4 w-4 text-red-500" />
                <span className="text-red-500">Cancel</span>
              </Button>
            </div>
          )}
        </section>
        <form
          id="site-update-form"
          onSubmit={(event) => {
            event.preventDefault();
            editSite.reset();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FormSuccess
              hasSuccess={showSuccess}
              title=" Update Successful"
              message="Site Updated Successfully"
            />
            <FormError error={editSite.error} title="Failed to Update" />
            <form.AppField
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Address..."
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
              name="owner"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Owner..."
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
              name="contact"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
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
            <div
              className={cn(
                "grid",
                isEditing
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <Field className="flex justify-end" orientation="responsive">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset(baseValues)}
                  disabled={editSite.isPending}
                >
                  Reset
                </Button>
                <Button
                  disabled={editSite.isPending || !formState}
                  type="submit"
                >
                  {editSite.isPending ? (
                    <>
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save</>
                  )}
                </Button>
              </Field>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

export default SiteDetails;
