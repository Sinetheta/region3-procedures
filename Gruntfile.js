'use strict';

module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'SitePages'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    pkg: grunt.file.readJSON('package.json'),
    sp2010: {
      options: {
        port: 8080,
        load: '<%= yeoman.app %>/lists',
        keepalive: true
      },
      app: {
        options: {
          base: '<%= yeoman.app %>'
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },
    clean: ['<%= yeoman.dist %>'],
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    copy: {
      test: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{html,ico,txt}',
            '/styles',
            '/scripts']
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{html,ico,txt}',
            '/styles/fonts']
        }]
      }
    },
    imagemin: {
      test: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      files: {
        '<%= yeoman.dist %>/<%= pkg.name %>.min.css': ['<%= yeoman.app %>/styles.css']
      }
    },
    uglify: {
      files: {
        '<%= yeoman.dist %>/<%= pkg.name %>.min.js': ['<%= yeoman.app %>/scripts.js']
      }
    },
    concat: {
      options: {
        separator: ';'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        '!<%= yeoman.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
  });

  grunt.registerTask('server', ['sp2010:app']);

  grunt.registerTask('build', [
    'clean',
    'copy:dist',
    'useminPrepare',
    'imagemin',
    'concat',
    'cssmin',
    'uglify',
    'usemin',
    'sp2010:dist'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
