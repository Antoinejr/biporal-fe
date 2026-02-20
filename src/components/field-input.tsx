import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

const FieldInput = ({ field, label }: { field: any; label: string }) => {
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={(e) => {
          field.handleChange(e.target.value.trim());
          field.handleBlur();
        }}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={label}
        autoComplete="off"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default FieldInput;
