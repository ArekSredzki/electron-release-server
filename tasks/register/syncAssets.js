module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'jst:dev',
		'jade:dev',
		'less:dev',
		'sass:dev',
		'sync:dev',
		'coffee:dev'
	]);
};
