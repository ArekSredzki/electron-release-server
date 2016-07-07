module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
		'pug:dev',
		'less:dev',
		'sass:dev',
		'copy:dev',
		'coffee:dev'
	]);
};
