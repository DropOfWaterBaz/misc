//
// calendarevent.js: a JQuery plugin to create or edit an event
// Also requires date.js and fullCalendar.js
// Initialize it by passing { defaultCalendarId:<defaultCalendarId>, loadFn:<loadFn>, isoformat : <ISO8601_FORMAT>, dateformat: <dateFormat>, 
//                             datetimeformat: <dateTimeFormat>, fetchAndRenderCalendarFn: <function>  }
//

( function( $ )
{
  var _settings = {};
  var _this;
  var weekDayValue = [ 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA' ];
  
  var methods =
  {
      init : function( options )
      {
        options = options || {};
        var dayNamesMinDefault = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];
        var dayNamesDefault = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
        // These are just fallback defaults. Actual options will be passed to the options based on locale
        var defaults = { dayNamesMin : dayNamesMinDefault, dayNames : dayNamesDefault, firstDay : 0, dateformat : "MM/dd/yyyy", datetimeformat: "MM/dd/yyyy hh:mm a", isoformat : "yyyy-MM-dd'T'HH:mm:ss", calendardiv : "calendar" };
        _settings = _.extend( {}, defaults, options );
        if ( _settings.firstDay > 0 )
        { // rotate the days. widgets expect the starting to be SUN but our LocaleSettins.properties bases it on
          // firstDay
          weekDayValue = [ 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU' ];
          _settings.dayNamesMin = [];
          _settings.dayNames = [];
          var dayPos = _settings.firstDay % 7;
          for ( var cnt = 0; cnt < 7; cnt++ )
          {
            _settings.dayNamesMin[ cnt ] = options.dayNamesMin[ dayPos ];
            _settings.dayNames[ cnt ] = options.dayNames[ dayPos ];
            dayPos = ( dayPos + 1 ) % 7;
          }
        } 
        _this = this;
        bbHijriCalendar.eventDisplayDateTimeFormat = _settings.datetimeformat;
        bbHijriCalendar.eventDisplayDateFormat = _settings.dateformat;
        bbHijriCalendar.eventDisplayDateTimeFormatRTL = "yyyy/MM/dd hh:mm a";
        bbHijriCalendar.eventDisplayDateFormatRTL = "yyyy/MM/dd";
        bbHijriCalendar.isoformat =   _settings.isoformat;
        return this;
      },
      create : function( startdate, view, allDay )
      {
        if ( !_settings.calendars )
        {
          _settings.calendars  = _settings.loadFn();
          if ( !_settings.calendars ) // still none, can't create event
            return;
        }
        return this.each( function()
        {
          var calendars = $.grep( _settings.calendars, function( cal )
                                  {
                                    return cal.canCreate;
                                  } );

          if ( !calendars || calendars.length === 0 ) // can't create event
            return;
          // init event
          view = view || {};
          var event = {};
          event.editable = true;
          if ( !startdate )
          {
            startdate = new Date();
            startdate.setMinutes( startdate.getMinutes() <30 ? 30 :60 );
          }
          event.start = startdate;

          if ( event.start.getHours() === 0 && event.start.getMinutes() === 0 && view.name === 'month' )
          {
            event.start.setHours( 12 );
          }
          event.end = new Date( startdate );
          event.end.setMinutes( event.start.getMinutes() + 30 );
          event.allDay = ( allDay === true && view.name !== 'month' );
          if ( _settings.defaultCalendarId )
            event.calendarId = _settings.defaultCalendarId;
          
          eventRenderer.render( $( this ), calendars, event );
          eventRenderer.renderMultiEvent($( this ), event );
          
          var save = page.bundle.getString('calendar.event.save'), cancel = page.bundle.getString('calendar.event.cancel');
          var buttons = {};
          buttons[ cancel ] =cancelFn;
          buttons[ save ] = createFn;
          
          $( this ).dialog(
          {
              modal : true,
              title : page.bundle.getString('calendar.event.create.heading'),
              open:function() {$('.ui-widget-overlay').css('position', 'fixed');},
              buttons : buttons,
              width : 600
          } );
        } );
      },
      edit : function( event, elementToFocusOnClose )
      {
        return this.each( function()
        {
          var calendars = [{id:event.calendarId, label: event.calendarName}];
          eventRenderer.render( $( this ), calendars, event );
          
          var save = page.bundle.getString( 'calendar.event.save' ), cancel = page.bundle
              .getString( 'calendar.event.cancel' ), deletebut = page.bundle.getString( 'calendar.event.delete' ),
               okbut = page.bundle.getString( 'calendar.event.ok' );
          var buttons = {};
          if ( event.userCreated === false )
          {
            $('#eventallday').hide();
            $('label[for=eventallday]').hide();
            $('#eventend').hide();
            $( "#eventendH" ).hide();
            $('label[for=eventend]').hide(); 
            if ( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale )
            {
              $('#eventstart').hide();
              $( "#eventstartH" ).show();
            } else 
            {
              $('#eventstart').show();
              $( "#eventstartH" ).hide();
            }
            $('label[for=eventstart]').text(page.bundle.getString( 'calendar.event.duedate' ));
            if (event.isUltraEvent === true)
            {
              // TODO: It would be nice if we could redirect to something like
              // "/ultra/courses/_12748_1/outline/edit/assignment/_84070_1?courseId=_12748_1"
              // *BUT* that is specific to assignment and eventually this could be other due things in Ultra, so for now
              // We just "do not have edit/grade options" on Ultra calendar events from inside the classic calendar
            }
            else
            {
              if ( event.editable === true )
              {
                var editlink = '<a href="#" id="editcourseobjectlink">'+ page.bundle.getString('calendar.event.edititem', event.eventType ) +'</a>';              
                $('#eventtitle').after(editlink);
                $('#editcourseobjectlink').on("click",function(){ cancelFn(); window.location = '/webapps/calendar/launch/modify/' + event.id;});
                if ( event.gradable === true )
                {
                  $('#eventtitle').after('<button id="eventgradebutton" >'+ page.bundle.getString('calendar.event.gradeitem') +'</button>');
                  $('#eventgradebutton').button().on("click",function( e ){ e.preventDefault(); cancelFn(); window.location = '/webapps/calendar/launch/grade/' + event.id;});
                }
              }
              else if ( event.attemptable === true )
              {
                var viewlink = '<a href="#" id="gotocourseobjectlink" >'+ page.bundle.getString('calendar.event.gotoitem', event.eventType ) +'</a>';
                $('#eventtitle').after(viewlink);
                var url = '/webapps/calendar/launch/attempt/' + event.id;
                $('#gotocourseobjectlink').on("click",function(){ cancelFn(); window.location = url;});
              }
            }
          } // not user created
          else
          {
            if ( event.deletable === true )
            {
              $( '#morelinks' ).append( '<a href="#">' + deletebut + ' </a>' )
                .on("click", function()
                {
                  _this.dialog( "close" );
                  var delbuts = {};
                  delbuts[ cancel ] = cancelFn;
                  delbuts[ okbut ] = function () { deleteFn (event); };
                  var deleteWarning = null;
                  if ( event.repeat === false )
                  {
                    deleteWarning = page.bundle.getString( 'calendar.event.delete.warning', $ESAPI.encoder().encodeForHTML( event.title ) );
                  }
                  else
                  {
                    deleteWarning = '<input type="radio" id="deleteSingle" name="deleteRepeatedEvent" value="false" checked/>' +
                                    '<label for="deleteSingle">' +
                                    page.bundle.getString( 'calendar.event.delete.single' ) +
                                    '</label> </br> </br> <input type="radio" id="deleteMultiple" name="deleteRepeatedEvent" value="true"/>' +
                                    '<label for="deleteMultiple">' +
                                    page.bundle.getString( 'calendar.event.delete.multiple' ) +
                                    '</label>';
                  }
                  _this.empty().append(
                                        '<div class="event-detail"> <div class="event-details"><div id="create-new-event-message" class="ui-state-error" style="display:none" role="alert"/>' +
                                        deleteWarning +
                                        '</div></div>' );
                  _this.dialog(
                  {
                                    modal : true,
                                    title : page.bundle.getString( 'calendar.event.delete.heading' ),
                                    buttons : delbuts,
                                    width : 600
                    } );
                } ); // end click
            } // end if deletable
          }

          buttons[ cancel ] = cancelFn;
          if ( event.editable === true )
            buttons[ save ] = function() { elementToFocusOnClose = null; editFn (event); };

          _this.dialog(
          {
              modal : true,
              title : ( event.editable === true ) ? page.bundle.getString( 'calendar.event.edit.heading' ) : page.bundle.getString( 'calendar.event.view.heading' )  ,
              buttons : buttons,
              width : 600,
              close : function () { if ( elementToFocusOnClose ) elementToFocusOnClose.focus(); }
          } );
        } );

      }
  };

  $.fn.calendarevent = function( method )
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
      $.error( 'Method ' + method + ' does not exist on jQuery.calendarevent' );
    }
  };
  
  var deleteFn = function( event )
  {
    _this.spin( false );
    var url = "/webapps/calendar/calendarData/event/" + event.id;
    var deleteRecur = false;
    if ( event.repeat === true && $('#deleteMultiple').prop('checked')=== true ){
      url = "/webapps/calendar/calendarData/recur/" + event.repeatRuleId;
      deleteRecur = true;
    }
    $.ajax(
    {
        url : url,
        type : 'DELETE',
        statusCode :
        {
          200 : function()
          {
            _this.dialog( "close" );
            if ( deleteRecur === false ) {
              $('#'+_settings.calendardiv).fullCalendar( 'removeEvents', event.id );
            }
            else {
              // if recur, remove all events of the series from UI
              _.each( 
                     $j( '#'+_settings.calendardiv ).fullCalendar( 'clientEvents' , function ( clientEvent ) { return (clientEvent.repeatRuleId === event.repeatRuleId ); } ),
                     function ( fcevent ){                       
                       $j('#'+_settings.calendardiv).fullCalendar( 'removeEvents', fcevent.id );
                     } 
                   );
            }
          }
        },
        error : function( jqXHR )
        {
          var msg = ( jqXHR.responseText ) ? jqXHR.responseText  : page.bundle.getString( 'ajax.error' );
          $( '#create-new-event-message' ).empty().append( msg ).show();
        },
        complete : function()
        {
          _this.spin( false );
        }
    } );
  };// end deleteFn
  
  var cancelFn = function()
  {
    _this.dialog( "close" );
  };
  
  var editFn = function( event )
  {
    _this.spin( false );
    if ( $( '#eventtitle' ).val() === $( '#eventtitle' ).attr('title') )
    {
      var msg = page.bundle.getString( 'calendar.validation.requiredField.eventName' );
      $( '#create-new-event-message' ).empty().append( msg ).show();
      return;
    }
    var start = getISOFormattedDateFromInput( $( '#eventstart' ).val() );
    var end = getISOFormattedDateFromInput( $( '#eventend' ).val() );

    $.ajax(
    {
        url : "/webapps/calendar/calendarData/event/" + event.id,
        type : 'PUT',
        data : JSON.stringify(
        {
            title : $( '#eventtitle' ).val(),
            description : $( '#eventdesc' ).val(),
            start : start,
            end : end,
            allDay : $( '#eventallday' ).prop( 'checked' ) === true
        } ),
        contentType : "application/json;charset=utf-8",
        dataType : "json",
        processData : false,
        statusCode :
        {
          200 : function()
          {
            _this.dialog( "close" );
            event.title = $( '#eventtitle' ).val();
            event.description = $( '#eventdesc' ).val();
            event.start = start;
            event.end = end;
            event.allDay = $( '#eventallday' ).prop( 'checked' ) === true;

            $('#'+_settings.calendardiv).fullCalendar('updateEvent', event);
            if ( event.allDay === true || event.repeat === true )
            {
              $('#'+_settings.calendardiv).fullCalendar('removeEvents', event.id);
              fetchAndRenderEvent( event.id );
            }
          }
        },
        error : function( jqXHR )
        {
          var msg = ( jqXHR.responseText ) ?  jqXHR.responseText  : page.bundle.getString( 'ajax.error' );
          $( '#create-new-event-message' ).empty().append( msg ).show();
        },
        complete : function()
        {
          _this.spin( false );
        }
    } );
  };
  
  var createFn = function()
  {
    _this.spin( false );
    if ( $( '#eventtitle' ).val() === $( '#eventtitle' ).attr('title') )
    {
      var msg = page.bundle.getString( 'calendar.validation.requiredField.eventName' );
      $( '#create-new-event-message' ).empty().append( msg ).show();
      return;
    }    
    var freq = $( '#FREQ' ).val();    
    var byDay = [];
    if ( freq === 'WEEKLY' )
    {
      $("input[name='BYWEEKLYDAY']:checked").each(function ()
      {
        byDay.push($(this).val());
      });
    } else if ( freq === 'MONTHLY' ) {
      byDay = $('#BYMONTHLYDAY').val();
    }  
    //check if INTERVAL is int, else set INTERVAL = -1,
    //what causes the calendar.validation.warning.invalidIntervalValue warning message
    var interval = $( '#INTERVAL' ).val();
    if ( parseInt( interval , 10 ) != interval || interval > 2147483647 )
    {
      interval = "-1";
    }
    //check if COUNT is int, else set COUNT = -1,
    //what causes the calendar.validation.warning.invalidNoOfOccurValue warning message
    var count = $( '#COUNT' ).val();
    if ( parseInt( count , 10 ) != count || count > 2147483647 )
    {
      count = "-1";
    }
    var recur = $( '#RECUR' ).prop('checked')=== true;
    $.ajax(
    {
        url : "/webapps/calendar/calendarData/event",
        type : 'POST',
        data : JSON.stringify(
        {
            calendarId : $( '#eventtype' ).val(),
            title : $( '#eventtitle' ).val(),
            description : $( '#eventdesc' ).val(),
            start : getISOFormattedDateFromInput( $( '#eventstart' ).val() ),
            end : getISOFormattedDateFromInput( $( '#eventend' ).val() ),
            allDay : $( '#eventallday').prop('checked')===true,
            recur : recur,
            freq : freq,
            interval : interval,
            byDay : byDay,
            monthRepeatBy : $("input:radio[name='repeatBy']:checked").val(),
            byMonthDay : $( '#BYMONTHDAY' ).val(),
            bySetPos : $( '#BYSETPOS' ).val(),
            endsBy: $("input:radio[name='ends']:checked").val(),
            count : count,
            untilDate :  getISOFormattedDateFromInput( $( '#UNTILDATE' ).val() )
            
        } ),
        contentType : "application/json;charset=utf-8",
        dataType : "json",
        processData : false,
        statusCode: { 201 :  function( jqXHR )
        {
          _this.dialog( "close" );
          if ( recur === true ){
            if ( _settings.fetchAndRenderCalendarFn  )
              _settings.fetchAndRenderCalendarFn( $( '#eventtype' ).val() );
            else 
              $( '#'+_settings.calendardiv ).fullCalendar( 'refetchEvents', event );
          } else {
            // eventId is returned by the rest controller
            fetchAndRenderEvent( jqXHR.responseText );
          }
        } },
        error : function( jqXHR )
        {
          var msg = ( jqXHR.responseText ) ?  jqXHR.responseText : page.bundle.getString( 'ajax.error' );
          $( '#create-new-event-message' ).empty().append( msg ).show();
        },
        complete : function()
        {
          _this.spin( false );
        }
    } );
  };


  var fetchAndRenderEvent = function( eventid )
  {
    $.ajax(
    {
        url : "/webapps/calendar/calendarData/event/" + eventid,
        type : 'GET',
        statusCode :
        {
          200 : function( event, textStatus, jqXHR )
          {
            $( '#'+_settings.calendardiv ).fullCalendar( 'renderEvent', event );
          }
        },
        error : function( jqXHR )
        {
          var msg = ( jqXHR.responseText ) ? jqXHR.responseText : page.bundle.getString( 'ajax.error' );
          alert( msg );
        }
    } );
  };


  var eventRenderer =
  {
    render : function( elem, calendars, event )
    {
      // render div
      $(
         '<div class="event-detail"><div id="create-new-event-message" class="ui-state-error" style="display:none" role="alert"/>' + '<form name="event-specs">' +
             '<div class="event-heading">' + '<input type="text" id="eventtitle" class="clearMeFocus" title="' +
             page.bundle.getString('calendar.event.create.title')+
             '"value="'+
             page.bundle.getString( 'calendar.event.create.title')+
             '" x-webkit-speech/>'+
             '</div>'+
             '<div class="date-time-entry">'+
             '   <fieldset>'+
             '      <div class="form-layer clearfix">'+
             '         <div class="form-slot">'+
             '            <label for="eventtype">' +
             page.bundle.getString( 'calendar.event.create.selectcalendar' ) +
             '            </label>' +
             '         </div>' +
             '         <div class="form-slot">' +
             '            <select name="eventtype" id="eventtype"></select>' +
             '         </div>' +
             '      </div>' +
             '      <div class="form-layer clearfix">' +
             '         <div class="form-slot">' +
             '            <label for="eventstart" >' +
             page.bundle.getString( 'calendar.event.create.start' ) +
             '            </label>' +
             '         </div>' +
             '         <div class="form-slot">' +
             '            <input type="datetime" id="eventstart" aria-describedby="dateTimeFormat" />' +
             '            <input type="datetime" id="eventstartH" data-gid="eventstart" aria-describedby="dateTimeFormat" />' +
             '         </div>' +
             '         <div class="form-slot">' +
             '            <label for="eventend" >' +
             page.bundle.getString( 'calendar.event.create.end' ) +
             '            </label> <input type="datetime" id="eventend" aria-describedby="dateTimeFormat" />' +
             '             <input type="datetime" id="eventendH" data-gid="eventend" aria-describedby="dateTimeFormat" />' +
             '         </div>' +
             '         <span class="hideoff" id="dateTimeFormat">'+ page.bundle.getString( 'calendar.event.create.time.format', formatDate( new Date(), _settings.datetimeformat ) ) + '</span>'+          
             '      </div>' +
             '      <div class="form-layer clearfix">' +
             '         <div class="form-slot"></div>' +
             '         <div class="form-slot">' +
             '            <input type="checkbox" id="eventallday" value="true"/> <label for="eventallday" >' +
             page.bundle.getString( 'calendar.event.create.allday' ) +
             '            </label>' +
             '         </div>' +
             '         <div id="multiEventCheckbox"></div>' +
             '      </div>' +
             '      <div id="multiEventFields"></div>' +
             '   </fieldset>' +
             '</div>' +
             '<div class="event-details">' +
             '   <label for="eventdesc">' +
             page.bundle.getString( 'calendar.event.create.description' ) +
             '   </label><br />' +
             '   <textarea id="eventdesc" name="eventdesc" cols="60" rows="5"></textarea>' +
             '<br \/>' +
             '<div id="morelinks"/>' + '</form>' + '</div>' + '</div>' ).appendTo( elem.empty() );
      
      //Hide the Gregorian Date if Hijri is enabled. 
        if ( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale )
        {
          $( "#eventstart" ).hide();
          $( "#eventstartH" ).show();
          $( "#eventend" ).hide();
          $( "#eventendH" ).show();
        }
        else
        {
          $( "#eventstart" ).show();
          $( "#eventstartH" ).hide();
          $( "#eventend" ).show();
          $( "#eventendH" ).hide();
        }
      
      if ( calendars )
      {
        _.each( calendars, function( cal )
        {
          $( "#eventtype" ).append( '<option value="' + cal.id + '">' + cal.label + '</option>' );
        } );
        if ( calendars.length <= 1 )
        {
          $( "#eventtype" ).prop( "disabled", true );
        }
      }
      if ( event.calendarId && $("#eventtype option[value='" + event.calendarId +"']").length > 0 )
      {
        $( "#eventtype" ).val( event.calendarId );
      }
      $( '#eventtitle' ).on("focus", function()
      {
        var el = $( this );
        if ( el.val() === el.attr( 'title' ) )
          el.val( '' );
      } ).on("blur", function()
      {
        var el = $( this );
        if ( el.val() === '' )
          el.val( el.attr( 'title' ) );
      } );
      $('#eventtitle').on('webkitspeechchange', function() {
          var el = $( this );
          var titleval = el.val();
          var titleattr = el.attr( 'title' );
          var index = titleval.indexOf(titleattr);
          if(index === 0 )
            el.val( titleval.substring ( titleattr.length ) );
        });
      if ( event.allDay === true )
        elem.find( 'input[type=datetime]' ).datepicker();
      else
        elem.find( 'input[type=datetime]' ).datetimepicker();
      
      if ( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale )
      {
        //Add change events to Hijri date for converting the Gregorian to Hijri Dates
        $("#eventstartH").on("change", bbHijriCalendar.hijriDateForEvents ) ;
        $("#eventendH").on("change", bbHijriCalendar.hijriDateForEvents ) ;
      }
      
      $( '#eventallday' ).on("click", function()
      {
        var checked = $( this ).prop( 'checked' );
        if ( checked )
        {
          elem.find( 'input[type=datetime]' ).datetimepicker( 'destroy' ).datepicker();
          eventRenderer.setDateValue( false );
        }
        else
        {
          elem.find( 'input[type=datetime]' ).datepicker( 'destroy' ).datetimepicker();
          eventRenderer.setDateValue( true );
        }
      } );
      
      // now set values
      if ( event.title )
        $( '#eventtitle' ).val( event.title);
      if ( event.description )
        $( '#eventdesc' ).val( event.description);
      eventRenderer.setDateValue( event.allDay !== true, event.originalStartDate === undefined ? event.start : new Date(event.originalStartDate) , event.end );
      if ( event.allDay === true )
        $( '#eventallday' ).prop( 'checked', true );
      
      // if the event is not editable to the user then convert the elements into read-only
      if ( event.editable !== true )
      {
        elem.find('input').prop('disabled', true);
        elem.find('input[type=datetime],input[type=text]').each(function() {
          if ( ( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale ) && this.id.endsWith( "H" ) )
          {
            $( this ).replaceWith( "<span id='" + this.id + "'>" + $ESAPI.encoder().encodeForHTML( this.value ) + "</span>" );
          }
          else if ( !( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale ) && !this.id.endsWith( "H" ) )
          {
            $( this ).replaceWith( "<span id='" + this.id + "'>" + $ESAPI.encoder().encodeForHTML( this.value ) + "</span>" );
          }
        });
        // treat the text area (description) separately since we don't want to push it through ESAPI 
        elem.find('textarea').each(function() {
          $(this).replaceWith("<span id='"+this.id+"'>" + this.value + "</span>");
        });
        elem.find('select').each(function() {
          $(this).replaceWith("<span id='"+this.id+"'>" + $(this).find("option:selected").text() + "</span>");
          }); 
      }
      
      // make the text area (description) read-only if this is a dynamic event (no ESAPI)
      if ( event.userCreated === false )
      {
        elem.find('textarea').each(function() {
          $(this).replaceWith("<span id='"+this.id+"'>" + this.value + "</span>");
        });
      }
    },
    setDateValue : function( hasTimePortion, startdate, enddate )
    {
      try
      {  
        // use date.js as that is still the best for formatting/parsing date
        var oldformat = hasTimePortion ? _settings.dateformat : _settings.datetimeformat;
        if ( !startdate )
        {
          startdate = new Date( getDateFromFormat( $( '#eventstart' ).val(), oldformat ) );
          if ( hasTimePortion )
          {
            startdate.setMinutes( startdate.getMinutes() <30 ? 30 :60 );
            enddate = new Date( startdate );
            enddate.setMinutes( startdate.getMinutes() + 30 );
          }
        }
        if ( !enddate )
        {
          enddate =  new Date( getDateFromFormat( $( '#eventend' ).val(), oldformat ) );
        }
        var format = hasTimePortion ? _settings.datetimeformat : _settings.dateformat;
        var f1 = format;
        if ( bbCalendar.isRTL )
        {
          f1 = hasTimePortion ? bbHijriCalendar.eventDisplayDateTimeFormatRTL
              : bbHijriCalendar.eventDisplayDateFormatRTL;
        }
        
        if ( bbHijriCalendar.hijriDisplay )
        {
          $( '#eventstartH' ).val( bbHijriCalendar.formatToIslamicDate( f1, startdate ) );
          $( '#eventendH' ).val( bbHijriCalendar.formatToIslamicDate( f1, enddate ) );
        } else 
        {
          if ( $( '#eventstartH' ) )
          {
            $( '#eventstartH' ).val( bbHijriCalendar.convertNumbers( formatDate( startdate, f1 ) ) );
            $( '#eventendH' ).val( bbHijriCalendar.convertNumbers( formatDate( enddate, f1 ) )  );
          }
        }
        $( '#eventstart' ).val( formatDate( startdate, format ) );
        $( '#eventend' ).val( formatDate( enddate, format ) );
      } catch ( e ){
        if ( console && console.log )
          console.log ( e );
        // date parse exception. can't set the dates
      }
    },
    renderMultiEvent : function(elem, event)
    {
      $("#multiEventCheckbox").empty().append(
                                               '         <div class="form-slot">' +
                                               '            <input type="checkbox" id="RECUR" value="true"/><label for="RECUR" class="recur-select">' +
                                               page.bundle.getString( 'calendar.event.create.multiple' ) +
                                               '            </label>' +
                                               '         </div>'                                     
                                             );
      $("#multiEventFields").empty().append(
                                         '      <div class="recur-fields">' +
                                         '        <div class="form-layer clearfix">' +
                                         '          <div class="form-slot">' +
                                         '              <label for="FREQ" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.frequency' ) +
                                         '              </label>' +
                                         '          </div>' +
                                         '          <div class="form-slot">' +
                                         '            <select name="FREQ" id="FREQ">' +
                                         '              <option value="DAILY">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.frequency.daily' ) +
                                         '              </option>' +                   
                                         '              <option value="WEEKLY">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.frequency.weekly' ) +
                                         '              </option>' + 
                                         '              <option value="MONTHLY">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.frequency.monthly' ) +
                                         '              </option>' +
                                         '            </select>' +
                                         '          </div>' +
                                         '        </div>' +
                                         '        <div class="form-layer clearfix">' +
                                         '          <div class="form-slot">' +
                                         '              <label for="INTERVAL" id="interval_label" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.selectInterval' ) +
                                         '              </label>' +
                                         '          </div>' +
                                         '          <div class="form-slot">' +
                                         '            <input  value="1" id="INTERVAL" size="3" aria-labelledby="interval_label INTERVAL interval_unit" />' + 
                                         '            <span id="interval_unit">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.frequency.unitWeeks' ) +
                                         '             </span>' +
                                         '          </div>' +
                                         '        </div>' +
                                         '        <div id="monthOptions" style="display:none">' +
                                         '          <div class="form-layer clearfix">' +
                                         '            <div class="form-slot">' +
                                         '              <label for="repeatBy">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy' ) +
                                         '              </label>' +
                                         '            </div>' +
                                         '            <div class="form-slot">' +
                                         '              <input type="radio" name="repeatBy" value="BYMONTHDAY"/>' +
                                         '              <label for="dayOfMonth">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfMonth' ) +
                                         '              </label>' +
                                         '              <input type="radio" name="repeatBy" value="BYSETPOS"/>' +
                                         '              <label for="dayOfWeek">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek' ) +
                                         '              </label>' +
                                         '            </div>' +
                                         '          </div>' +
                                         '          <div id="addDay">' +
                                         '            <div class="form-layer clearfix">' +
                                         '              <div class="form-slot"></div>' +
                                         '              <div class="form-slot u_indent"><label for="BYMONTHDAY">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfMonth.onDay' ) +
                                         '               </label> <input  value="1" id="BYMONTHDAY" size="3"/>' +
                                         '              </div>' +
                                         '            </div>' +
                                         '          </div>' +
                                         '          <div id="selectDay" style="display:none">' +
                                         '            <div class="form-layer clearfix">' +
                                         '              <div class="form-slot"></div>' +
                                         '              <div class="form-slot">' +
                                         '                <label for="OnDayOfWeek" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek.on' ) +
                                         '                </label>' +
                                         '                <select name="BYSETPOS" id="BYSETPOS">' +
                                         '                  <option value="1">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek.first' ) +
                                         '                  </option>' +                   
                                         '                  <option value="2">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek.second' ) +
                                         '                  </option>' + 
                                         '                  <option value="3">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek.third' ) +
                                         '                  </option>' +
                                         '                  <option value="4">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek.fourth' ) +
                                         '                  </option>' + 
                                         '                  <option value="-1">' +
                                         page.bundle.getString( 'calendar.event.create.multiple.repeatBy.dayOfWeek.last' ) +
                                         '                  </option>' +
                                         '                </select>' +
                                         '                <select name="BYMONTHLYDAY" id="BYMONTHLYDAY">' +
                                         '                  <option value="' + weekDayValue[0] + '">' +
                                                               _settings.dayNames[0] +
                                         '                  </option>' +                   
                                         '                  <option value="' + weekDayValue[1] + '">' +
                                                               _settings.dayNames[1] +
                                         '                  </option>' + 
                                         '                  <option value="' + weekDayValue[2] + '">' +
                                                               _settings.dayNames[2] +
                                         '                  </option>' +
                                         '                  <option value="' + weekDayValue[3] + '">' +
                                                               _settings.dayNames[3] +
                                         '                  </option>' + 
                                         '                  <option value="' + weekDayValue[4] + '">' +
                                                               _settings.dayNames[4] +
                                         '                  </option>' +
                                         '                  <option value="' + weekDayValue[5] + '">' +
                                                               _settings.dayNames[5] +
                                         '                  </option>' + 
                                         '                  <option value="' + weekDayValue[6] + '">' +
                                                               _settings.dayNames[6] +
                                         '                  </option>' +
                                         '                </select>' +
                                         '              </div>' +
                                         '            </div>' +
                                         '          </div>' +
                                         '        </div>' +
                                         '        <div id="weekDays" style="display:none">' +
                                         '        <div class="form-layer clearfix">' +
                                         '          <div class="form-slot">' +
                                         '              <label for="BYWEEKLYDAY" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.days' ) +
                                         '              </label>' +
                                         '          </div>' +
                                         '          <div class="form-slot recur-days">' +
                                         '              <input type="checkbox" id="' + weekDayValue[0] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[0] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[0] + '_chk" >' +
                                                            _settings.dayNamesMin[0] +
                                         '              </label>' +
                                         '              <input type="checkbox" id="' + weekDayValue[1] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[1] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[1] + '_chk" >' +
                                                            _settings.dayNamesMin[1] +
                                         '              </label>' +
                                         '              <input type="checkbox" id="' + weekDayValue[2] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[2] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[2] + '_chk" >' +
                                                            _settings.dayNamesMin[2] +
                                         '              </label>' +
                                         '              <input type="checkbox" id="' + weekDayValue[3] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[3] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[3] + '_chk" >' +
                                                            _settings.dayNamesMin[3] +
                                         '              </label>' +
                                         '              <input type="checkbox" id="' + weekDayValue[4] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[4] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[4] + '_chk" >' +
                                                            _settings.dayNamesMin[4] +
                                         '              </label>' +
                                         '              <input type="checkbox" id="' + weekDayValue[5] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[5] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[5] + '_chk" >' +
                                                            _settings.dayNamesMin[5] +
                                         '              </label>' +
                                         '              <input type="checkbox" id="' + weekDayValue[6] + '_chk" name="BYWEEKLYDAY" value="' + weekDayValue[6] + '" class="hideoff"/>' +
                                         '              <label for="' + weekDayValue[6] + '_chk" >' +
                                                            _settings.dayNamesMin[6] +
                                         '              </label>' +
                                         '          </div>' +
                                         '        </div> ' +
                                         '      </div> ' +                                         
                                         '        <div class="form-layer clearfix">' +
                                         '          <div class="form-slot">' +
                                         '              <label for="ends" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.endsOn' ) +
                                         '              </label>' +
                                         '          </div>' +
                                         '          <div class="form-slot">' +
                                         '            <input type="radio" name="ends" value="COUNT" id="endsAfter" />' +
                                         '            <label for="endsAfter" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.endsOn.occurrences' ) +
                                         '            </label>' +
                                         '            <input value="10" id="COUNT" size="3" />' +
                                         '          </div>' +
                                         '        </div>' +
                                         '        <div class="form-layer clearfix">' +
                                         '          <div class="form-slot"></div>' +
                                         '          <div class="form-slot">' +
                                         '            <input type="radio" name="ends" value="UNTILDATE" id="endsOnOn"/>' +
                                         '            <label for="endsOnOn" >' +
                                         page.bundle.getString( 'calendar.event.create.multiple.endsOn.on' ) + 
                                         '            </label>' +
                                         '            <input type="datetime" id="UNTILDATE" />' +
                                         '            <input type="datetime" id="UNTILDATEH" data-gid="UNTILDATE" />' +
                                         '          </div>' +
                                         '        </div>' +
                                         '      </div>'
                                         );
        $( '#RECUR' ).on("click", function()
        {
          var checked = $( this ).prop( 'checked' );
          if ( checked === true )
          {
            $( '#multiEventFields' ).show();
            $( "input[name='BYWEEKLYDAY']" ).each( function()
            {
              if ( $( this ).prop( "checked" ) )
              {
                $( this ).next().addClass( 'recur-days-checked' );
              }
            } );
            
            if ( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale )
            {
              $( "#UNTILDATE" ).hide();
              $( "#UNTILDATEH" ).show();
            }
            else
            {
              $( "#UNTILDATE" ).show();
              $( "#UNTILDATEH" ).hide();
            }
          }
          else
          {
            $( '#multiEventFields' ).hide();
          }
        } );
      $( '#multiEventFields' ).hide();
      $('#FREQ').on("change", function(){
       if( $(this).val() === "WEEKLY" ) 
         {
           switch( event.start.getDay() )
           {
             case 0:
               $("input[name='BYWEEKLYDAY'][value='SU']").prop("checked",true);
               break;
             case 1:
               $("input[name='BYWEEKLYDAY'][value='MO']").prop("checked",true);
               break;
             case 2:
               $("input[name='BYWEEKLYDAY'][value='TU']").prop("checked",true);
               break;
             case 3:
               $("input[name='BYWEEKLYDAY'][value='WE']").prop("checked",true);
               break;
             case 4:
               $("input[name='BYWEEKLYDAY'][value='TH']").prop("checked",true);
               break;
             case 5:
               $("input[name='BYWEEKLYDAY'][value='FR']").prop("checked",true);
               break;
             case 6:
               $("input[name='BYWEEKLYDAY'][value='SA']").prop("checked",true);
               break;
               
           }
           $("#weekDays").show();
           $( '#interval_unit' ).text( page.bundle.getString( 'calendar.event.create.multiple.frequency.unitWeeks' ) );
         }
       else
         {
           $("#weekDays").hide();
         }
       
       if( $(this).val() === "MONTHLY" )
         {
           $("#monthOptions").show();
           $( '#interval_unit' ).text( page.bundle.getString( 'calendar.event.create.multiple.frequency.unitMonths' ) );
         }
       else
         {
           $("#monthOptions").hide();
         }
       if( $(this).val() === "DAILY" )
         {
           $( '#interval_unit' ).text( page.bundle.getString( 'calendar.event.create.multiple.frequency.unitDays' ) );
         }
      });
      
      $("input[name='BYWEEKLYDAY']").on("change", function()
      {
         $(this).next().toggleClass('recur-days-checked');
      });
      
      $("input:radio[name='repeatBy']").on("change", function(){
        if($("input:radio[name='repeatBy']:checked").val() == "BYMONTHDAY")
          {
            $("#addDay").show();
            $("#selectDay").hide();
          }
        else
          {
          $("#addDay").hide();
          $("#selectDay").show();
          }
      });
      $("input:radio[name='ends']").on("change", function(){
        if($("input:radio[name='ends']:checked").val() === "COUNT")
          {
            $("#COUNT").prop('disabled', true);
            $("#UNTILDATE").prop('disabled', true);
            $("#UNTILDATEH").prop('disabled', true);
          }
        else
          {
          $("#UNTILDATE").prop('disabled', false);
          $("#UNTILDATEH").prop('disabled', false);
          $("#COUNT").prop('disabled', true);
          }
      });
      
      $("input:radio[name='repeatBy']")[0].checked = true;
      $("input:radio[name='ends']")[0].checked = true;
      var date = new Date();
      date.setMonth( date.getMonth() + 2 );
      $("#UNTILDATE").prop('disabled', true).val( formatDate( date, _settings.dateformat) );
      if ( bbHijriCalendar.hijriDisplay || bbHijriCalendar.numbersLocale )
      {
        //Add change events to Hijri date for converting the Gregorian to Hijri Dates
        $("#UNTILDATEH").on("change", bbHijriCalendar.hijriDateForEvents ) ;
        var f1 =_settings.dateformat;
        if ( bbCalendar.isRTL )
        {
          f1 = bbHijriCalendar.eventDisplayDateFormatRTL;
        }
        if (  bbHijriCalendar.hijriDisplay )
          $("#UNTILDATEH").prop('disabled', true).val( bbHijriCalendar.formatToIslamicDate( f1, date) );
        else
          $("#UNTILDATEH").prop('disabled', true).val( bbHijriCalendar.convertNumbers( formatDate( date, f1 ) )  );
      }      
      $( "#COUNT, #INTERVAL" ).spinner(
      {
          min : 1,
          max : 100
      } );
      $( "#BYMONTHDAY" ).spinner(
      {
          min : 1,
          max : 31
      } );
      elem.find( 'input[type=datetime]' ).datepicker();
      $('#FREQ').val('WEEKLY').trigger("change");
    }

  };
  
  var getISOFormattedDateFromInput = function( datestr )
  {
    var time = getDateFromFormat( datestr , _settings.datetimeformat);
    if ( time === 0 ) // no time format, try with date format
      time = getDateFromFormat ( datestr, _settings.dateformat );
    if ( time === 0 ) // no luck. no more parsing
      return datestr;
    var date = new Date( time );    
    date.setSeconds( 0 );
    return $.fullCalendar.formatDate( date, _settings.isoformat );    
  };
  
}( jQuery ) );
