/* eslint no-console: 0 */
import cluster from "cluster";
import * as os from "os";

import { ApplicationFactory } from "@/factories/application.factory";

export class ClusterApplication {
  constructor(private readonly applicationFactory: ApplicationFactory) {}

  run() {
    if (cluster.isPrimary) {
      ClusterApplication.master();
    } else {
      this.worker();
    }
  }

  private static master() {
    const cpus = os.availableParallelism();
    const workerNum =
      process.env.NODE_ENV === "development" && cpus > 2 ? 2 : cpus;

    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < workerNum; i++) {
      const fork = cluster.fork();
      fork.send(i);
    }

    cluster.on("online", (worker) => {
      console.log("Worker %o is listening", worker.process.pid);
    });

    cluster.on("exit", (worker, _code, _signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  }

  private worker() {
    const cb = async () => {
      process.off("message", cb);
      console.log("Worker %o started", process.pid);
      await this.applicationFactory();
    };

    process.on("message", cb);
  }
}
