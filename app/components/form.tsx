import { Label } from "#app/components/ui/label";
import { Input, InputProps } from "#app/components/ui/input";
import { FormMetadata } from "@conform-to/react";

type FieldProps = InputProps & {
  label: string;
  errors?: string[];
  errorId: string;
};

export const ErrorList = ({
  errorId,
  errors,
}: {
  errors: FormMetadata["errors"];
  errorId: FormMetadata["errorId"];
}) => {
  return errors ? (
    <ul>
      {errors.map((error) => {
        return (
          <li className="text-red-500" id={errorId} key={error}>
            {error}
          </li>
        );
      })}
    </ul>
  ) : null;
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
      <ErrorList errors={errors} errorId={errorId} />
    </div>
  );
};
