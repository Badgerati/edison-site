var gulp = require('gulp');

gulp.task('default', function() {
    // jquery
    gulp.src('bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('public/scripts/'));

    // moment.js
    gulp.src('bower_components/moment/min/moment.min.js')
        .pipe(gulp.dest('public/scripts/'));
    
    // validator.js
    gulp.src('bower_components/validator-js/validator.min.js')
        .pipe(gulp.dest('public/scripts/'));

    // bootstrap
    gulp.src('bower_components/bootstrap/dist/css/*.min.css')
        .pipe(gulp.dest('public/css/'));
        
    gulp.src('bower_components/bootstrap/dist/js/*.min.js')
        .pipe(gulp.dest('public/scripts/'));
        
    gulp.src('bower_components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('public/fonts/'));

    // bootstrap-select
    gulp.src('bower_components/bootstrap-select/dist/css/*.min.css')
        .pipe(gulp.dest('public/css/'));
        
    gulp.src('bower_components/bootstrap-select/dist/js/*.min.js')
        .pipe(gulp.dest('public/scripts/'));
});