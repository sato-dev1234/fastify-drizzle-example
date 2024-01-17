import App from "./app";
import { setup } from "./app.setup";

import plugins from "@/plugins";
import routes from "@/routes";

export type ApplicationFactory = () => Promise<void>;

export async function applicationFactory() {
  const app = new App();
  await setup(app.fastify, plugins, routes);
  await app.listen();
}
