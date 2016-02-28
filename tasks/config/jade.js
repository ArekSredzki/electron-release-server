module.exports = function(grunt) {

  grunt.config.set('jade', {
    dev: {
      options: {},
      files: [{
				expand: true,
				cwd: 'assets/',
				src: '**/*.jade',
				dest: '.tmp/public/',
				ext: '.html'
			}]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
};
