import * as _ from "lodash";
import { Predicate, RuleMatched, YAMLRule } from "../lint";
import { ConfigSection } from "../replicated";
import { FoundValue, TraverseSearcher, ValueSearcher } from "../traverse";

class Tester implements Predicate<any> {
  constructor(
    private readonly valueSearcher: ValueSearcher,
  ) {}
  public test(root: any): RuleMatched {
    const configItemNames = _.flatMap(root.config as ConfigSection[],
      section => _.map(section.items,
        item => item.name,
      ),
    );

    const configOptionFinder = (v: any) => /{{repl ConfigOption/.test(v);
    const configOptionUsages: FoundValue[] = this.valueSearcher.search(root, configOptionFinder);

    // usages that contain NONE OF configItemNames
    // every usage should match exactly one configItem
    const filtered: FoundValue[] = _.filter(configOptionUsages, configOptionUsage => {
      let matchesOne = false;
      _.forEach(configItemNames, itemName => {
        if (configOptionUsage.value.indexOf(itemName) !== -1) {
          matchesOne = true;
        }
      });
      return !matchesOne;
    });

    return { matched: !!filtered.length, paths: _.map(filtered, f => f.path) };
  }
}

export const configOptionExists: YAMLRule = {
  name: "config-option-exists",
  type: "warn",
  message: "Options referenced with `{{repl ConfigOption }}` must be present in the `config` section",
  test: new Tester(new TraverseSearcher()),
};

export const all: YAMLRule[] = [
  configOptionExists,
];
