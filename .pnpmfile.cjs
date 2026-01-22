// ToDo: remove this override with local functionality when/if pnpm supports linking without requiring a project file changes (like yarn link)
// open issue: https://github.com/pnpm/pnpm/issues/4341
const localPackages = {
  // Write your local packages to override the version in package.json
  // Use this in order to test your local changes in a package
  // Do not commit localPackages to git!!!
  // Example:
  // '@wntr/lx-ui': 'link:C:\\Darbs\\LXUI\\ui',
}

function readPackage(pkg, context) {
  Object.keys(localPackages).forEach((key) => {
    if (pkg.dependencies[key]) {
      context.log(`Overriding "${key}":"${pkg.dependencies[key]}" with "${key}":"${localPackages[key]}"`);
      pkg.dependencies[key] = localPackages[key];
    }
  });

  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}