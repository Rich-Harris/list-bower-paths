var fs = require( 'fs' ),
	path = require( 'path' ),
	promo = require( 'promo' ),
	Promise = promo.Promise,
	findup = require( 'findup-sync' ),
	glob = promo( require( 'glob' ) ),

	readFile = promo( fs.readFile ),

	bower_components;

var listBowerPaths = function ( options, cb ) {
	var cwd, bowerrc, bower_components, paths, promise;

	if ( typeof options === 'function' ) {
		cb = options;
		options = {};
	} else if ( !options ) {
		options = {};
	}

	cwd = options.cwd || process.cwd();
	bowerrc = findup( '.bowerrc', { cwd: cwd });

	if ( bowerrc ) {
		cwd = path.dirname( bowerrc );
	}

	if ( options.sync ) {
		bower_components = options.directory || ( bowerrc && JSON.parse( fs.readFileSync( bowerrc ).toString() ).directory ) || 'bower_components';
		return doSync( cwd, bower_components, options );
	}

	if ( options.directory || !bowerrc ) {
		bower_components = options.directory || 'bower_components';
		promise = doAsync( cwd, bower_components, options );
	} else {
		promise = readFile( bowerrc ).then( function ( json ) {
			bower_components = JSON.parse( json ).directory || 'bower_components';
			return doAsync( cwd, bower_components, options );
		});
	}

	if ( cb ) {
		promise.then( function ( result ) {
			cb( null, result );
		}, cb );
	}

	return promise;
};

function doSync ( cwd, bower_components, options ) {
	var paths = {};

	glob.sync( path.join( bower_components, '*/.bower.json' ) ).forEach( function ( bowerFile ) {
		var dir, name, json, config, main, modulePath;

		dir = path.dirname( bowerFile ).replace( ( options.relative ? bower_components : cwd ) + '/', '' );

		json = fs.readFileSync( bowerFile ).toString();
		config = JSON.parse( json );
		main = config.main;

		if ( main ) {
			modulePath = path.join( dir, main );

			if ( options.noext ) {
				modulePath = modulePath.replace( /\.js$/, '' );
			}

			paths[ config.name ] = modulePath;
		}
	});

	return paths;
}

function doAsync ( cwd, bower_components, options ) {
	return readFile( bowerrc ).then( function ( result ) {
		var paths = {};

		return glob( path.join( bower_components, '*/.bower.json' ) ).then( function ( files ) {
			var promises;

			promises = files.map( function ( bowerFile ) {
				return readFile( bowerFile ).then( function ( result ) {
					var dir, name, json, config, main, modulePath;

					dir = path.dirname( bowerFile ).replace( ( options.relative ? bower_components : cwd ) + '/', '' );

					json = result.toString();
					config = JSON.parse( json );
					main = config.main;

					if ( main ) {
						modulePath = path.join( dir, main );

						if ( options.noext ) {
							modulePath = modulePath.replace( /\.js$/, '' );
						}

						paths[ config.name ] = modulePath;
					}
				});
			});

			return Promise.all( promises ).then( function () {
				return paths;
			});
		});
	});
}

listBowerPaths.sync = function ( options ) {
	( options || ( options = {} ) ).sync = true;
	return listBowerPaths( options );
}

module.exports = listBowerPaths;
