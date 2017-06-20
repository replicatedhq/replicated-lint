import * as _ from "lodash";
import * as semver from "semver";
import { Predicate, RuleMatchedAt } from "./lint";
import {
  FoundValue, TraverseSearcher, ValueSearcher,
  ValueTraverser,
} from "./traverse";
import { ConfigOption, ConfigSection } from "./replicated";
import * as util from "util";

export class And<T> implements Predicate<T> {
  public static fromJson<T>(obj: any, registry: Registry): And<T> {
    return new And<T>(_.map(obj.preds, (pred: any) =>  registry.compile(pred)));
  }

  constructor(private readonly preds: Array<Predicate<T>>) {
  }

  public test(root: T): RuleMatchedAt {
    const paths: string[] = [];

    for (const pred of this.preds) {
      const result = pred.test(root);
      if (!result.matched) {
        return { matched: false };
      }

      _.forEach(result.paths!, p => paths.push(p));
    }

    return { matched: true, paths };
  }

}

export class Match implements Predicate<any> {
  public static fromJson(self: any): Match {
    return new Match(self.path, new RegExp(self.pattern));
  }

  constructor(private readonly path: string,
              private readonly check: RegExp) {
  }

  public test(object: any): RuleMatchedAt {

    const value = _.get(object, this.path);
    const matched = this.check.test(value as any);

    return { matched, paths: [this.path] };
  }
}

export class NotMatch implements Predicate<any> {
  public static fromJson(self: any): NotMatch {
    return new NotMatch(self.path, new RegExp(self.pattern));
  }

  constructor(private readonly path: string,
              private readonly check: RegExp) {
  }

  public test(object: any): RuleMatchedAt {
    const value = _.get(object, this.path);
    const matched = !this.check.test(value as any);

    return { matched, paths: [this.path] };
  }
}

export class Semver implements Predicate<any> {
  public static fromJson(obj: any ): Semver {
    return new Semver(obj.path, obj.required);
  }

  constructor(private readonly path: string,
              private readonly required: boolean,
  ) {}

  public test(root: any): RuleMatchedAt {
    const value = _.get(root, this.path);

    if (!value && this.required) {
      return { matched: true, paths: [] };
    }

    if (value && !semver.valid(value)) {
      return { matched: true, paths: [this.path] };
    }

    return { matched: false };
  }
}

export class AnyOf<T_Root, T_El> implements Predicate<T_Root> {
  public static fromJson<R, E>(obj: any, registry: Registry): AnyOf<R, E> {
    return new AnyOf<R, E>(obj.path, registry.compile(obj.pred));
  }

  constructor(private readonly collectionPath: string,
              private readonly pred: Predicate<T_El>) {
  }

  public test(root: any): RuleMatchedAt {
    const collection: T_El[] = _.get<T_Root, T_El[]>(root, this.collectionPath);
    if (!_.isArray(collection)) {
      return { matched: false };
    }

    const matchedPaths: string[] = _.flatMap(collection, (obj: T_El, index) => {
      const matched: RuleMatchedAt = this.pred.test(obj);
      if (matched.matched) {
        return _.map(matched.paths || [], path => `${this.collectionPath}.${index}.${path}`);
      }
      return [];
    });

    return { matched: !_.isEmpty(matchedPaths), paths: matchedPaths };
  }
}

export class Exists<T> implements Predicate<T> {
  public static fromJson<T>(obj: any): Exists<T> {
    return new Exists(obj.path);
  }

  constructor(private readonly path: string) {
  }

  public test(object: T): RuleMatchedAt {
    return {
      matched: _.has(object, this.path),
      paths: [this.path],
    };
  }
}

export class Eq<T> implements Predicate<T> {
  public static fromJson<T>(obj: any): Eq<T> {
    return new Eq(obj.path, obj.value);
  }

  constructor(private readonly path: string,
              private readonly value: any) {
  }

  public test(object: T): RuleMatchedAt {
    return {
      matched: _.get(object, this.path) === this.value,
      paths: [this.path],
    };
  }
}

export class GT<T> implements Predicate<T> {
  public static fromJson<T>(obj: any): GT<T> {
    if (!_.isNumber(obj.value)) {
      throw new Error(`GT.value must be a number, received ${obj.value}`);
    }
    return new GT(obj.path, obj.value);
  }

  constructor(private readonly path: string,
              private readonly value: number) {
  }

  public test(object: T): RuleMatchedAt {
    return {
      matched: _.get(object, this.path) > this.value,
      paths: [this.path],
    };
  }
}

export class Neq implements Predicate<any> {
  public static fromJson(obj: any): Neq {
    return new Neq(obj.path, obj.value);
  }

  constructor(private readonly path: string,
              private readonly value: any) {
  }

  public test(object: any): RuleMatchedAt {
    return {
      matched: _.get(object, this.path) !== this.value,
      paths: [this.path],
    };
  }
}

export class FalseyIfPresent {
  public static fromJson(obj: any): Predicate<any> {
    return new And([
      new Truthy(obj.path),
      new Falsey([obj.path, obj.field].join(".")),
    ]);
  }
}

export class Truthy implements Predicate<any> {
  public static fromJson(obj: any): Truthy {
    return new Truthy(obj.path);
  }

  constructor(private readonly path: string) {
  }

  public test(object: any): RuleMatchedAt {

    return {
      matched: !!_.get(object, this.path),
      paths: [this.path],
    };
  }
}

export class Falsey implements Predicate<any> {
  public static fromJson(obj: any): Falsey {
    return new Falsey(obj.path);
  }

  constructor(private readonly path: string) {
  }

  public test(object: any): RuleMatchedAt {

    return {
      matched: !_.get(object, this.path),
      paths: [this.path],
    };
  }
}

export class Or<T> implements Predicate<T> {
  public static fromJson<T>(obj: any, registry: Registry): Or<T> {
    return new Or<T>(_.map(obj.preds, (pred: any) =>  registry.compile(pred)));
  }
  constructor(private readonly preds: Array<Predicate<T>>) {
  }

  public test(root: T): RuleMatchedAt {
    for (const pred of this.preds) {
      const result = pred.test(root);
      if (result.matched) {
        return result;
      }
    }
    return { matched: false };
  }
}

export class KeyDoesntMatch implements Predicate<any> {
  public static fromJson(self: any): Predicate<any> {
    return new KeyDoesntMatch(self.pattern);
  }

  constructor(private readonly pattern: RegExp) {
  }

  public test(root: any): RuleMatchedAt {
    const paths: string[] = [];
    _.forIn(root, (_, key: string) => {
      if (!this.pattern.test(key)) {
        paths.push(key);
      }
    });

    if (!_.isEmpty(paths)) {
      return { matched: true, paths };
    }

    return { matched: false };
  }
}

export class ConfigOptionExists implements Predicate<any> {

  public static fromJson(): ConfigOptionExists {
    return new ConfigOptionExists(new TraverseSearcher(new ValueTraverser()));
  }

  constructor(private readonly valueSearcher: ValueSearcher) {
  }

  public test(root: any): RuleMatchedAt {
    const configItemNames = _.flatMap(root.config as ConfigSection[],
      section => this.configItemNames(section),
    );

    const configOptionFinder = (v: any) => /{{repl ConfigOption/.test(v);
    const configOptionUsages: FoundValue[] = this.valueSearcher.searchMatch(root, configOptionFinder);

    // usages that contain NONE OF configItemNames
    // every usage should match exactly one configItem
    const filtered: FoundValue[] = _.filter(configOptionUsages, this.findInvalid(configItemNames));

    return { matched: !!filtered.length, paths: _.map(filtered, f => f.path) };
  }

  private configItemNames(section: ConfigSection) {
    return _.flatMap(section.items, item => {
      const hasChildren = ["select_one", "select_many"].indexOf(item.type) === -1;
      return hasChildren ? [item.name] : _.map(item.items!, i => i.name);
    });
  }

  private findInvalid(configItemNames: string[]) {
    return (configOptionUsage: FoundValue) => {
      let matchesOne = false;
      _.forEach(configItemNames, itemName => {
        if (configOptionUsage.value.indexOf(itemName) !== -1) {
          matchesOne = true;
        }
      });
      return !matchesOne;
    };
  }
}

export class ConfigOptionIsCircular implements Predicate<ConfigOption> {

  public static fromJson(): ConfigOptionIsCircular {
    return new ConfigOptionIsCircular(new TraverseSearcher(new ValueTraverser()));
  }

  constructor(private readonly valueSearcher: ValueSearcher) {
  }

  public test(configOption: ConfigOption): RuleMatchedAt {

    const patternOption: string = `ConfigOption "${configOption.name}"`;
    const patternOptionEquals: string = `ConfigOptionEquals "${configOption.name}"`;

    const configOptionUsages: FoundValue[] = _.concat(
      this.valueSearcher.searchContains(configOption, patternOption),
      this.valueSearcher.searchContains(configOption, patternOptionEquals),
    );

    return {
      matched: !!configOptionUsages.length,
      paths: _.map(configOptionUsages, f => f.path),
    };
  }
}

export interface JsonReadable<T> {
  name?: string; // e.g. obj.constructor.name
  fromJson(self: any, registry: Registry): T;
}

export interface PredicateRegistry {
  [key: string]: JsonReadable<Predicate<any>>;
}

export interface Registry {
  compile(obj: any): Predicate<any>;
}

const defaultPredicates: PredicateRegistry = {
  AnyOf,
  Truthy,
  Exists,
  And,
  Eq,
  KeyDoesntMatch,
  Semver,
  Match,
  NotMatch,
  Neq,
  ConfigOptionExists,
  ConfigOptionIsCircular,
  FalseyIfPresent,
  GT,
  Or,
};

export class MutableRegistry implements Registry {
  constructor(private readonly types: PredicateRegistry) {}

  public compile(obj: any): Predicate<any> {
    if (!_.has(this.types, obj.type)) {
      throw new Error(`Registry does not know about type ${obj.type}, received ${util.inspect(obj)}, known types are: ${_.keys(this.types)}`);
    }

    try {
      return this.types[obj.type].fromJson(obj, this);
    } catch (err) {
      throw new Error(`Could not construct type ${obj.type} from object ${util.inspect(obj)}, error was ${util.inspect(err)}`);
    }
  }

  public register(obj: any) {
    this.types[obj.name] = obj;
  }
}

export const defaultRegistry = new MutableRegistry(defaultPredicates);

export function register(engineRule: JsonReadable<Predicate<any>>): void {
  defaultRegistry.register(engineRule);
}
