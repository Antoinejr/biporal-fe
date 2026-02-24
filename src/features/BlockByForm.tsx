import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { blockAccess } from "@/services/blocklistService";
import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import {
  QueryClient,
  QueryClientContext,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState, type ReactElement } from "react";
import z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldContext,
  fieldComponents: {},
  formComponents: {},
  formContext,
});

const BLOCK_VALIDATOR = z.object({
  firstName: z.string().trim().min(1, { error: "First name is mandatory" }),
  lastName: z.string().trim().min(1, { error: "Last name is mandatory" }),
  lagId: z
    .string()
    .trim()
    .regex(/^\d{10}$/, { error: "Not a valid lag Id" })
    .transform((val) => `LAG${val}`),
});

interface BlockByIDFormProps {
  CloseBtn?: (disabled: boolean, onClick: () => void) => ReactElement;
}

const BlockByForm = ({ CloseBtn }: BlockByIDFormProps) => {
  const [hasSuccess, setHasSucccess] = useState(false);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: blockAccess,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocklist"] });
      setHasSucccess(true);
      setTimeout(() => setHasSucccess(false), 2500);
      form.reset();
    },
  });

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      lagId: "",
    },
    validators: {
      onSubmit: BLOCK_VALIDATOR,
    },
    onSubmit: ({ value }) => {
      const parse = BLOCK_VALIDATOR.safeParse(value);
      if (parse.error) {
        throw new Error("Form is invalid");
      }
      const { firstName, lastName, lagId } = parse.data;
      mutation.mutate({
        firstName,
        lastName,
        lagId,
      });
    },
  });
  return (
    <form
      id="blockByForm"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="flex gap-2 justify-end">
        <FormError error={mutation.error} title="Block Failed" />
        <FormSuccess
          hasSuccess={hasSuccess}
          title="Block Successful"
          message="Persons  access has success been restricted"
        />
        <form.AppField
          name="firstName"
          children={(field) => {
            const label = "First Name";
            const isInvalid =
              field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={label}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.AppField
          name="lastName"
          children={(field) => {
            const label = "Last Name";
            const isInvalid =
              field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={label}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.AppField
          name="lagId"
          children={(field) => {
            const label = "Lag ID";
            const isInvalid =
              field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    LAG
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    className="rounded-l-none"
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const numericVal = event.target.value.replace(/\D/g, "");
                      field.handleChange(numericVal);
                    }}
                    placeholder={label}
                    autoComplete="off"
                    maxLength={10}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <div className="flex justify-end gap-3 pt-4">
          {CloseBtn &&
            CloseBtn(mutation.isPending, () => {
              form.reset();
            })}
          <Button
            disabled={mutation.isPending}
            aria-disabled={mutation.isPending}
            type="submit"
          >
            {mutation.isPending ? (
              <>
                <Loader className="animate-spin" /> Saving...
              </>
            ) : (
              <>Block</>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default BlockByForm;
