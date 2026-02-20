import FormError from "@/components/form-error";
import NairaIcon from "@/components/naira-icon";
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
import { Banknote, Loader } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});
const ston = z.string().transform((e) => (e === "" ? 0 : Number(e)));
const formSchema = z.object({
  cost: ston.pipe(z.number().min(0, { message: "Minimum price of 0 NGN" })),
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
      mutation.mutate({ cost: result.data.cost * 100 });
    },
  });

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Banknote className="h-4 w-4" />
          Update Pricing
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Update Ticket Price</DialogTitle>
          <DialogDescription>
            Change the base price for all new tickets. This won't affect tickets
            already sold.
          </DialogDescription>
        </DialogHeader>
        <form
          id="rate-form"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className={cn("flex")}>
            <FormError error={mutation.error} title="Update Failed" />
            <form.AppField
              name="cost"
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
                      New Ticket Price (NGN)
                    </FieldLabel>
                    <div
                      tabIndex={-1}
                      className="flex p-2 gap-2 border border-2
                      rounded-md items-center
                      transition-all duration-200 ease-in-out
                      has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring
                      has-[:focus-visible]:ring-offset"
                    >
                      <NairaIcon className="h-4 w-4 opacity-50" />
                      <Input
                        className="shadow-none font-mono border-none 
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        focus-visible:border-none
                        "
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={(e) => {
                          field.handleChange(e.target.value.trim());
                          field.handleBlur();
                        }}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          const numericalValue = digits
                            ? parseInt(digits, 10) / 100
                            : 0;
                          const formatted = numericalValue.toFixed(2);
                          field.handleChange(formatted);
                        }}
                        placeholder="Enter new price..."
                        autoComplete="off"
                      />
                    </div>
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
                orientation="responsive"
              >
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

                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? (
                    <>
                      <Loader className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Price</>
                  )}
                </Button>
              </Field>
            </form.AppForm>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RateForm;
