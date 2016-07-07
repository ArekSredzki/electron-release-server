module.exports = function (grunt) {
	grunt.registerTask('linkAssetsBuild', [
		'sails-linker:devJsRelative',
		'sails-linker:devStylesRelative',
		'sails-linker:devTpl',
		'sails-linker:devJsRelativePug',
		'sails-linker:devStylesRelativePug',
		'sails-linker:devTplPug'
	]);
};
