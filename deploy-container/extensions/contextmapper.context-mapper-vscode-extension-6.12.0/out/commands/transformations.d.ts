/**
 * CML OOAD transformation & refactoring commands
 */
import { CommandType } from "./command";
export declare function deriveSubdomainFromUserRequirements(): CommandType;
export declare function deriveBoundedContextFromSubdomains(): CommandType;
export declare function deriveFrontendAndBackendSystemFromFeatureBC(): CommandType;
export declare function splitSystemContextIntoSubsystems(): CommandType;
export declare function extractAggregatesByVolatility(): CommandType;
export declare function extractAggregatesByCohesion(): CommandType;
export declare function mergeAggregates(): CommandType;
export declare function mergeBoundedContexts(): CommandType;
export declare function suspendPartnership(): CommandType;
export declare function executeGenericCommandWithSingleStringArg(command: string): CommandType;
