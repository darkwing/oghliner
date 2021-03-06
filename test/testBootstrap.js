var promisify = require('promisify-node');
var expect = require('chai').expect;
var childProcess = require('child_process');
var temp = promisify(require('temp'));
var bootstrap = require('../lib/bootstrap');
var glob = require('glob');
var fs = require('fs');

describe('Bootstrap', function() {
  this.timeout(180000);

  var appName = 'test-bootstrap'
  var oldWd;
  before(function() {
    temp.track();
    return temp.mkdir('oghliner').then(function(dirPath) {
      oldWd = process.cwd();
      process.chdir(dirPath);
      childProcess.execSync('git init');
      childProcess.execSync('git remote add upstream https://github.com/mozilla/oghliner.git');
      return bootstrap({
        template: {
          name: appName
        },
      });
    });
  });

  it('should create supporting files', function() {
    expect(glob.sync('.gitignore').length).to.equal(1);
    expect(glob.sync('package.json').length).to.equal(1);
    expect(glob.sync('gulpfile.js').length).to.equal(1);
  });

  it('should create some app/ files', function() {
    expect(glob.sync('**/*.html').length).to.above(0);
    expect(glob.sync('**/*.css').length).to.above(0);;
    expect(glob.sync('**/*.png').length).to.above(0);
  });

  it('should set the app name', function() {
    var package = JSON.parse(fs.readFileSync('package.json'));
    expect(package.name).to.equal(appName);
  });

  it('should use the latest oghliner version', function() {
    var package = JSON.parse(fs.readFileSync('package.json'));
    var oghlinerPackage = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
    expect(package.dependencies.oghliner).to.equal('^' + oghlinerPackage.version);
  });

  after(function() {
    process.chdir(oldWd);
    temp.cleanupSync();
  });
});
