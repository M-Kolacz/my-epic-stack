import closeWithGrace from "close-with-grace";
import { setupServer } from "msw/node";
import { resendHanlders } from "./resend";

export const server = setupServer(...resendHanlders);

server.listen({
  onUnhandledRequest: "warn",
});

console.info("🔶 Mock server installed");

closeWithGrace(() => {
  server.close();
});
