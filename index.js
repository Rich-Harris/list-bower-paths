var fs = require( 'fs' ),
	path = require( 'path' ),
	promo = require( 'promo' ),
	Promise = promo.Promise,
	findup = require( 'findup-sync' ),
	glob = promo( require( 'glob' ) ),

	readFile = promo( fs.readFile );

var listBowerPaths = function ( options, cb ) {
	var cwd, bowerrc, bower_components, paths, promise;

	options = options || {};

	cwd = options.cwd || process.cwd();
	bowerrc = findup( '.bowerrc', { cwd: cwd });

	if ( bowerrc ) {
		cwd = path.dirname( bowerrc );
	}

	if ( options.sync ) {
		return doSync( cwd, bowerrc, options.relative );
	}

	promise = doAsync( cwd, bowerrc, options.relative );
	if ( cb ) promise.then( cb );

	return promise;
};

function doSync ( cwd, bowerrc, relative ) {
	var bower_components, paths;

	bower_components = path.join( cwd, JSON.parse( fs.readFileSync( bowerrc ).toString() ).directory || 'bower_components' );
	paths = {};

	glob.sync( path.join( bower_components, '*/.bower.json' ) ).forEach( function ( bowerFile ) {
		var dir, name, json, config, main;

		dir = path.dirname( bowerFile ).replace( ( relative ? bower_components : cwd ) + '/', '' );

		json = fs.readFileSync( bowerFile ).toString();
		config = JSON.parse( json );
		main = config.main;

		if ( main ) {
			paths[ config.name ] = path.join( dir, main );
		}
	});

	return paths;
}

function doAsync ( cwd, bowerrc, base, cb ) {
	return readFile( bowerrc ).then( function ( result ) {
		var bower_components, paths;

		bower_components = path.join( cwd, JSON.parse( result.toString() ).directory || 'bower_components' );
		paths = {};

		return glob( path.join( bower_components, '*/.bower.json' ) ).then( function ( files ) {
			var promises;

			promises = files.map( function ( bowerFile ) {
				return readFile( bowerFile ).then( function ( result ) {
					var dir, name, json, config, main;

					dir = path.dirname( bowerFile ).replace( ( relative ? bower_components : cwd ) + '/', '' );

					json = result.toString();
					config = JSON.parse( json );
					main = config.main;

					if ( main ) {
						paths[ config.name ] = path.join( dir, main );
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
