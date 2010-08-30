/**
 * Ajaxy Bookmark Script
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
(function(){
	// Handle
	var ajaxyReady = function($){
		// Fetch Elements
		var $body = $(document.body),
			contentId = null,
			$content = null;
		
		// Fetch the contentId
		var contentId = false;
		while ( !contentId ) {
			contentId = prompt(
				"Ajaxy needs to know what is the ID of the Element which contains the content for all your pages.\n"+
				"\n"+
				"For example if you have <div id=\"page\">Your page's content is in here</div>, then \'page\' is the ID we need to know.'"
			);
			if ( !contentId ) {
				break;
			}
			else {
				// Try to find it
				$content = $(/[#,:]/.test(contentId) ? contentId : ('#'+contentId)).filter(':first');
				if ( $content.length === 1 ) {
					alert('We succesfully found that ID! Your website is now ajaxified. :-)');
				}
				else {
					$content = null;
					if ( !confirm('We could not find that ID within your page! Would you like to try again?') ) {
						return;
					}
				}
			}
		}
		
		// Configure Ajaxy
		$.Ajaxy.configure({
			'options': {
				'root_url': 'http://'+(document.location.host||document.location.hostname),
				'base_url': '',
				'redirect': false,
				'relative_as_base': true,
				'track_all_anchors': true,
				'track_all_internal_links': true,
				'scrollto_content': true
			},
			'Controllers': {
				'_generic': {
					request: function(){
						// Loading
						$body.addClass('loading');
						// Done
						return true;
					},
					response: function(){
						// Prepare
						var Ajaxy = $.Ajaxy; var data = this.State.Response.data; var state = this.state||'unknown';
						
						// Title
						var title = data.title||false; // if we have a title in the response JSON
						if ( !title && this.state||false ) title = this.state; // if not use the state as the title
						if ( title ) document.title = title; // if we have a new title use it
						
						// Loaded
						$body.removeClass('loading');
						
						// Return true
						return true;
					},
					refresh: function(){
						// Prepare
						var data = this.State.Response.data; var state = this.state||'unknown';
						
						// Loaded
						$body.removeClass('loading');
						
						// Done
						return true;
					},
					error: function(){
						// Prepare
						var Ajaxy = $.Ajaxy; var data = this.State.Error.data||this.State.Response.data; var state = this.state||'unknown';
						
						// Error
						var error = data.error||data.responseText||false;
						var error_message = data.content||error;
						
						// Log what is happening
						window.console.error('$.Ajaxy.configure.Controllers._generic.error', [this, arguments], error_message);
						
						// Loaded
						$body.removeClass('loading');
						
						// Done
						return true;
					}
				},
				'page': {
					selector: '.ajaxy-page',
					matches: /./, // match all
					request: function(){
						// Hide Content
						$content.stop(true,true).fadeOut(400);
						
						// Return true
						return true;
					},
					response: function(){
						// Prepare
						var Action = this; var data = this.State.Response.data; var state = this.state; var State = this.State;
						
						// Fetch
						var content = $(data.content).find('#'+contentId).html();
						
						// Prepare Content
						$content.stop(true,true).html(content);
						
						// Display Content
						$content.delay(100).fadeIn(400,function(){
							Action.documentReady($content);
						});
						
						// Return true
						return true;
					},
					refresh: function(){
						// Prepare
						var Action = this; var data = this.State.Response.data; var state = this.state; var State = this.State;
						
						// Prepare Content
						$content.stop(true,true);
						
						// Check Content
						if ( $content.is(':visible') ) {
							$content.css('opacity',0);
						}
						
						// Setup Display Function
						var displayFunction = function(){
							Action.documentReady($content);
						};
						
						// Prepare Content
						$content.stop(true,true).show();
						
						// Display Content
						Action.documentReady($content);
						
						// Return true
						return true;
					}
				}
			}
		});
	};
	
	// Prepare
	var jqueryInserted = null,
		ajaxyInserted = null,
		ensureFunction = function(){
			// Ensure jQuery
			if ( typeof jQuery === 'undefined' ) {
				// Insert?
				if ( jqueryInserted === null ) {
					// Log
					window.status = 'Loading jQuery... Please wait..';
					// Insert
					var e = document.createElement('script');
					e.setAttribute('language','javascript');
					e.setAttribute('src','http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
					document.body.appendChild(e);
					delete e;
				}
				// Recall
				setTimeout(ensureFunction, 500);
			}
			else {
				// jQuery is Loaded
				// Ensure Ajaxy
				if ( typeof jQuery.Ajaxy === 'undefined' ) {
					// Insert?
					if ( ajaxyInserted === null ) {
						// Log
						window.status = 'Loading Ajaxy... Please wait..';
						// Insert
						var e = document.createElement('script');
						e.setAttribute('language','javascript');
						e.setAttribute('src','http://github.com/balupton/jquery-ajaxy/raw/dev/scripts/jquery.ajaxy.js');
						document.body.appendChild(e);
						delete e;
					}
					// Recall
					setTimeout(ensureFunction, 500);
				}
				else {
					// We are ready
					ajaxyReady(jQuery);
				}
			}
		};
		
	// Ensure
	ensureFunction();
})();