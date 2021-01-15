"use strict";
const gulp = require('gulp');
const uglify = require('gulp-terser');
const notify = require('gulp-notify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const jsFiles = [
  "src/main/seedrandom.js",
  "src/main/core.js",
  "src/main/math.js",
  "src/main/vec2.js",
  "src/main/matrix.js",
  "src/main/crypt.js",
  "src/main/fsm.js",
  "src/main/gfx.js",
  "src/main/geo2d.js",
  "src/main/quadtree.js",
  "src/main/negamax.js"
];

var destDir = 'dist'; //or any folder inside your public asset folder
//To concat and Uglify All JS files in a particular folder
gulp.task("bundleJS", function(){
    return gulp.src(jsFiles)
        .pipe(concat("mcfud.js")) //this will concat all the files into concat.js
        .pipe(gulp.dest("dist")) //this will save concat.js in a temp directory defined above
        .pipe(uglify()) //this will uglify/minify uglify.js
        .pipe(rename("mcfud.min.js")) //this will rename concat.js to uglify.js
        .pipe(gulp.dest("dist")); //this will save uglify.js into destination Directory defined above
});

gulp.task("default", gulp.series("bundleJS"), function(){
  console.log("Gulp started");
});


