type InvariantFunction = (
  condition: unknown,
  ...responseParameters: ConstructorParameters<typeof Response>
) => asserts condition;

export const invariantResponse: InvariantFunction = function (
  condition,
  body,
  responseInit
) {
  if (!condition) {
    throw new Response(body, { status: 400, ...responseInit });
  }
};
