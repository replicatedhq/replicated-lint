import * as _ from "lodash";
import { Predicate, Test } from "./lint";
import {
  AdminCommandContainerMissing,
  AllOf,
  And,
  AnyOf,
  ArrayMemberFieldsNotUnique,
  ConfigOptionExists,
  ConfigOptionIsCircular,
  ContainerNamesNotUnique,
  ContainerVolumesFromMissing,
  ContainerVolumesFromSubscription,
  CustomRequirementsNotUnique,
  Dot,
  Eq,
  EventSubscriptionContainerMissing,
  Exists,
  Falsey,
  FalseyIfPresent,
  GT,
  GTE,
  InvalidURL,
  IsEmpty,
  IsNotBytesCount,
  IsNotRAMCount,
  IsNotKubernetesQuantity,
  IsNotUint,
  IsNotScheduler,
  KeyDoesntMatch,
  LT,
  LTE,
  Match,
  MonitorContainerMissing,
  MoreThan,
  Neq,
  Not,
  NotBoolString,
  NotUintString,
  NotMatch,
  Or,
  Semver,
  SemverMinimum,
  SemverRange,
  Truthy,
  WhenExpressionConfigInvalid,
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
  AllOf,
  And,
  AnyOf,
  ConfigOptionExists,
  ConfigOptionIsCircular,
  Eq,
  Exists,
  Falsey,
  FalseyIfPresent,
  IsEmpty,
  IsNotBytesCount,
  IsNotRAMCount,
  IsNotKubernetesQuantity,
  IsNotUint,
  IsNotScheduler,
  GT,
  GTE,
  LT,
  LTE,
  KeyDoesntMatch,
  Match,
  MonitorContainerMissing,
  Neq,
  Dot,
  Not,
  NotMatch,
  Or,
  Semver,
  SemverMinimum,
  SemverRange,
  Truthy,
  WhenExpressionConfigInvalid,
  EventSubscriptionContainerMissing,
  MoreThan,
  NotBoolString,
  NotUintString,
  InvalidURL,
  ContainerVolumesFromMissing,
  ContainerNamesNotUnique,
  CustomRequirementsNotUnique,
  ContainerVolumesFromSubscription,
  ArrayMemberFieldsNotUnique,
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
