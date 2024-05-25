import { prisma } from '#app/utils/db.server';
import { invariantResponse } from '#app/utils/invariant';
import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
	redirect,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Field } from '#app/components/form';
import { Button } from '#app/components/ui/button';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { EditNoteSchema } from '#app/utils/schema';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { checkCsrf } from '#app/utils/csrf.server';
import { requireUser, requireUserId } from '#app/utils/auth.server';

const intentName = {
	editNote: 'edit-note',
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const user = await requireUser(request);

	const note = await prisma.note.findUnique({
		where: {
			id: params.noteId,
		},
	});

	invariantResponse(
		user.id === note?.ownerId,
		'You are not owner of this note',
		{ status: 403 },
	);

	invariantResponse(note, 'Note not found', {
		status: 404,
	});

	return json({ note });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
	await checkCsrf(request);

	const formData = await request.formData();

	const submission = parseWithZod(formData, { schema: EditNoteSchema });

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		);
	}

	const note = await prisma.note.findUnique({ where: { id: params.noteId } });
	const user = await requireUser(request);

	invariantResponse(
		user.id === note?.ownerId,
		'You are not owner of this note',
		{ status: 403 },
	);

	invariantResponse(note, 'Note not found', { status: 404 });

	const userId = await requireUserId(request);

	invariantResponse(
		note.ownerId === userId,
		'You are not owner of this note',
		{
			status: 403,
		},
	);

	await prisma.note.update({
		data: {
			title: submission.value.title,
			content: submission.value.content,
		},
		where: {
			id: params.noteId,
		},
	});

	return redirect(`/users/${params.username}/notes/${params.noteId}`);
};

const NoteEditRoute = () => {
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		id: intentName.editNote,
		constraint: getZodConstraint(EditNoteSchema),
		lastResult: actionData?.result,
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: EditNoteSchema }),
		shouldValidate: 'onBlur',
	});

	return (
		<Form
			method='POST'
			{...getFormProps(form)}
			className='flex w-1/2 flex-col gap-4'>
			<Field
				{...getInputProps(fields.title, { type: 'text' })}
				errors={fields.title.errors}
				errorId={fields.title.errorId}
				defaultValue={data.note.title}
				label='Title'
			/>
			<Field
				{...getInputProps(fields.content, { type: 'text' })}
				errors={fields.content.errors}
				errorId={fields.content.errorId}
				defaultValue={data.note.content}
				label='Content'
			/>
			<input type='hidden' name='intent' value={intentName.editNote} />
			<Button type='submit'>Edit note</Button>

			<AuthenticityTokenInput />
		</Form>
	);
};
export default NoteEditRoute;
