exports.config = {
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,

    capabilities: {
      'browserName': 'chrome',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'build': process.env.TRAVIS_BUILD_NUMBER,
      'name': 'ui-mask Protractor Tests'
    },

    specs: ['test/maskSpec.protractor.js'],
    baseUrl: 'http://localhost:8000'
};
