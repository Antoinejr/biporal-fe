import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import ChooseMenu from "./ChooseMenu";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/activityLogsTypes";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePolicy } from "@/services/adminService";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Edit2, Loader, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AxiosError } from "axios";

const { formContext, fieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    Field,
    FieldError,
    FieldLabel,
    ChooseMenu,
    Input,
  },
  fieldContext,
  formComponents: {
    FieldGroup,
    Button,
  },
  formContext,
});
type PolicyFormProps = {
  policy?: {
    id: string;
    role: Category;
    entryTime: string;
    exitTime: string;
  };
};

export const CATEGORIES = [
  "RESIDENT",
  "WORKER",
  "DEPENDENT",
  "SUPERVISOR",
  "ARTISAN",
] as const satisfies readonly Category[];

const formSchema = z.object({
  role: z.enum(CATEGORIES, {
    message: "Category is one of options",
  }),
  entryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Start time must be in HH:MM format (24-hour)",
  }),
  exitTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "End time must be in HH:MM format (24-hour)",
  }),
});

function PolicyForm(props: PolicyFormProps) {
  const queryClient = useQueryClient();
  const [show, setShow] = useState<boolean>(false);
  const mutation = useMutation({
    mutationFn: updatePolicy,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["policy"],
      });
      form.reset();
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      role: props.policy?.role ?? "ARTISAN",
      entryTime: props.policy?.entryTime ?? "00:00",
      exitTime: props.policy?.exitTime ?? "23:59",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = formSchema.safeParse(value);
      if (result.error) {
        return;
      }
      mutation.mutate(result.data);
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          {props?.policy?.id ? (
            <Edit2 className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.policy === undefined ? "Add Policy" : "Update Policy"}</DialogTitle>
          <DialogDescription> {
          props.policy === undefined ?
          "Adding a policy on an existing role updates policy for that role"
            : "Update policy"}
          </DialogDescription>
        </DialogHeader>
        <form
          id="policy-form"
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
              name="role"
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
                      options={[
                        { name: "Resident", value: "RESIDENT" as Category },
                        { name: "Worker", value: "WORKER" as Category },
                        { name: "Dependent", value: "DEPENDENT" as Category },
                        { name: "Supervisor", value: "SUPERVISOR" as Category },
                        { name: "Artisan", value: "ARTISAN" as Category },
                      ]}
                      state={field.state.value}
                      label={field.state.value}
                      disabled={!!props.policy}
                      handleSelect={(option) => {
                        field.handleChange(option.value);
                      }}
                    />
                  </field.Field>
                );
              }}
            />
            <form.AppField
              name="entryTime"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Entry Time
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      type="time"
                      step="60"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="HH:MM"
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
              name="exitTime"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Exit Time
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      type="time"
                      step="60"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="HH:MM"
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
              <Field orientation="vertical">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      Save... <Loader className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>Save</>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button disabled={mutation.isPending} type="button" variant="outline" onClick={() => form.reset()}>
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

export default PolicyForm;
