import { Button } from "#app/components/ui/button";
import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { DeleteNoteSchema } from "#app/utils/schema";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ErrorList } from "#app/components/form";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { checkCsrf } from "#app/utils/csrf.server";
import { redirectWithToast } from "#app/utils/toast.server";
import { useOptionalUser } from "#app/utils/user";
import { requireUserId } from "#app/utils/auth.server";
import { Link } from "#app/components/link";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
  });

  invariantResponse(note, "Note not found", {
    status: 404,
  });

  return json({ note });
};

const intentName = {
  deleteNote: "delete-note",
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await checkCsrf(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: DeleteNoteSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { noteId } = submission.value;

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true, ownerId: true },
  });

  invariantResponse(note, "Note not found", { status: 404 });

  const userId = await requireUserId(request);

  invariantResponse(
    userId === note.ownerId,
    "You are not the owner of this note",
    { status: 403 }
  );

  await prisma.note.delete({ where: { id: noteId } });

  return redirectWithToast(`/users/${params.username}/notes`, {
    title: "Note deleted",
    description: "Your note has been deleted",
    id: noteId,
    type: "info",
  });
};

const NoteIdRoute = () => {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  const isNoteOwner = user?.id === data.note.ownerId;

  return (
    <div className="max-w-3xl">
      <h1 className="text-5xl pb-5">{data.note.title}</h1>

      <p>{data.note.content}</p>

      <div
        data-hidden={!isNoteOwner}
        className="flex justify-end gap-4 mt-4 data-[hidden=true]:hidden"
      >
        <DeleteNoteForm />
        <Link to="edit">Edit</Link>
      </div>
    </div>
  );
};

const DeleteNoteForm = () => {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: intentName.deleteNote,
    constraint: getZodConstraint(DeleteNoteSchema),
    lastResult: actionData?.result,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: DeleteNoteSchema }),
    shouldValidate: "onBlur",
  });

  return (
    <Form method="POST" {...getFormProps(form)}>
      <input
        {...getInputProps(fields.noteId, { type: "hidden" })}
        value={data.note.id}
      />

      <Button
        type="submit"
        variant={"destructive"}
        name={fields.intent.name}
        value={intentName.deleteNote}
      >
        Delete
      </Button>

      <ErrorList errors={form.errors} errorId={form.errorId} />

      <AuthenticityTokenInput />
    </Form>
  );
};

export default NoteIdRoute;
