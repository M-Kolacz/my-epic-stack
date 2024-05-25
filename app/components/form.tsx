import { Label } from '#app/components/ui/label';
import { Input, InputProps } from '#app/components/ui/input';
import { Checkbox } from '#app/components/ui/checkbox';
import { FormMetadata, getInputProps } from '@conform-to/react';

export const ErrorList = ({
	errorId,
	errors,
}: {
	errors: FormMetadata['errors'];
	errorId: FormMetadata['errorId'];
}) => {
	return errors ? (
		<ul id={errorId}>
			{errors.map((error) => {
				return (
					<li className='text-red-500' key={error}>
						{error}
					</li>
				);
			})}
		</ul>
	) : null;
};

type FieldProps = InputProps & {
	label: string;
	errors?: string[];
	errorId: string;
};

export const Field = ({
	label,
	errors,
	errorId,
	...inputProps
}: FieldProps) => {
	return (
		<div>
			<Label htmlFor={inputProps.id}>{label}</Label>
			<Input {...inputProps} />
			<ErrorList errors={errors} errorId={errorId} />
		</div>
	);
};

type CheckboxProps = ReturnType<typeof getInputProps>;

export const CheckboxField = ({ type, ...checkboxProps }: CheckboxProps) => {
	return (
		<div className='flex flex-row items-center gap-2'>
			<Checkbox {...checkboxProps} />
			<label htmlFor={checkboxProps.id}>Remember me</label>
		</div>
	);
};
