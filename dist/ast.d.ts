import { YAMLNode } from "yaml-ast-parser";
import { Range } from "./lint";
export declare function findNode(root: YAMLNode, path: string): YAMLNode;
export declare function findNodes(root: YAMLNode, path: string): YAMLNode[];
export declare function nodePosition(node: YAMLNode, path: any, lineColumnFinder: any, offset?: number): Range;
export declare function astPosition(root: YAMLNode, path: string, lineColumnFinder: any, offset?: number): Range[];
