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
import { cn, formatCurrency} from "@/lib/utils";
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
import { AxiosError } from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Loader,
  ArrowLeft,
  Trash2,
  RotateCcw,
  Edit,
  X,
} from "lucide-react";
import * as z from "zod";
import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { type ColumnConfig, GenericList } from "@/components/item-list";

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

type Site = {
  id: string;
  name: string;
  balance: number;
  disengagedAt: Date | null;
};
type Supervisor = {
  id: string;
  firstName: string;
  lastName: string;
  lagId: string | null;
  siteName: string;
  disengagedAt: Date | null;
};

// for sites
const sitecolumns: ColumnConfig<Site>[] = [
  { key: "name", header: "name", render: (s) => s.name.toUpperCase() },
  {
    key: "balance",
    header: "balance",
    render: (s) => `${formatCurrency(s.balance)}`,
  },
  {
    key: "disengagedAt",
    header: "status",
    render: (s) => (
      <div className="flex justify-center items-center gap-2">
        <span
          className={cn(
            "px-2 py-1 rounded text-sm",
            s.disengagedAt
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700",
          )}
        >
          {s.disengagedAt ? "Inactive" : "Active"}
        </span>
        <span>
          {s.disengagedAt ? new Date(s.disengagedAt).toDateString() : "----"}
        </span>{" "}
      </div>
    ),
  },
];

// for supervisors
const supervisorcolumns: ColumnConfig<Supervisor>[] = [
  {
    key: "name",
    header: "name",
    render: (s) => `${s.firstName} ${s.lastName}`,
  },

  { key: "siteName", header: "Site", render: (s) => s.siteName.toUpperCase() },
  { key: "lagId", header: "lag id", render: (s) => s.lagId ?? "----" },

  {
    key: "disengagedAt",
    header: "status",

    render: (s) => (
      <div className="flex justify-center items-center gap-2">
        <span
          className={cn(
            "px-2 py-1 rounded text-sm",
            s.disengagedAt
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700",
          )}
        >
          {s.disengagedAt ? "Inactive" : "Active"}
        </span>
        <span>
          {s.disengagedAt ? new Date(s.disengagedAt).toDateString() : ""}
        </span>{" "}
      </div>
    ),
  },
];

function ContractorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 4000);
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
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load contractor details. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("grid grid-cols-3", "gap-2")}>
      <div>
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
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
        <form
          id="contractor-update-form"
          onSubmit={(event) => {
            event.preventDefault();
            editContractor.reset();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup className={cn("grid grid-cols-1 gap-2")}>
            {showSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Contractor updated successfully.
                </AlertDescription>
              </Alert>
            )}

            {editContractor.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {editContractor.error instanceof AxiosError
                    ? `${editContractor.error.message}\n${editContractor.error.response ? editContractor.error.response.data.message.join(" ") : ""}`
                    : editContractor.error instanceof Error
                      ? editContractor.error.message
                      : "Failed to update contractor. Please try again."}
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
                      disabled={!isEditing}
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
          </form.FieldGroup>
        </form>
        {isEditing && (
          <div className="mt-4 flex gap-2">
            <Button
              disabled={!formState || editContractor.isPending}
              type="submit"
              form="contractor-update-form"
            >
              {editContractor.isPending ? (
                <>
                  Saving...
                  <Loader className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Save</>
              )}
            </Button>
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
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-4 text-lg font-medium">Sites</h3>
        <GenericList items={data?.data.sites ?? []} columns={sitecolumns} />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-medium">Supervisors</h3>
        <GenericList
          items={data?.data.supervisors ?? []}
          columns={supervisorcolumns}
        />
      </div>

      {/* Danger Zone */}
      <div className="col-span-3 mt-8 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <h3 className="mb-2 text-lg font-medium text-destructive">
          Danger Zone
        </h3>

        {data?.data.contractor.deletedAt === null ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Deleting a contractor will remove all their site engagements and
              assignments.{" "}
              <span className="font-medium">
                You can restore the contractor later if needed.
              </span>
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={removeContractor.isPending}
                >
                  {removeContractor.isPending ? (
                    <>
                      Deleting...
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Contractor
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all site engagements and assignments for "
                    {data?.data.contractor.name}". You can restore the
                    contractor later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => removeContractor.mutate(id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {removeContractor.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to delete contractor. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </>
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
            {reactivateContractor.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to restore contractor. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default ContractorDetails;
