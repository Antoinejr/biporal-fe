import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Biporal from "@/assets/BIPORAL_2-Medium.png";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputPassword } from "@/components/ui/input-password";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import FormError from "@/components/form-error";
import { Loader } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username must be entered"),
  passcode: z.string().min(1, "Passcode must be entered"),
});

const AuthForm = () => {
  const { signIn } = useAuth();
  const navigator = useNavigate();
  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => navigator("/"),
  });

  const form = useForm({
    defaultValues: {
      username: "",
      passcode: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <Card className="min-w-md sm:max-w-md">
      <CardHeader className="flex flex-col items-center gap-2">
        <img src={Biporal} alt="Biporal logo" width="150px" height="150px" />
      </CardHeader>
      <CardContent>
        <form
          id="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.reset();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-8">
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Username..."
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="passcode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <InputPassword
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Password..."
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field className={cn("flex flex-col")} orientation="vertical">
          <Button type="submit" form="auth-form">
            {mutation.isPending ? (
              <>
                <Loader className="animate-spin" /> Logging In...
              </>
            ) : (
              "Login"
            )}
          </Button>
          <FormError error={mutation.error} title="Failed to login" />
        </Field>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
