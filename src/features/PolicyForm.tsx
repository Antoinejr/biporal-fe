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
import { Edit2, Loader, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import FormError from "@/components/form-error";

const { formContext, fieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {},
  fieldContext,
  formComponents: {},
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

function PolicyForm({ policy }: PolicyFormProps) {
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
      role: policy?.role ?? "ARTISAN",
      entryTime: policy?.entryTime ?? "00:00",
      exitTime: policy?.exitTime ?? "23:59",
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
  const isEditing = !!policy;

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant={isEditing ? "ghost" : "outline"}>
          {isEditing ? (
            <Edit2 className="h-4 w-4" />
          ) : (
            <>
              <>
                <Plus className="h-4 w-4" />
                Define Access Hours
              </>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modify Access Rule" : "New Gate Access Rule"}
          </DialogTitle>
          <DialogDescription>
            Set the time window during which this group is allowed to enter the
            estate. Access will be denied outside of these hours.
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
          <FieldGroup className={cn("grid grid-cols-1]")}>
            <FormError error={mutation.error} title="Create/Update Failed" />
            <form.AppField
              name="role"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field className={cn("col-span-full")}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <ChooseMenu
                      options={[
                        {
                          name: "Supervisors",
                          value: "SUPERVISOR" as Category,
                        },
                        { name: "Artisans", value: "ARTISAN" as Category },
                      ]}
                      state={field.state.value}
                      label={field.state.value}
                      disabled={isEditing}
                      handleSelect={(opt) => {
                        field.handleChange(opt.value);
                      }}
                    />
                  </Field>
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
                  <Field className="space-y-2">
                    <FieldLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      Gate Opens At
                    </FieldLabel>
                    <Input
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                  <Field className="space-y-2">
                    <FieldLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      Gate Closes At
                    </FieldLabel>
                    <Input
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.AppForm>
              <Field
                className="flex justify-end gap-3 pt-4"
                orientation="vertical"
              >
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>Save Policy</>
                  )}
                </Button>

                <DialogClose asChild>
                  <Button
                    disabled={mutation.isPending}
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Close
                  </Button>
                </DialogClose>
              </Field>
            </form.AppForm>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PolicyForm;
