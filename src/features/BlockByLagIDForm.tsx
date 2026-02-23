import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import type { ReactElement } from "react";
import z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldContext,
  fieldComponents: {},
  formComponents: {},
  formContext,
});

const BLOCK_VALIDATOR = z.object({
  firstName: z.string().min(1, { error: "First name is mandatory" }),
  lastName: z.string().min(1, { error: "Last name is mandatory" }),
  lagId: z
    .string()
    .regex(/^\d{10}$/, { error: "Not a valid lag Id" })
    .transform((val) => `LAG${val}`),
});

interface BlockByIDFormProps {
  CloseBtn?: (disabled: boolean, onClick: () => void) => ReactElement;
}

//TODO: remove once not useful
const handleProto = (obj: any) => {
  return new Promise((res, _) => {
    setTimeout(() => {
      alert(JSON.stringify(obj));
      res(0);
    }, 1000);
  });
};

const BlockByLagIDForm = ({ CloseBtn }: BlockByIDFormProps) => {
  const mutation = useMutation({
    mutationFn: handleProto,
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
      mutation.mutate({
        firstName: value.firstName,
        lastName: value.lastName,
        lagId: value.lagId,
      });
    },
  });
  return (
    <form
      id="blockByLagForm"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="flex gap-2">
        <FormError error={mutation.error} title="Create Failed" />
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
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const numericVal = event.target.value.replace(/\D/g, "");
                    field.handleChange(numericVal);
                  }}
                  placeholder={label}
                  autoComplete="off"
                  maxLength={10}
                />
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

export default BlockByLagIDForm;
