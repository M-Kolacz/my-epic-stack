import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
  });

  invariantResponse(note, "Note not found", {
    status: 404,
  });

  return json({ note });
};

const NoteIdRoute = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="max-w-3xl">
      <h1 className="text-5xl pb-5">{data.note.title}</h1>

      <p>{data.note.content}</p>
    </div>
  );
};

export default NoteIdRoute;
