
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Person } from "@/lib/personTypes";
import { cn } from "@/lib/utils";
import { extendToken } from "@/services/personService";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertCircle, Loader, RulerDimensionLine } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    Field,
    FieldLabel,
    Input,
    FieldError,
    FieldGroup,
  },
  formComponents: {
    Button,
    FieldGroup,
  },
  fieldContext,
  formContext,
});

const formSchema = z.object({
  expirationDate: z.string().min(1, { message: "Please select an expiration date" }),
});

function PersonExtendDurationForm({ person }: { person: Person }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: extendToken,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["persons"],
      });
      form.reset();
      setShow(false);
    },
  });
  const [show, setShow] = useState(false);
  
  const minDate = new Date(person.expirationDate).toISOString().split("T")[0];
  
  const form = useAppForm({
    defaultValues: {
      expirationDate: minDate,
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
      
      const selectedDate = new Date(result.data.expirationDate);
      const expirationDate = new Date(person.expirationDate);
      
      selectedDate.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0);
      
      const diffTime = selectedDate.getTime() - expirationDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      await mutation.mutateAsync({
        id: person.id,
        payload: { length: diffDays },
      });
    },
  });

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <DropdownMenuItem 
          disabled={!!person.deletedAt}
          onSelect={(e) => {
            e.preventDefault();
            setShow(true);
          }}
        >
          <RulerDimensionLine className="mr-2 h-4 w-4" />
          Extend
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Extend Token</DialogTitle>
          <DialogDescription>
            Extension is calculated from the current expiration date
          </DialogDescription>
        </DialogHeader>
        <form
          id="extension-form"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup className={cn("flex")}>
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {mutation.error instanceof AxiosError
                    ? `${mutation.error.message}\n${
                        mutation.error.response
                          ? mutation.error.response.data.message
                          : ""
                      }`
                    : mutation.error instanceof Error
                      ? mutation.error.message
                      : "Failed to extend token. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            <form.AppField
              name="expirationDate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      New Expiration Date
                    </field.FieldLabel>
                    <field.Input
                      id={field.name}
                      type="date"
                      name={field.name}
                      min={minDate}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
              <Field orientation="responsive">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      Submitting...
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
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

export default PersonExtendDurationForm;
