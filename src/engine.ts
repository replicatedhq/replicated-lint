import * as _ from "lodash";
import { Predicate, Test } from "./lint";
import {
  AdminCommandContainerMissing,
  And,
  AnyOf,
  ConfigOptionExists,
  ConfigOptionIsCircular,
  Eq,
  EventSubscriptionContainerMissing,
  Exists,
  Falsey,
  FalseyIfPresent,
  GT,
  IsEmpty,
  KeyDoesntMatch,
  Match,
  MonitorContainerMissing,
  MoreThan,
  Neq,
  NotMatch,
  Or,
  Semver,
  SemverRange,
  Truthy,
  WhenExpressionConfigInvalid,
  Dot, LTE, LT, GTE, NotBoolString,
} from "./predicates";
import * as util from "util";

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
  AdminCommandContainerMissing,
  And,
  AnyOf,
  ConfigOptionExists,
  ConfigOptionIsCircular,
  Eq,
  Exists,
  Falsey,
  FalseyIfPresent,
  IsEmpty,
  GT,
  GTE,
  LT,
  LTE,
  KeyDoesntMatch,
  Match,
  MonitorContainerMissing,
  Neq,
  Dot,
  NotMatch,
  Or,
  Semver,
  SemverRange,
  Truthy,
  WhenExpressionConfigInvalid,
  EventSubscriptionContainerMissing,
  MoreThan,
  NotBoolString,
};

export class MutableRegistry implements Registry {
  constructor(private readonly types: PredicateRegistry) {
  }

  public compile(obj: Test): Predicate<any> {
    for (const key of Object.keys(obj)) {

      if (obj.hasOwnProperty(key)) {
        if (!_.has(this.types, key)) {
          throw new Error(`Registry does not know about type ${key}, received ${util.inspect(obj)}, known types are: ${_.keys(this.types)}`);
        }

        try {
          return this.types[key].fromJson(obj[key], this);
        } catch (err) {
          throw new Error(`Could not construct type ${key} from object ${util.inspect(obj)}, error was ${util.inspect(err)}`);
        }
      }

    }

    throw new Error(`Registry could not construct predicate from ${util.inspect(obj)}, no known keys`);

  }

  public register(obj: JsonReadable<Predicate<any>>) {
    this.types[obj.name!] = obj;
  }
}

export const defaultRegistry = new MutableRegistry(defaultPredicates);

export function register(engineRule: JsonReadable<Predicate<any>>): void {
  defaultRegistry.register(engineRule);
}
