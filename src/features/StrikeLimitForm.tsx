import FormError from "@/components/form-error";
import FormStepper from "@/components/stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils";
import { updateWarning } from "@/services/blocklistService";
import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Minus, Plus } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});

const STRIKE_LIMIT_SCHEMA = z.object({
  limit: z.int().min(1, "Limit must be at least 1"),
});

function StrikeLimitForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateWarning,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["strikeLimit"],
      });
      form.reset();
      setShow(false);
    },
  });
  const [show, setShow] = useState<boolean>(false);
  const form = useAppForm({
    defaultValues: {
      limit: 1,
    },
    validators: {
      onSubmit: STRIKE_LIMIT_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      const result = STRIKE_LIMIT_SCHEMA.safeParse(value);
      if (!result.success) {
        console.error("Form validation failed", result.error);
        return;
      }
      mutation.mutate({ limit: value.limit });
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Set Strike Limit
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Update Strike Limit</DialogTitle>
          <DialogDescription>
            Change the threshold of strikes before automatic suspension
          </DialogDescription>
        </DialogHeader>
        <form
          id="stikeForm"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FormError error={mutation.error} title="Update Failed" />
            <form.AppField
              name="limit"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field className="space-y-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-md font-semibold"
                    >
                      New Strike Limit
                    </FieldLabel>
                    <FormStepper field={field} />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Maximum allowed late exits before automatic gate lockout.
                    </p>
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
                    Cancel
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
export default StrikeLimitForm;
