import { Field, FieldError, FieldLabel } from "./ui/field";
import { Textarea } from "./ui/textarea";

function FieldTextarea({ field }: { field: any }) {
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        rows={20}
        cols={80}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e: any) => field.handleChange(e.target.value)}
        autoComplete="off"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export default FieldTextarea;
