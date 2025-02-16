const {
  getConfig, printError, getTestRoot, createOutputDir,
} = require('./utils');
const Config = require('../config');
const Codecept = require('../codecept');

module.exports = async function (test, options) {
  // registering options globally to use in config
  // Backward compatibility for --profile
  process.profile = options.profile;

  if (options.profile) {
    process.env.profile = options.profile;
  }

  const configFile = options.config;

  let config = getConfig(configFile);
  if (options.override) {
    config = Config.append(JSON.parse(options.override));
  }
  const testRoot = getTestRoot(configFile);
  createOutputDir(config, testRoot);

  const codecept = new Codecept(config, options);

  try {
    codecept.init(testRoot);
    await codecept.bootstrap();
    codecept.loadTests(test);

    if (options.verbose) {
      const getInfo = require('./info');
      await getInfo();
    }

    await codecept.run();
  } catch (err) {
    printError(err);
    process.exitCode = 1;
  } finally {
    await codecept.teardown();
  }
};
