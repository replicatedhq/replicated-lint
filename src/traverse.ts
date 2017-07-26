import * as _ from "lodash";

export interface FoundValue {
  path: string;
  value: any;
}

export type ValuePredicate = (value: any) => boolean;

export interface ValueSearcher {
  searchMatch(obj: any, pred: ValuePredicate): FoundValue[];
  searchContains(obj: any, pred: string): FoundValue[];
}

/**
 * This duplicates a lot of logic we had to implement
 * for the AST walker, we can maybe combine them at some point,
 * maybe have the AST walker take hook that fires on every node.
 */
export class TraverseSearcher implements ValueSearcher {
  constructor(
    private readonly traverser: ValueTraverser,
  ) { }

  public searchMatch(obj: any, pred: ValuePredicate): FoundValue[] {
    const found: FoundValue[] = [];
    this.traverser.traverse(obj, [], (value, pathParts) => {
      if (pred(value)) {
        found.push({
          value,
          path: pathParts.join("."),
        });
      }
    });
    return found;
  }

  public searchContains(obj: any, pred: string): FoundValue[] {
    const found: FoundValue[] = [];
    this.traverser.traverse(obj, [], (value, pathParts) => {
      if (value && _.isFunction(value.indexOf) && value.indexOf(pred) !== -1) {
        found.push({
          value,
          path: pathParts.join("."),
        });
      }
    });
    return found;
  }

}

export class ValueTraverser {
  public traverse(obj: any, pathParts: string[], cb: (value: any, pathParts: string[]) => void): void {
    _.forIn(obj, (val, key: string) => {
      const pathCopy = _.clone(pathParts);
      pathCopy.push(key);

      if (_.isObject(val)) {
        this.traverse(val, pathCopy, cb);
        return;
      } else {
        cb(val, pathCopy);
      }

    });
  }

}
