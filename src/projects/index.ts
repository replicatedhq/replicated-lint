import * as replicatedEntitlements from "./replicated-entitlements";
import * as replicatedSupportBundle from "./replicated-supportbundle";
import * as replicatedAnalyze from "./replicated-analyze";
import * as replicatedShip from "./replicated-ship";
import * as replicatedRbac from "./replicated-rbac";

export const projects = {
    "replicated-entitlements": replicatedEntitlements,
    "replicated-supportbundle": replicatedSupportBundle,
    "replicated-analyze": replicatedAnalyze,
    "replicated-ship": replicatedShip,
    "replicated-rbac": replicatedRbac,
};
