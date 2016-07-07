module.exports = function(grunt) {

  grunt.config.set('pug', {
    dev: {
      options: {},
      files: [{
				expand: true,
				cwd: 'assets/',
				src: '**/*.pug',
				dest: '.tmp/public/',
				ext: '.html'
			}]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-pug');
};
