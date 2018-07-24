import * as _ from "lodash";
import * as semver from "semver";
import * as urlParse from "url-parse";
import { Predicate, RuleMatchedAt } from "./lint";
import { FoundValue, TraverseSearcher, ValueSearcher, ValueTraverser } from "./traverse";
import { Component, ConfigChildItem, ConfigOption, ConfigSection, Container } from "./replicated";
import { Registry } from "./engine";

export class And<T> implements Predicate<T> {
  public static fromJson<T>(obj: any, registry: Registry): And<T> {
    return new And<T>(_.map(obj.preds, (pred: any) => registry.compile(pred)));
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

  constructor(
      private readonly path: string,
      private readonly check: RegExp,
  ) {
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

  constructor(
      private readonly path: string,
      private readonly check: RegExp,
  ) {
  }

  public test(object: any): RuleMatchedAt {
    const value = this.path ? _.get(object, this.path) : object;

    const matched = !this.check.test(value as any);

    return { matched, paths: [this.path] };
  }
}

export class WhenExpressionConfigInvalid implements Predicate<any> {
  public static fromJson(): WhenExpressionConfigInvalid {
    return new WhenExpressionConfigInvalid(ConfigOptionExists.withDefaults());
  }

  constructor(
      private readonly configOptionExists: ConfigOptionExists,
  ) {
  }

  public test(root: any): RuleMatchedAt {
    if (!_.has(root, "config")) {
      return { matched: false };
    }

    const configOptionsReferenced = [] as FoundValue[];

    _.forEach(root.config, (group: ConfigSection, groupIndex) => {
      const configOptionReferencedByGroup = this.maybeGetReferencedConfigOption(group);
      if (configOptionReferencedByGroup) {
        configOptionsReferenced.push({
          value: configOptionReferencedByGroup!,
          path: `config.${groupIndex}.when`,
        });
      }

      if (!_.has(group, "items")) {
        return;
      }

      _.forEach(group.items, (item, itemIndex) => {
        const configOptionReferencedByOption = this.maybeGetReferencedConfigOption(item);
        if (configOptionReferencedByOption) {
          configOptionsReferenced.push({
            value: configOptionReferencedByOption!,
            path: `config.${groupIndex}.items.${itemIndex}.when`,
          });
        }
      });
    });
    return this.configOptionExists.compareUsageWithDefinedOptions(root, configOptionsReferenced);
  }

  private maybeGetReferencedConfigOption(itemOrGroup: any): string | undefined {
    if (!itemOrGroup) {
      return;
    }

    const when = itemOrGroup.when;

    if (!when) {
      return;
    }

    if (when === "true" || when === "false" || when === true || when === false) {
      return;
    }

    if (/^{{repl/g.test(when)) {
      return;
    }

    const isNeq = when.indexOf("!=") !== -1;
    const splitchar = isNeq ? "!=" : "=";
    return _.split(when, splitchar)[0];
  }

}

export class Semver implements Predicate<any> {
  public static fromJson(obj: any): Semver {
    return new Semver(obj.path, obj.required);
  }

  constructor(
      private readonly path: string,
      private readonly required: boolean,
  ) {
  }

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

  constructor(
      private readonly collectionPath: string,
      private readonly pred: Predicate<T_El>,
  ) {
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

export class AllOf<T_Root, T_El> implements Predicate<T_Root> {
  public static fromJson<R, E>(obj: any, registry: Registry): AllOf<R, E> {
    return new AllOf<R, E>(obj.path, registry.compile(obj.pred));
  }

  constructor(
    private readonly collectionPath: string,
    private readonly pred: Predicate<T_El>,
  ) {
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

    return { matched: matchedPaths.length === collection.length, paths: matchedPaths };
  }
}

// Traverse the tree to `path`, then apply the predicate
export class Dot implements Predicate<any> {
  public static fromJson(obj: any, registry: Registry): Dot {
    return new Dot(obj.path, registry.compile(obj.pred));
  }

  constructor(
      private readonly path: string,
      private readonly pred: Predicate<any>,
  ) {
  }

  public test(root: any): RuleMatchedAt {
    const val = _.get(root, this.path);

    const result: RuleMatchedAt = this.pred.test(val);
    if (!result.matched) {
      return { matched: false };
    }

    return {
      matched: true,
      paths: _.map(result.paths || [], p => `${this.path}.${p}`),
    };
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

  constructor(
      private readonly path: string,
      private readonly value: any,
  ) {
  }

  public test(object: T): RuleMatchedAt {
    return {
      matched: _.get(object, this.path) === this.value,
      paths: [this.path],
    };
  }
}

export class GT implements Predicate<any> {
  public static fromJson(obj: any): GT {
    if (!_.isNumber(obj.value)) {
      throw new Error(`GT.value must be a number, received ${obj.value}`);
    }
    return new GT(obj.path, obj.value);
  }

  constructor(
      private readonly path: string,
      private readonly value: number,
  ) {
  }

  public test(object: any): RuleMatchedAt {
    const val = _.get(object, this.path);
    if (!_.isNumber(val)) {
      return { matched: true, paths: [this.path] };
    }
    return {
      matched: val > this.value,
      paths: [this.path],
    };
  }
}

export class LT implements Predicate<any> {
  public static fromJson(obj: any): LT {
    if (!_.isNumber(obj.value)) {
      throw new Error(`LT.value must be a number, received ${obj.value}`);
    }
    return new LT(obj.path, obj.value);
  }

  constructor(
      private readonly path: string,
      private readonly value: number,
  ) {
  }

  public test(object: any): RuleMatchedAt {

    const val = _.get(object, this.path);

    if (!_.isNumber(val)) {
      return { matched: true, paths: [this.path] };
    }

    return {
      matched: val < this.value,
      paths: [this.path],
    };
  }
}

export class GTE {
  public static fromJson(obj: any): Predicate<any> {
    return new Or([
      new GT(obj.path, obj.value),
      new Eq(obj.path, obj.value),
    ]);
  }
}

export class LTE {
  public static fromJson(obj: any): Predicate<any> {
    return new Or([
      new LT(obj.path, obj.value),
      new Eq(obj.path, obj.value),
    ]);
  }
}

export class Neq implements Predicate<any> {
  public static fromJson(obj: any): Neq {
    return new Neq(obj.path, obj.value);
  }

  constructor(
      private readonly path: string,
      private readonly value: any,
  ) {
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

export class IsEmpty implements Predicate<any> {
  public static fromJson(obj: any): IsEmpty {
    return new IsEmpty(obj.path);
  }

  constructor(private readonly path: string) {
  }

  public test(object: any): RuleMatchedAt {

    return {
      matched: _.isEmpty(_.get(object, this.path)),
      paths: [this.path],
    };
  }
}

export class Or<T> implements Predicate<T> {
  public static fromJson<T>(obj: any, registry: Registry): Or<T> {
    return new Or<T>(_.map(obj.preds, (pred: any) => registry.compile(pred)));
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
    _.forIn(root, (__, key: string) => {
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
    return ConfigOptionExists.withDefaults();
  }

  public static withDefaults(): ConfigOptionExists {
    return new ConfigOptionExists(new TraverseSearcher(new ValueTraverser()));
  }

  constructor(private readonly valueSearcher: ValueSearcher) {
  }

  public test(root: any): RuleMatchedAt {

    const configOptionFinder = (v: any) => /{{repl ConfigOption/.test(v);
    const configOptionUsages: FoundValue[] = this.valueSearcher.searchMatch(root, configOptionFinder);

    return this.compareUsageWithDefinedOptions(root, configOptionUsages);

  }

  public compareUsageWithDefinedOptions(root: any, usages: FoundValue[]): RuleMatchedAt {
    const configItemNames = _.flatMap(
        root.config as ConfigSection[],
        section => this.configItemNames(section),
    );
    // usages that contain NONE OF configItemNames
    // every usage should match exactly one configItem
    const filtered: FoundValue[] = _.filter(usages, this.isInvalid(configItemNames));

    return { matched: !!filtered.length, paths: _.map(filtered, f => f.path) };
  }

  private configItemNames(section: ConfigSection) {
    return _.flatMap(section.items, (item: ConfigOption) => {
      const hasChildren = ["select_one", "select_many"].indexOf(item.type) !== -1;
      return hasChildren ? [item.name, ..._.map(item.items!, (i: ConfigChildItem) => i.name)] : [item.name];
    });
  }

  // returns a function value => bool that returns true if
  // the value is found in the list of configItemNames
  private isInvalid(configItemNames: string[]): (FoundValue) => boolean {
    return (configOptionUsage: FoundValue) => {
      let matchesOne = false;
      _.forEach(configItemNames, itemName => {
        if (configOptionUsage.value === itemName) {
          matchesOne = true;
        }

        const isTmpl = /{{repl/g.test(configOptionUsage.value);
        if (configOptionUsage.value.indexOf(itemName) !== -1 && isTmpl) {
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

interface InvalidMontior {
  index: number;
  path: string;
}

export class MonitorContainerMissing implements Predicate<any> {
  public static fromJson(self: any): MonitorContainerMissing {
    return new MonitorContainerMissing(self.monitorPath);
  }

  constructor(private readonly monitorPath: string) {
  }

  public test(root: any): RuleMatchedAt {
    if (!_.has(root, this.monitorPath)) {
      return { matched: false };
    }

    const monitors: string[] = _.get(root, this.monitorPath) as string[];

    if (_.isEmpty(monitors)) {
      return { matched: false };
    }

    if (_.isEmpty(_.get(root, "components"))) {
      return { matched: true, paths: [this.monitorPath] };
    }

    const violations: InvalidMontior[] = _.filter(_.map(monitors, (monitor, index) => {
      return this.checkMonitor(root.components, monitor, index);
    })) as any;

    if (_.isEmpty(violations)) {
      return { matched: false };
    }

    return {
      matched: true,
      paths: [
        ..._.map(violations, v => `${this.monitorPath}.${v.index}`),
        ..._.map(violations, v => v.path),
      ],
    };
  }

  private checkMonitor(components: any[], monitor: string, index: number): InvalidMontior | undefined {
    const [component, container] = monitor.split(",");
    const result = isContainerMissing(components, component, container);
    if (result.matched && result.paths && result.paths[0]) {
      return { index, path: result.paths[0] };
    }
  }
}

export class SemverRange implements Predicate<any> {
  public static fromJson(obj: any): SemverRange {
    return new SemverRange(obj.path, obj.required);
  }

  constructor(
      private readonly path: string,
      private readonly required: boolean,
  ) {
  }

  public test(root: any): RuleMatchedAt {
    const value = _.get(root, this.path);

    if (!value && this.required) {
      return { matched: true, paths: [] };
    }

    if (value && !semver.validRange(value)) {
      return { matched: true, paths: [this.path] };
    }

    return { matched: false };
  }
}

export class AdminCommandContainerMissing implements Predicate<any> {
  public static fromJson(): AdminCommandContainerMissing {
    return new AdminCommandContainerMissing();
  }

  public test(root: any): RuleMatchedAt {

    const commands: any[] = root.admin_commands;

    if (_.isEmpty(commands)) {
      return { matched: false };
    }

    if (isKubernetesApp(commands)) { // it's probably kubernetes, we're not gonna check
      return { matched: false };
    }

    if (isSwarmApp(commands)) { // it's probably swarm, we're not gonna check
      return { matched: false };
    }

    if (_.isEmpty(_.get(root, "components"))) {
      return { matched: true, paths: ["admin_commands"] };
    }

    const paths = [] as string[];

    _.forEach(commands, (command, index) => {
      if ((!_.isEmpty(command.kubernetes) || !_.isEmpty(command.swarm)) && _.isEmpty(command.replicated)) {
        return;
      }

      let { component, container } = command;

      // for oldstyle
      if (!_.isEmpty(command.image)) {
        component = command.component;
        container = command.image.image_name;
      }

      // for newstyle_multi
      if (!_.isEmpty(command.replicated)) {
        component = command.replicated.component;
        container = command.replicated.container;
      }

      // for newstyle_multi_long
      if (!_.isEmpty(command.source) && !_.isEmpty(command.source.replicated)) {
        component = command.source.replicated.component;
        container = command.source.replicated.container;
      }

      const matched = isContainerMissing(root.components, component, container);

      if (matched.matched) {
        paths.push(`admin_commands.${index}`);
      }

      if (matched.paths) {
        _.forEach(matched.paths, p => paths.push(p));
      }
    });

    return { matched: !_.isEmpty(paths), paths };
  }

}

function isKubernetesApp(schedulerSourced: any[]) {
  return !_.isEmpty(_.filter(schedulerSourced, c => c.selector || c.selectors));
}

function isSwarmApp(schedulerSourced: any[]) {
  return !_.isEmpty(_.filter(schedulerSourced, c => c.service));
}

function isContainerMissing(components: any[], component: string, container: string): RuleMatchedAt {
  // fail if component missing
  const componentIndex: any = _.findIndex(components, { name: component });
  if (componentIndex === -1) {
    return { matched: true, paths: [`components`] };
  }

  // fail if container missing
  const c = _.find(components[componentIndex].containers, { image_name: container });
  if (!c) {
    return { matched: true, paths: [`components.${componentIndex}`] };
  }

  return { matched: false };
}

interface EventSubscription {
  component: string;
  container: string;
  componentIndex: number;
  containerIndex: number;
  eventIndex: number;
  subscriptionIndex: number;
}

export class EventSubscriptionContainerMissing implements Predicate<any> {
  public static fromJson(): EventSubscriptionContainerMissing {
    return new EventSubscriptionContainerMissing();
  }

  public test(root: any): RuleMatchedAt {

    if (_.isEmpty(_.get(root, "components"))) {
      return { matched: false };
    }

    const subscriptions: any[] = _.flatMap(root.components, (component: any, componentIndex: number) => {
      return _.flatMap(component.containers || [], (container: any, containerIndex: number) => {
        return _.flatMap(container.publish_events, (event: any, eventIndex: number) => {
          return _.map(event.subscriptions, (s: any, subscriptionIndex: number) => {
            return {
              component: s.component as string,
              container: s.container as string,
              componentIndex,
              containerIndex,
              eventIndex,
              subscriptionIndex,
            } as EventSubscription;
          });
        });
      });
    });

    const invalidSubscriptions = _.filter(subscriptions, s => {
      return isContainerMissing(root.components, s.component, s.container).matched;
    });

    if (_.isEmpty(invalidSubscriptions)) {
      return { matched: false };
    }

    return {
      matched: true,
      paths: _.map(subscriptions, s => {
        return `components.${s.componentIndex}.containers.${s.containerIndex}.publish_events.${s.eventIndex}.subscriptions.${s.subscriptionIndex}`;
      }),
    };
  }
}

/**
 * MoreThan matches when a collection has more than `limit` elements matching at least one instance in `values`
 */
export class MoreThan<T> implements Predicate<any> {
  public static fromJson(self: any): MoreThan<any> {
    return new MoreThan(self.limit, self.values);
  }

  constructor(
      private readonly limit: number,
      private readonly values: T[],
  ) {
  }

  public test(root: T[]): RuleMatchedAt {
    const matching: number[] = _.filter(
        _.flatMap(this.values, (val) => {
          return _.map(root, (supplied, index) => {
            return supplied === val ? index : -1;
          });
        }),
        i => i !== -1,
    );

    if (matching.length <= this.limit) {
      return { matched: false };
    }

    return {
      matched: true,
      paths: _.map(matching, m => `${m}`),
    };
  }
}

/**
 * NotBoolString matches if the target is not a parseable bool or a template
 */
export class NotBoolString implements Predicate<any> {
  public static fromJson(self: any): NotBoolString {
    return new NotBoolString(self.path);
  }

  constructor(
      private readonly path: string,
  ) {
  }

  public test(root): RuleMatchedAt {
    const val = _.get(root, this.path);
    if (_.isBoolean(val)) {
      return { matched: false };
    }

    if (_.isString(val)) {
      if (/^(true|false|1|0|{{repl.*)$/.test(val)) {
        return { matched: false };
      }
    }

    return { matched: true, paths: [this.path] };
  }
}

/**
 * Invalid URL matches when a url is not valid or does not use
 * `http` or `https` for the scheme
 */
export class InvalidURL implements Predicate<any> {
  public static fromJson(self: any): InvalidURL {
    return new InvalidURL(self.path);
  }

  constructor(
      private readonly path: string,
  ) {
  }

  public test(root): RuleMatchedAt {
    const val = _.get(root, this.path);
    const parsed = urlParse(val);

    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const hasHostname = !!parsed.hostname;
    const hasSpace = parsed.hostname.indexOf(" ") !== -1;

    if (isHttp && hasHostname && !hasSpace) {
      return { matched: false };
    }

    return { matched: true, paths: [this.path] };
  }
}

function isContainerNameMissing(components: any[], containerName: string): RuleMatchedAt {

  for (const component of components) {
    // console.log(`checking for container ${containerName} in component ${util.inspect(component, false, 100, true)}`);
    const c = _.find(component.containers, { name: containerName });
    if (c) {
      return { matched: false };
    }
  }

  return { matched: true, paths: ["components"] };
}

function collapseMatches(matches: RuleMatchedAt[]): RuleMatchedAt {
  return _.reduce(
      matches,
      (match, acc) => (
          {
            matched: match.matched || acc.matched,
            paths: _.concat(match.paths || [], acc.paths || []),
          }
      ),
      { matched: false, paths: [] as string[] },
  );
}

export class ContainerVolumesFromMissing implements Predicate<any> {
  public static fromJson(): ContainerVolumesFromMissing {
    return new ContainerVolumesFromMissing();
  }

  public test(root: any): RuleMatchedAt {
    if (_.isEmpty(root.components)) {
      return { matched: false };

    }
    const matches: RuleMatchedAt[] = _.flatMap(root.components, (component: Component, componentIndex) => {
      if (_.isEmpty(component.containers)) {
        return [{ matched: false }];
      }
      return _.flatMap(component.containers!, (container: Container, containerIndex) => {

        return _.map(container.volumes_from, (name: string, nameIndex) => {
          if (container.name === name || isContainerNameMissing(root.components, name).matched) {
            return {
              matched: true,
              paths: [`components.${componentIndex}.containers.${containerIndex}.volumes_from.${nameIndex}`],
            };
          }

          return { matched: false };
        });
      });
    });

    return collapseMatches(matches);

  }

}

export class ArrayMemberFieldsNotUnique implements Predicate<any> {
  public static fromJson(self: any): ArrayMemberFieldsNotUnique {
    return new ArrayMemberFieldsNotUnique(self.path);
  }

  constructor(
    private readonly path: string,
  ) {

  }

  public test(root: any): RuleMatchedAt {
    if (!_.isArray(root)) {
      throw new Error(`input to ${ArrayMemberFieldsNotUnique.constructor.name} must be an array`);
    }

    const seenValues: any = {};
    const matches = _.map(root, (item: any, index) => {
      const value: any = _.get(item, this.path);

      if (_.isEmpty(value)) {
        return { matched: false };
      }

      if (_.isUndefined(seenValues[value])) {
        seenValues[value] = `${index}.${this.path}`;
        return { matched: false };
      }

      return {
        matched: true,
        paths: [
          `${index}.${this.path}`,
          seenValues[value],
        ],
      };
    });
    return collapseMatches(matches);
  }
}

export class ContainerNamesNotUnique implements Predicate<any> {
  public static fromJson(): ContainerNamesNotUnique {
    return new ContainerNamesNotUnique();
  }

  public test(root: any): RuleMatchedAt {
    if (_.isEmpty(root.components)) {
      return { matched: false };
    }

    const seenNames = {} as any;
    const matches = _.flatMap(root.components, (component: Component, componentIndex) => {
      if (_.isEmpty(component.containers)) {
        return [{ matched: false }];
      }

      return _.map(component.containers!, (container: Container, containerIndex) => {
        if (_.isEmpty(container.name)) {

          return { matched: false };
        }

        if (_.isUndefined(seenNames[container.name])) {
          seenNames[container.name] = `components.${componentIndex}.containers.${containerIndex}.name`;
          return { matched: false };
        }

        return {
          matched: true,
          paths: [
            `components.${componentIndex}.containers.${containerIndex}.name`,
            seenNames[container.name],
          ],
        };
      });
    });

    return collapseMatches(matches);
  }

}

export class SemverMinimum implements Predicate<any> {
  // return true if the minimum version is after the provided version
  public static fromJson(obj: any): SemverMinimum {
    return new SemverMinimum(obj.path, obj.minimum);
  }

  constructor(
      private readonly path: string,
      private readonly minimum: string,
  ) {
  }

  public test(root: any): RuleMatchedAt {
    const value = _.get(root, this.path);

    if (semver.lt(value, this.minimum)) {
      return {matched: true, paths: [this.path]};
    }

    return { matched: false };
  }
}

export class IsNotUint implements Predicate<any> {
  public static fromJson(obj: any): IsNotUint {
    return new IsNotUint(obj.path);
  }

  constructor(
      private readonly path: string,
  ) {
  }

  public test(root: any): RuleMatchedAt {

    const val = _.get(root, this.path);

    // if this is a number >=0, and an integer, we'll call it a uint
    if (_.isNumber(val)) {
      if (Number.isInteger(val) && val >= 0) {
        return { matched: false };
      }
    }

    // if this is a string of digits, with no leading 0s, we'll still call it a uint
    if (_.isString(val)) {
      if (/^(0|[1-9]\d*)$/.test(val)) {
        return { matched: false };
      }
    }

    return {
      matched: true,
      paths: [this.path],
    };
  }
}

export class CustomRequirementsNotUnique implements Predicate<any> {
  public static fromJson(): CustomRequirementsNotUnique {
    return new CustomRequirementsNotUnique();
  }

  public test(root: any): RuleMatchedAt {
    if (_.isEmpty(root.custom_requirements)) {
      return { matched: false };
    }

    const seenNames = {} as any;
    const matches = _.flatMap(root.custom_requirements, (requirement: any, requirementIndex) => {
      if (_.isUndefined(requirement.id)) {
        return [{ matched: false }];
      }

      if (_.isUndefined(seenNames[requirement.id])) {
        seenNames[requirement.id] = `requirements.${requirementIndex}.id`;
        return { matched: false };
      }

      return {
        matched: true,
        paths: [
          `requirements.${requirementIndex}.id`,
          seenNames[requirement.id],
        ],
      };
    });

    return collapseMatches(matches);
  }
}

function buildSubscriptionMap(root: any): { [s: string]: string; } {
  const subscriptionMap: { [s: string]: string; } = {};

  for (const component of root.components) {
    for (const container of component.containers) {
      if (!_.isUndefined(container.publish_events)) {
        for (const event of container.publish_events) {
          if (!_.isUndefined(event.subscriptions)) {
            for (const subscription of event.subscriptions) {
              subscriptionMap[subscription.component + ":" + subscription.container] = component.name + ":" + container.image_name;
            }
          }
        }
      }
    }
  }
  return subscriptionMap;
}

// dependsOn checks if there is a subscription/dependency chain from current->subscribed
function dependsOn(subs: { [s: string]: string; }, current: string, subscribed: string): boolean {
  if (!(current in subs)) {
    return false;
  }
  const nextCurrent: string = subs[current];
  if (nextCurrent === subscribed) {
    return true;
  }
  delete subs[current]; // delete the previously used link to avoid loops
  return dependsOn(subs, nextCurrent, subscribed);
}

export class ContainerVolumesFromSubscription implements Predicate<any> {
  public static fromJson(): ContainerVolumesFromSubscription {
    return new ContainerVolumesFromSubscription();
  }

  public test(root: any): RuleMatchedAt {
    if (_.isEmpty(root.components)) {
      return { matched: false };

    }
    const matches: RuleMatchedAt[] = _.flatMap(root.components, (component: Component, componentIndex) => {
      if (_.isEmpty(component.containers)) {
        return [{ matched: false }];
      }
      return _.flatMap(component.containers!, (container, containerIndex) => {

        return _.map(container.volumes_from, (subscribedName: string, nameIndex) => {

          // find what component has a container of this name
          let subscribedComponentName: string = "";
          let subscribedContainerImageName: string = "";
          for (const otherComponent of root.components) {
            for (const otherContainer of otherComponent.containers) {
              if (otherContainer.name === subscribedName) {
                subscribedComponentName = otherComponent.name;
                subscribedContainerImageName = otherContainer.image_name;
              }
            }
          }

          if (container.image_name === subscribedName && component.name === subscribedComponentName) {
            // volumes_from can't refer to self
            return {
              matched: true,
              paths: [`components.${componentIndex}.containers.${containerIndex}.volumes_from.${nameIndex}`],
            };
          }

          // get subscription map
          const subscriptionMap: { [s: string]: string; } = buildSubscriptionMap(root);

          const found: boolean = dependsOn(subscriptionMap, component.name + ":" + container.image_name, subscribedComponentName + ":" + subscribedContainerImageName);

          if (!found) {
            return {
              matched: true,
              paths: [`components.${componentIndex}.containers.${containerIndex}.volumes_from.${nameIndex}`],
            };
          }
          return { matched: false };
        });
      });
    });

    return collapseMatches(matches);
  }
}

export class IsNotBytesCount implements Predicate<any> {
  public static fromJson(obj: any): IsNotBytesCount {
    return new IsNotBytesCount(obj.path);
  }

  constructor(
      private readonly path: string,
  ) {
  }

  public test(root: any): RuleMatchedAt {

    const val = _.get(root, this.path);

    // check against a regular expression to ensure number:unit format
    if (_.isString(val)) {
      if (/^(\d+(?:\.\d{1,3})?)([KMGTPE]B?)$/i.test(val.trim())) {
        return { matched: false };
      }
    }

    return {
      matched: true,
      paths: [this.path],
    };
  }
}

export class IsNotKubernetesQuantity implements Predicate<any> {
  public static fromJson(obj: any): IsNotKubernetesQuantity {
    return new IsNotKubernetesQuantity(obj.path);
  }

  constructor(
      private readonly path: string,
  ) {
  }

  public test(root: any): RuleMatchedAt {

    const val = _.get(root, this.path);

    if (_.isNumber(val)) {
      if (val >= 0) {
        return { matched: false};
      }
    }

    // check against a regular expression to ensure format
    if (_.isString(val)) {
      if (/^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/.test(val.trim())) {
        return { matched: false };
      }
    }

    return {
      matched: true,
      paths: [this.path],
    };
  }
}

export class Not<T_El> implements Predicate<T_El> {
  public static fromJson<E>(obj: any, registry: Registry): Not<E> {
    return new Not<E>(registry.compile(obj.pred));
  }

  constructor(
      private readonly pred: Predicate<T_El>,
  ) {
  }

  public test(root: any): RuleMatchedAt {
    const result = this.pred.test(root);
    if (!result.matched && _.isUndefined(result.paths)) {
      return { matched: !result.matched, paths: [""] };
    } else {
      return { matched: !result.matched, paths: result.paths };
    }
  }
}
