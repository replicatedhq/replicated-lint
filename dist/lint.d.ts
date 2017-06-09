export declare type RuleType = "error" | "warn" | "optimization";
export interface LintedDoc {
    index: number;
    findings: RuleTrigger[];
}
export interface RuleTrigger {
    type: RuleType;
    rule: string;
    received: any;
    message: string;
    positions?: Range[];
    err?: Error;
}
export interface YAMLRule {
    test: Predicate<any>;
    type: RuleType;
    name: string;
    message: string;
}
export interface RuleMatched {
    matched: boolean;
    paths?: string[];
}
export interface Predicate<T> {
    test(root: T): RuleMatched;
}
export declare class Neq implements Predicate<any> {
    private readonly path;
    private readonly value;
    constructor(path: string, value: string);
    test(object: any): RuleMatched;
}
export declare class Exists implements Predicate<any> {
    private readonly path;
    constructor(path: string);
    test(object: any): RuleMatched;
}
export interface Range {
    start: Position;
    path?: string;
    end?: Position;
}
export interface Position {
    position: number;
    line?: number;
    column?: number;
}
export declare function lintMultidoc(inYaml: string, rules?: YAMLRule[]): LintedDoc[];
export declare function lint(inYaml: string, rules?: YAMLRule[], lineColumnFinder?: any, positionOffset?: number): RuleTrigger[];
