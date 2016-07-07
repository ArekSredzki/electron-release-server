module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'jst:dev',
		'pug:dev',
		'less:dev',
		'sass:dev',
		'sync:dev',
		'coffee:dev'
	]);
};
