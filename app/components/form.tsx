import { Label } from "#app/components/ui/label";
import { Input, InputProps } from "#app/components/ui/input";

type FieldProps = InputProps & {
  label: string;
  errors?: string[];
  errorId: string;
};

const ErrorList = ({
  errorId,
  errors,
}: {
  errors: string[];
  errorId: string;
}) => {
  return (
    <ul>
      {errors.map((error) => {
        return (
          <li className="text-red-500" id={errorId} key={error}>
            {error}
          </li>
        );
      })}
    </ul>
  );
};

export const Field = ({
  label,
  errors,
  errorId,
  ...inputProps
}: FieldProps) => {
  return (
    <div>
      <Label>{label}</Label>
      <Input {...inputProps} />
      {errors ? <ErrorList errors={errors} errorId={errorId} /> : null}
    </div>
  );
};
