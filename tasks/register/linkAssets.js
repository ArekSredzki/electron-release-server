module.exports = function (grunt) {
	grunt.registerTask('linkAssets', [
		'sails-linker:devJs',
		'sails-linker:devStyles',
		'sails-linker:devTpl',
		'sails-linker:devJsPug',
		'sails-linker:devStylesPug',
		'sails-linker:devTplPug'
	]);
};
