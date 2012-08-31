// Config file for server. General settings go at the top and modules have their own sections
var config = {
	// General settings
	host: "127.0.0.1",
	port: 8585,
	// Add your search provider modules to this array
	searchProviders: ["./search_modules/AtlasSearch"],
	// Atlas settings
	AtlasSearch: {
		apiKey: '',
		limit: 50,
		timeout:10000,
	},
};

module.exports = config;