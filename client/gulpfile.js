var elixir = require('laravel-elixir');
var task = elixir.Task;
var gulp = require('gulp');
var htmltojson = require('gulp-html-to-json');
var concatFilenames = require('gulp-concat-filenames');

var public_styles_folder = './public/css';
var public_scripts_folder = './public/js';
var assets_folder = './resources/assets';

var style_file = public_styles_folder + '/app.css';
var script_file = public_scripts_folder + '/app.js';

elixir.extend('partials', function () {
    new task('partials', function () {
        return gulp.src(assets_folder + '/partials/**/*.html')
            .pipe(concatFilenames('partials.js', {
                prepend: '//= * : ',
                root: assets_folder + '/partials'
            }))
            .pipe(htmltojson({
                filename: "partials", //without file extension
                useAsVariable: false
            }))
            .pipe(gulp.dest(assets_folder + '/partials'));
    }).watch(assets_folder + '/partials/**/*.html');
});

elixir(function (mix) {

    mix
        .partials()
        .sass('main.scss', style_file)
        .browserify('main.js', script_file, null, {
            paths: ['./node_modules', './config'],
            debug: !mix.production,
        })
        .version([style_file, script_file])
        .copy('./node_modules/font-awesome/fonts', './public/build/fonts')
        .scripts(['jsload.js'], './public/js/jsload.js')
        .copy('./resources/pages/index.html', './public/index.html')
    ;
});