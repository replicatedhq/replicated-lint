import * as _ from "lodash";
import { YAMLSequence, Kind, YAMLNode } from "yaml-ast-parser";
import { Range } from "./lint";

/**
 * Find the first `YAMLNode` matching `path`.
 *
 * Convenience version of `findNodes` when exactly one node is expected.
 */
export function findNode(root: YAMLNode, path: string): YAMLNode {
  return findNodeRec([root], tokenize(path))[0];
}

/**
 * Find all `YAMLNode`s matching `path`
 *
 * Convenience function to be used instead of invoking findNodeRec directly
 */
export function findNodes(root: YAMLNode, path: string): YAMLNode[] {
  return findNodeRec([root], tokenize(path));
}

export function nodePosition(node: YAMLNode, path, lineColumnFinder: any, offset?: number): Range {
  offset = offset || 0;
  const start = lineColumnFinder.fromIndex(node.startPosition + offset);
  if (!start) {
    console.log("start" + path);
  }

  const end = lineColumnFinder.fromIndex(node.endPosition + offset) || {
      line: 0,
      col: 0,
    };
  return {
    path,
    start: {
      position: node.startPosition,
      line: start.line - 1, // sigh
      column: start.col - 1,
    },
    end: {
      position: node.endPosition,
      line: end.line - 1,
      column: end.col - 1,
    },
  };
}

/**
 * Get the position of the node in AST `root` at `path`. Use a caching lineColumnFinder
 * from `line-column` package to convert positions to 0-indexed line/column values
 */
export function astPosition(root: YAMLNode, path: string, lineColumnFinder: any, offset?: number): Range[] {
  if (_.isEmpty(path)) {
    return [];
  }
  const nodes = findNodes(root, path);

  return _.map(nodes, (n: YAMLNode) => nodePosition(n, path, lineColumnFinder, offset));
}

/**
 * AST walker to find nodes matching "path".
 *
 * Given a list of YAMLNodes and a path, emit any nodes that are candidates to match
 * the path.
 *
 * Returns any nodes that are children of current and are candidates to match the
 * traversal path in `pathParts`.
 *
 * Simple example:
 *
 * t0
 *   current: [YAMLMap{"foo": "bar", "spam": YAMLMap{"eggs": "etc"}}]
 *   pathParts: ["spam", "eggs"]
 *
 * t1 recur on current.mappings with same path parts
 *   current: [YAMLMapping{"foo": "bar"}, YAMLMapping{"spam": YAMLMap{"eggs": "etc"}}]
 *   pathParts: ["spam","eggs"]
 *
 *     YAMLMapping{"foo": "bar"} does not match, return []
 *     YAMLMapping{"spam": YAMLMap{"eggs": "etc"}} matches first key "spam", recur
 *
 * t2 recur on [YAMLMapping.value] with rest of path parts
 *
 *   current: [YAMLMap{"eggs": "etc"}]
 *   pathParts: ["eggs"]
 *
 * t3 recur on YAMLMap.mappings with same path parts
 *   current: [YAMLMapping{"eggs": "etc"}]
 *   pathParts: ["eggs"]
 *
 *     YAMLMapping{"eggs":"etc"} matches first key "eggs" and has no more path parts, return [YAMLMapping{"eggs":"etc"}]
 *
 * t4 return in t3,
 *
 *     flatMap flattens [[YAMLMapping{"eggs":"etc"}] to [YAMLMapping{"eggs":"etc"}]
 *
 * t5 return in t2
 *
 *     flatMap flattens [[YAMLMapping{"eggs":"etc"}] to [YAMLMapping{"eggs":"etc"}]
 *
 * t6 return in t1
 *
 *     flatMap flattens [[], [YAMLMapping{"eggs":"etc"}] to [YAMLMapping{"eggs":"etc"}]
 *
 * t7 return in t0
 *
 *     flatMap flattens [[YAMLMapping{"eggs":"etc"}] to [YAMLMapping{"eggs":"etc"}]
 *
 * @param current
 * @param pathParts
 * @returns {YAMLNode[]}
 */
function findNodeRec(current: YAMLNode[], pathParts: string[]): YAMLNode[] {
  const first = pathParts[0];
  const rest = pathParts.slice(1);

  const findInMapping = (node: YAMLNode) => {
    if (hasKey(node, first)) {
      // base case
      if (_.isEmpty(rest)) {
        return [node];
      }
      return findNodeRec([node.value], rest);
    }
    return [];
  };

  const findInMap = (node: YAMLNode) => {
    return findNodeRec(node.mappings, pathParts);
  };

  const findInSeq = (node: YAMLNode) => {
    const seq = <YAMLSequence> node;
    if (matchSeq(first)) {
      if (_.isEmpty(rest)) {
        return seq.items;
      }
      return findNodeRec(seq.items, rest);
    }

    if (isSeqIndex(first)) {
      // IndexNotFound
      if (!seq.items[first]) {
        return [];
      }

      // we found the node
      if (_.isEmpty(rest)) {
        return seq.items[first];
      }

      // search this node for the remainder of the path
      return findNodeRec([seq.items[first]], rest);
    }
    return [];
  };

  return _.flatMap(
    current,
    (node: YAMLNode) => {
      if (isMapping(node)) {
        return findInMapping(node);
      }

      if (isMap(node)) {
        return findInMap(node);
      }

      if (isSeq(node)) {
        return findInSeq(node);
      }

      return [];
    },
  );
}

function tokenize(path: string): string[] {
  return path.split(".");
}

function isMap(node: YAMLNode) {
  return node.kind === Kind.MAP;
}
function isSeq(node: YAMLNode) {
  return node.kind === Kind.SEQ;
}

function isMapping(node: YAMLNode) {
  return node.kind === Kind.MAPPING;
}

function hasKey(c: YAMLNode, key: string): boolean {
  return (c.key && c.key.value === key) || false;
}

function matchSeq(key: string) {
  return key === "*";
}

function isSeqIndex(key: string) {
  return /\d+/.test(key);
}
