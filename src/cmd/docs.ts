exports.command = "docs";
exports.describe = "Manage replicated-lint documentation";
exports.builder = (yargs) => {
  return yargs.commandDir("docs").demandCommand();
};
