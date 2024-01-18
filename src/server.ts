import { ClusterApplication } from "./cluster";
import { applicationFactory } from "./factories/application.factory";

const clusterApp = new ClusterApplication(applicationFactory);

clusterApp.run();
