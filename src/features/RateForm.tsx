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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateRate } from "@/services/adminService";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertCircle, Banknote, Loader} from "lucide-react";
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
const ston = z.string().transform((e) => (e === "" ? 0 : Number(e)));
const formSchema = z.object({
  cost: ston.pipe(
    z.number().min(1, { message: "Minimum price of 1 NGN" }),
  ),
});

function RateForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateRate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["rate"],
      });
      form.reset();
      setShow(false);
    },
  });
  const [show, setShow] = useState<boolean>(false);
  const form = useAppForm({
    defaultValues: {
      cost: "0.00",
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
      await mutation.mutateAsync({cost: result.data.cost * 100});
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Banknote className="h-4 w-4" />
            Update
          </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Update Rate</DialogTitle>
          <DialogDescription>Set the price of tokens</DialogDescription>
        </DialogHeader>
        <form
          id="rate-form"
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
                      : "Failed to update rate. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            <form.AppField
              name="cost"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.FieldLabel htmlFor={field.name}>
                      Rate
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
                        const digits = e.target.value.replace(/\D/g, "");
                        const numericalValue = digits ? parseInt(digits, 10) / 100 : 0;
                        const formatted = numericalValue.toFixed(2);
                        field.handleChange(formatted);
                      }}
                      placeholder="Enter new rate..."
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
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? (
                    <>
                      Saving...
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
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

export default RateForm;
