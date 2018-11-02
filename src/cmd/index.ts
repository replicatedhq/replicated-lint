#!/usr/bin/env npx ts-node
import * as yargs from "yargs";
import * as validate from "./validate";

// tslint:disable
yargs
  .command(
    validate.name,
    validate.describe,
    validate.builder,
    validate.handler,
  )
  .env()
  .help()
  .demandCommand()
  .argv;
