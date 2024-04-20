export const getPath = (request: Request) => new URL(request.url).pathname;
