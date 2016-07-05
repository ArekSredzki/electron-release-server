module.exports = function (grunt) {
	grunt.registerTask('linkAssetsBuildProd', [
		'sails-linker:prodJsRelative',
		'sails-linker:prodStylesRelative',
		'sails-linker:devTpl',
		'sails-linker:prodJsRelativePug',
		'sails-linker:prodStylesRelativePug',
		'sails-linker:devTplPug'
	]);
};
