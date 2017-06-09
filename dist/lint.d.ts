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
export declare class RulerPredicate implements Predicate<any> {
    private readonly matcher;
    constructor(matcher: Matcher);
    test(object: any): RuleMatched;
}
export interface Matcher {
    comparator: string;
    path: string;
    value?: any;
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
