module.exports = function(grunt) {
  grunt.registerTask('default', [
    'wiredep',
    'compileAssets',
    'linkAssets',
    'watch'
  ]);
};
