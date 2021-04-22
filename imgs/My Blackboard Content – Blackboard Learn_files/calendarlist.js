//
// calendarlist: a JQuery plugin to display a list of a user's calendars in a div
//
// Examples:
//
// $('#calendars').calendarlist({ calendars: array or URL or JQuery.ajax options object or function });
//
// The array of calendars looks like:
//
//    [
//      { 
//        label: "Biology",
//        id: "bio101",
//        className: "cal-color-02"
//      },
//      { 
//        label: "Chemistry",
//        id: "chem101",
//        className: "cal-color-03"
//      }
//    ]
//
// calendars can also be a RESTful URL that returns an array of the above format, e.g.,
//
// calendars: 'http://yourhost.com/restful/method'

// You can also specify the same options of a JQuery.ajax call, e.g.,
//
// calendars: { url: 'http://yourhost.com/restful/method', type: 'GET', ... }
//
// Lastly, you can specify a function that takes a a JQuery selector and callback and must call the callback with the selector and an array of calendars

( function( $ )
{
  var _settings = {};
  var _data = {};

  var updateCalendarList = function( el, data, clickCallback )
  {
    return el.each( function()
    {
      if ( data.calendars.length > 10 )
      {
        $('#checkUncheckAll').show();
      }

      _.each( data.calendars, function( cal )
      {
        var checkedStr = "";
        var disabledStr = "";
        
        // if there is only one calendar, then force it to show as checked and 
        // then disable the checkbox -- we don't want to let the user hide the
        // events for the only calendar they have available to them 
        if ( data.calendars.length <= 1 )
        {
          checkedStr = "checked='checked'";
          disabledStr = "disabled='disabled'";
        }
        else
        {
          if ( cal.checked === true )
          {
            checkedStr = "checked='checked'";
          }
        }

        $(
           '<div class="calendar-item calendar-name"><label for="cal-check_' + cal.id + '"><span class="label-color" style="background-color:' + cal.color + '">' +
           '<input type="checkbox" name="cal-check [ ]" class="cal-check" id="cal-check_' + cal.id + '" value="' + cal.id + '"' +
           checkedStr + ' ' + disabledStr + '/><span class="notch" style="border-left-color:'+cal.color+';border-right-color:'+cal.color+ '"></span></span>' + cal.label + 
           '</label><span  id="cal-color_'+cal.id+'" class="colorPicker-picker"></span></div>' )
             .appendTo( el );
      } );

      var clickFn = function ( event ) {
        var checked = event.target.checked;
        var calId = event.target.value;
        _.each (_data.calendars, function( cal ){ if( cal.id === calId) cal.checked = checked;  });
        if ( clickCallback )
          clickCallback( calId, checked );
      };
      $( "#calendars input:checkbox" ).on( "click", clickFn );
      _.each (_data.calendars, function( cal ){ $('#cal-color_'+escapeCalId(cal.id)).colorPicker( {        
        onColorChange : function (  color ) { 
          if ( !color.match(/[0-9A-F]{6}$/i) )
            return;
          $('#cal-check_' + escapeCalId(cal.id) ).parent('.label-color').css("background-color", color);
          $('#cal-check_' + escapeCalId(cal.id) ).next('.notch').css("border-left-color", color);  
          if ( clickCallback )
            clickCallback( cal.id, undefined, color );          
        },
        pickerDefault: cal.color.toLowerCase()
      }
      );  });
    } );
  };

  var ajaxError = function( jqXHR, textStatus, errorThrown )
  {
    alert( "We had an error getting your calendars " + errorThrown );
  };
  
  // JQUERY object has not been identified if calId ( COURSE ID) contains DOT(.)
  // To avoid this we need to use DOT(.) with escape character ( \\ ).
  var escapeCalId = function( calId )
  {
    return calId.replace(/\./g, '\\.');
  };

  var methods = 
  {
    init : function( options )
    {
      var defaults ={ calendars : [] // a JSON array of calendar objects; can be a RESTful URL too
                    };
      _settings = _.extend( {}, defaults, options );
      var calendarList = _settings.calendars;
      var restUrl = null;
      var $this = $( this );
      var calendarListEl = this;
      var ajaxOpts =
      {
        type : "GET",
        cache : false,
        error : ajaxError
      };
      if ( _.isArray( calendarList ) )
      {
        if ( _settings.callback )
        {
          _settings.callback( $ );
        }
        return updateCalendarList( calendarListEl, calendarList, _settings.clickCallback );
      }

      if ( _.isString( calendarList ) )
      {
        // Assume a REST URL and invoke it
        ajaxOpts.url = calendarList;
      }
      else if ( _.isObject( calendarList ) && calendarList.url )
      {
        ajaxOpts = _.extend( {}, ajaxOpts, calendarList );
      }
      else if ( _.isFunction( calendarList ) )
      {
        return calendarList( calendarListEl, updateCalendarList, _settings.callback, _settings.clickCallback );
      }
      else
      {
        alert( 'Something is not configured correctly' );
        return this;
      }
      $this.spin( 'large', 'purple' );
      // Ajax it
      $.ajax( _.extend( {}, ajaxOpts,
      {
        success : function( data )
        {
          _data = data;
          $.fn.colorPicker.defaults.colors = _.map( data.defaultColors, 
            function( color) { if( color.charAt( 0 ) === '#' )
              return color.slice( 1 ); } 
          ); // the widget expects colors without #
          updateCalendarList( calendarListEl, data, _settings.clickCallback );
          if ( calendarList.success )
          {
            calendarList.success( data );
          }
          if ( _settings.callback )
          {
            _settings.callback( $, data.view );
          }
        },
        complete : function()
        {
          $this.spin( false );
        }
      } ) );
      return this;
    },
    getCalendars : function ()
    {
      return _data.calendars;
    },
    disableCalendar : function ( calId )
    {
      $("#cal-check_"+escapeCalId(calId)).prop("disabled", true);
    },
    enableCalendar : function ( calId )
    {
      $("#cal-check_"+escapeCalId(calId)).prop("disabled", false);
    },
    checkAll : function ()
    {
      // using prop will not trigger the defined onclick method, otherwise we'd have
      // many hits to the server
      var idsChanged = [];
      $( ".cal-check:not(:checked)" ).each( function( idx, box )
      {
        idsChanged.push( box.value );
        box.checked = true;
      } );
      return idsChanged;
    },
    uncheckAll : function ()
    {
      // using prop will not trigger the defined onclick method
      var idsChanged = [];
      $( ".cal-check:checked" ).each( function( idx, box )
      {
        idsChanged.push( box.value );
        box.checked = false;
      } );
      return idsChanged;
    }
  };
  
  $.fn.calendarlist = function( method )
  {
    if ( methods[ method ] )
    {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    }
    else if ( typeof method === 'object' || !method )
    {
      return methods.init.apply( this, arguments );
    }
    else
    {
      $.error( 'Method ' + method + ' does not exist on jQuery.calendarlist' );
    }
  };


}( jQuery ) );
