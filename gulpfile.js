import gulp from 'gulp';
import babel from 'gulp-babel';
import postcss from 'gulp-postcss';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import pimport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import sync from 'browser-sync';
import eslint from 'gulp-eslint';
import prettier from 'gulp-prettier';

// HTML
export const html = () => {
	return gulp.src('src/*.html')
		.pipe(gulp.dest('test'))
		.pipe(sync.stream());
};

// Styles
export const styles = () => {
	return gulp.src('src/styles/index.css')
		.pipe(postcss([
			pimport,
		]))
		.pipe(gulp.dest('test/styles'))
		.pipe(sync.stream());
};

// Scripts
export const scripts = () => {
	return gulp.src('src/scripts/index.js')
		.pipe(babel({
			presets: ['@babel/preset-env'],
		}))
		.pipe(prettier({editorconfig: true}))
		.pipe(gulp.dest('test/scripts'))
		.pipe(sync.stream());
};

// Copy
export const copy = () => {
	return gulp.src([
		'src/fonts/**/*',
		'src/images/**/*',
	], {
		base: 'src',
	})
		.pipe(gulp.dest('test'))
		.pipe(sync.stream({
			once: true,
		}));
};

// Server
export const server = () => {
	sync.init({
		ui: false,
		notify: false,
		server: {
			baseDir: 'test',
		},
	});
};

// Watch
export const watch = () => {
	gulp.watch('src/*.html', gulp.series(html));
	gulp.watch('src/styles/**/*.css', gulp.series(styles));
	gulp.watch('src/scripts/**/*.js', gulp.series(scripts));
	gulp.watch([
		'src/fonts/**/*',
		'src/images/**/*',
	], gulp.series(copy));
};


// Build
export const build = () => {
	// test HTML into production
	gulp.src('src/*.html')
		.pipe(htmlmin({
			removeComments: true,
			collapseWhitespace: true,
		}))
		.pipe(gulp.dest('dist'));

	// test CSS into production
	gulp.src([
		'src/styles/index.css',
	])
		.pipe(postcss([
			pimport,
			autoprefixer,
			csso,
		]))
		.pipe(gulp.dest('dist/styles'));

	// test FONTS into production
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	// test IMAGES into production
	gulp.src('src/images/**/*')
		.pipe(gulp.dest('dist/images'));

	// test SCRIPTS into production
	gulp.src('src/scripts/**/*')
		.pipe(prettier({editorconfig: true}))
		.pipe(eslint()) // eslint
		.pipe(eslint.format()) // eslint console
		.pipe(eslint.failAfterError()) // eslint error
		.pipe(babel({
			presets: ['@babel/preset-env'],
		}))
		.pipe(terser())
		.pipe(gulp.dest('dist/js'));
};

// linter
export const linter = () => {
	return gulp.src('test/scripts/index.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
};


// Default
export default gulp.series(
	gulp.parallel(
		html,
		styles,
		scripts,
		copy,
	),
	gulp.parallel(
		watch,
		server,
	),
);
