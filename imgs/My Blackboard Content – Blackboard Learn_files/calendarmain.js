var $j = jQuery.noConflict();
var bbCalendar = bbCalendar|| {};

bbCalendar.MODES = { COURSE: "course", INSTITUTION : "institution", PERSONAL : "personal" };
bbCalendar.mode = bbCalendar.MODES.PERSONAL;
bbCalendar.courseId = "";  // must be set to external string of current course id if mode is MODES.COURSE 
// cache the values of start and end when fullcalendar fetches events
bbCalendar.range = { start: undefined , end: undefined };
bbCalendar.defaultCalendarId= "PERSONAL"; // defaulted in calendar.jspf
bbCalendar.viewType = 'today'; //Default View 

bbCalendar.nonceVal = bbCalendar.nonceVal || '';

// "constants"
bbCalendar.ISO8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
bbCalendar.ONEDAY_TIME  = 1000 * 60 * 60 * 24;

bbCalendar.localize = function()
{
  // localize
  bbCalendar.monthNames = LOCALE_SETTINGS['LOCALE_SETTINGS.MONTH_FULL.02100'].split(/\s+/g); 
  bbCalendar.monthNamesShort = LOCALE_SETTINGS['LOCALE_SETTINGS.MONTH_SHORT.00520'].split(/\s+/g);
  var dayNames = LOCALE_SETTINGS['LOCALE_SETTINGS.DAY_FULL.02098'].split(/\s+/g);
  var dayNamesShort = LOCALE_SETTINGS['LOCALE_SETTINGS.DAY_SHORT.02097'].split(/\s+/g);
  var dayNamesMin = [];
  
  // dayNamesMin is undefined in locale Settings for SP12
  if ( LOCALE_SETTINGS[ 'LOCALE_SETTINGS.DAY_MIN.02099' ] !== undefined )
  {
    dayNamesMin = LOCALE_SETTINGS[ 'LOCALE_SETTINGS.DAY_MIN.02099' ].split( /\s+/g );
  }
  else
  {
    dayNamesMin[ 0 ] = page.bundle.getString( 'calendar.event.create.multiple.days.sun' );
    dayNamesMin[ 1 ] = page.bundle.getString( 'calendar.event.create.multiple.days.mon' );
    dayNamesMin[ 2 ] = page.bundle.getString( 'calendar.event.create.multiple.days.tue' );
    dayNamesMin[ 3 ] = page.bundle.getString( 'calendar.event.create.multiple.days.wed' );
    dayNamesMin[ 4 ] = page.bundle.getString( 'calendar.event.create.multiple.days.thu' );
    dayNamesMin[ 5 ] = page.bundle.getString( 'calendar.event.create.multiple.days.fri' );
    dayNamesMin[ 6 ] = page.bundle.getString( 'calendar.event.create.multiple.days.sat' );
    bbCalendar.dayNamesMin = dayNamesMin;
  }
  
  bbCalendar.firstDay = bbCalendar.firstDayPassed;
  if ( isNaN( bbCalendar.firstDay ) )
    bbCalendar.firstDay = 0;

  //Reading the default first day of the week 
  var firstDay = LOCALE_SETTINGS['LOCALE_SETTINGS.FIRST_DAY_OF_WEEK.03207'];
  if ( isNaN( firstDay ) )
    firstDay = 0;
  if ( firstDay > 0 && dayNamesMin.length > 0 ) { // rotate the days. widgets expect the starting to be SUN but our LocaleSettins.properties bases it on firstDay
    bbCalendar.dayNames = []; bbCalendar.dayNamesShort = [];
    bbCalendar.dayNamesMin = [];
    var dayPos = firstDay%7;
    for (var cnt = 0; cnt < 7; cnt++ ){
      bbCalendar.dayNames[dayPos] = dayNames[cnt];
      bbCalendar.dayNamesShort[dayPos] = dayNamesShort[cnt];
      bbCalendar.dayNamesMin[ dayPos ] = dayNamesMin[ cnt ];
      dayPos = (dayPos+1)%7;
    }
  } else {
    bbCalendar.dayNames = dayNames;
    bbCalendar.dayNamesShort = dayNamesShort;
    bbCalendar.dayNamesMin = dayNamesMin;
  }

  bbCalendar.dateFormat = "MM/dd/yyyy"; // for date.js parser
  bbCalendar.timeFormat = "hh:mm a"; // for date.js parser
  bbCalendar.is24 = false;
  bbCalendar.fcOptions = {}; // full calendar options
  
  // Grab the Full Calendar formatting strings
  bbCalendar.daySuffix = LOCALE_SETTINGS['LOCALE_SETTINGS.DAY_CHARACTER.03253'];
  bbCalendar.monthSuffix = LOCALE_SETTINGS['LOCALE_SETTINGS.MONTH_CHARACTER.03254'];
  bbCalendar.yearSuffix = LOCALE_SETTINGS['LOCALE_SETTINGS.YEAR_CHARACTER.03255'];
  bbCalendar.columnFormatMonth = LOCALE_SETTINGS['LOCALE_SETTINGS.CALENDAR_COLUMN_FORMAT_MONTH.03255'];
  bbCalendar.columnFormatWeek = LOCALE_SETTINGS['LOCALE_SETTINGS.CALENDAR_COLUMN_FORMAT_WEEK.03256'];
  bbCalendar.columnFormatDay = LOCALE_SETTINGS['LOCALE_SETTINGS.CALENDAR_COLUMN_FORMAT_DAY.03257'];
  bbCalendar.titleFormatMonth = LOCALE_SETTINGS['LOCALE_SETTINGS.CALENDAR_TITLE_FORMAT_MONTH.03259'];
  bbCalendar.titleFormatWeek = LOCALE_SETTINGS['LOCALE_SETTINGS.CALENDAR_TITLE_FORMAT_WEEK.03260'];
  bbCalendar.titleFormatDay = LOCALE_SETTINGS['LOCALE_SETTINGS.CALENDAR_TITLE_FORMAT_DAY.03258'];
  
  var dateOrder = LOCALE_SETTINGS['LOCALE_SETTINGS.DATE_ORDER.00519']; // e.g. MDY
  var dateOrderArray_dateBeforeMonth = ["DMY","DYM","YDM"];
  var dateOrderArray_yearBeforeMonth = ["YMD", "YDM", "DYM"];
  var formatDateBeforeMonth = $j.inArray( dateOrder, dateOrderArray_dateBeforeMonth ) > -1;
  var formatYearBeforeMonth = $j.inArray( dateOrder, dateOrderArray_yearBeforeMonth ) > -1; // should be false, if formatDateBeforeMonth is true
  var columnFormats = { month:'',week:'',day:'' };
  var titleFormats = { month:'',week:'',day:'' };
  
  // Set Full Calendar DEFAULT formats
  // TODO:  These defaults (and all related defaults-code) can be removed once
  // LOCAL_SETTINGS has values for column and title formats (WeLocalize job)
  columnFormats.month = 'ddd';
  columnFormats.week = formatDateBeforeMonth ? 'ddd d/M' : 'ddd M/d';
  columnFormats.day = formatDateBeforeMonth ? 'dddd d/M' : 'dddd M/d';
  titleFormats.month = formatYearBeforeMonth ? "yyyy MMMM": "MMMM yyyy";
  titleFormats.week = formatYearBeforeMonth ? "yyyy MMM d{ '&#8212;'[ yyyy][ MMM] d}" : (formatDateBeforeMonth? "d [ MMM][ yyyy]{ '&#8212;'d MMM yyyy}" : "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}") ;
  titleFormats.day = formatYearBeforeMonth ? "yyyy, MMM d, dddd" : (formatDateBeforeMonth ? "dddd, d MMM, yyyy" : "dddd, MMM d, yyyy") ;
  
  // Override Defaults with any formats that have been set in LOCALE_SETTINGS
  columnFormats.month = bbCalendar.columnFormatMonth ? bbCalendar.columnFormatMonth : columnFormats.month;
  columnFormats.week = bbCalendar.columnFormatWeek ? bbCalendar.columnFormatWeek : columnFormats.week;
  columnFormats.day = bbCalendar.columnFormatDay ? bbCalendar.columnFormatDay : columnFormats.day;
  titleFormats.month = bbCalendar.titleFormatMonth ? bbCalendar.titleFormatMonth : titleFormats.month;
  titleFormats.week = bbCalendar.titleFormatWeek ? bbCalendar.titleFormatWeek : titleFormats.week;
  titleFormats.day = bbCalendar.titleFormatDay ? bbCalendar.titleFormatDay : titleFormats.day ;

  // Set the formats for the Full Calendar
  bbCalendar.fcOptions.columnFormat = columnFormats;
  bbCalendar.fcOptions.titleFormat = titleFormats;
  
  var datepickerformat = "mm/dd/yy";
  var showTheMonthAfterYear = false;
  
  // we always want to support yyyy instead of yy. Not using locale settings for date format as we cannot support any date format. 
  // Just using date order
  if ( dateOrder && dateOrder.length == 3)
  {
    // replace d with dd/, m with mm/ and y with yy/ and remove the last /
    datepickerformat = dateOrder.toUpperCase().replace(/D/g,"dd/").replace(/Y/g,"yy/").replace(/M/g,"mm/").slice(0,-1);
    bbCalendar.dateFormat = datepickerformat.replace(/mm/g,"MM").replace(/yy/g,"yyyy");
  }
  var is24HrStr = LOCALE_SETTINGS['LOCALE_SETTINGS.24HR_SUPPORT.03208'];
  if ( is24HrStr === "1" ) 
  {
    bbCalendar.is24 = true;
  }

  if ( bbCalendar.isRTL === undefined )
    bbCalendar.isRTL = false;
  
  // Hijri Localize
  bbHijriCalendar.localize();
  
  $j.datepicker.setDefaults
  ( 
    {
      dayNames : bbCalendar.dayNames,
      dayNamesShort : bbCalendar.dayNamesShort,
      dayNamesMin : bbCalendar.dayNamesMin,
      monthNames : bbCalendar.monthNames,
      monthNamesShort : bbCalendar.monthNamesShort,
      dateFormat : datepickerformat, // datepicker wants format like mm/dd/yy for 09/18/2012
      showMonthAfterYear : formatYearBeforeMonth,
      isRTL : bbCalendar.isRTL,
      prevText: page.bundle.getString('calendar.text.prev.month'),
      nextText: page.bundle.getString('calendar.text.next.month'),
      firstDay : bbCalendar.firstDay,
      yearSuffix: bbCalendar.yearSuffix
    }
  );
  var ampm = LOCALE_SETTINGS['LOCALE_SETTINGS.AM_PM.00522'].split(" ");
  var amStr = "AM";
  var pmStr = "PM";
  if ( ampm && ampm.length === 2 ){
    amStr = ampm[0];
    pmStr = ampm[1];
  }
  $j.timepicker.setDefaults
  ( {
      currentText: page.bundle.getString('calendar.text.now'),
      hourText: page.bundle.getString('calendar.text.Hour'),
      minuteText: page.bundle.getString('calendar.text.Minute'),
      timeText: page.bundle.getString('calendar.text.time'),
      closeText: page.bundle.getString('calendar.text.done'),
      stepMinute: 5, 
      amNames: ['AM','A','am','a', amStr ],
      pmNames: ['PM','P', 'pm', 'p', pmStr],
      timeFormat:  bbCalendar.is24? "HH:mm" : "hh:mm TT" 
  });
  if (  bbCalendar.is24 )
  {
    bbCalendar.timeFormat = "HH:mm"; // for parsing in date.js
    bbCalendar.fcOptions.timeFormat = { // fullCalendar event time format
                               // for agendaWeek and agendaDay
                               agenda: 'H:mm{ - H:mm}', // 13:00 - 13:30 
                               // for all other views
                               '': 'H:mm'            // 7:00
                             };
    bbCalendar.fcOptions.axisFormat = 'H(:mm) '; // full calendar
  }
  else 
  {
    bbCalendar.fcOptions.timeFormat =  {
                                // for agendaWeek and agendaDay
                                agenda: 'h:mm tt{ - h:mm tt}', // 5:00 am - 6:30 am
                                // for all other views
                                '': 'h:mmt'            // 7p
                              };
    bbCalendar.fcOptions.axisFormat =  'h(:mm)tt ';
  }
};


bbCalendar.getDate = function( offset )
{
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  return new Date( y, m, d + offset, 11 );
};

bbCalendar.allClickHandler = function( checked )
{
  return function( event, viewNameParam )
  {
    var calendarIdsChanged = $j( "#calendars" ).calendarlist( checked ? "checkAll" : "uncheckAll" );

    // set up payload for each calendar
    var json = {};
    json.calendars = [];
    _.each( calendarIdsChanged, function( id )
    {
      json.calendars.push(
      {
          checked : checked,
          id : id
      } );
    } );

    $j.ajax(
    {
        url : "/webapps/calendar/calendarData/calendars",
        type : "PUT",
        data : JSON.stringify( json ),
        contentType : "application/json;charset=utf-8",
        dataType : "json",
        processData : false,
        statusCode :
        {
          200 : function()
          {
            if ( checked === false )
            {
              // remove all events without hitting server
              $j( '#calendar' ).fullCalendar( 'removeEvents' );
            }
            else
            {
              var curview = $j( '#calendar' ).fullCalendar( 'getView' );
              var start = bbCalendar.range.start ? bbCalendar.range.start : curview.start;
              var end = bbCalendar.range.end ? bbCalendar.range.end : curview.end;
              bbCalendar.getEvents( start, end, function( data )
              {
                _.each( data, function( event )
                {
                  // no such event should exist but cleanup regardless
                  $j( '#calendar' ).fullCalendar( 'removeEvents', event.id ); 
                  $j( '#calendar' ).fullCalendar( 'renderEvent', event );
                } );
              }, calendarIdsChanged );
            }
          }
        }
    } );
  };
};

bbCalendar.viewClickHandler = function( event, viewNameParam )
{
  var viewName = viewNameParam ? viewNameParam : this.id;
  $j( "ul.cal-nav > li" ).removeClass( 'active' );
  $j('#'+viewName).addClass("active");

  $j( '#calendar' ).fullCalendar( 'changeView', viewName );

  // Update the user view preference
  $j.ajax(
  {
      url : "/webapps/calendar/calendarData/calendar/0",
      type : "PUT",
      data : JSON.stringify(
      {
        "view" : viewName
      } ),
      contentType : "application/json;charset=utf-8",
      dataType : "json",
      processData : false
  } );
  bbCalendar.syncHeight();
};

bbCalendar.dateSelected = function( dateText, inst )
{
  bbCalendar.viewType = "select";
  if (   bbCalendar.skipFullCalendarOnSelect === true )
    return;
  var time = getDateFromFormat( dateText, bbCalendar.dateFormat);
  var date = new Date( time );
  if ( bbHijriCalendar.islamicCal )
  {
    //Setting the currentMonth for the islamicCal
    bbCalendar.currentHijriMonth = bbHijriCalendar.islamicCal.fromJSDate( date );
  }
  $j( '#calendar' ).fullCalendar( 'gotoDate', date );
};

bbCalendar.dayClicked = function( date, allDay, jsEvent, view )
{
  $j( '#create-new-event' ).calendarevent( 'create', date, view, allDay );
};

bbCalendar.eventClicked = function( calEvent, jsEvent, view, elemToFocusOnClose )
{
  $j( '#create-new-event' ).calendarevent( 'edit', calEvent, elemToFocusOnClose );
};

bbCalendar.eventDropped = function( event, dayDelta, minuteDelta, allDay, revertFunc )
{
  var viewname = $j( '#calendar' ).fullCalendar( 'getView' ).name;

  if ( viewname !== 'month' )
  {
    //  events that come from course can't be dragged and dropped to all day area (day/week)
    if ( allDay === true && event.userCreated === false )
    {
      revertFunc();
      return;
    }
    // moving from all day area to time slot, re-adjust the duration to 30 mins instead of 24 hrs 
    if ( allDay === false && event.oldAllDay === true && event.start !== null )                                                                                   
    {
      event.end = new Date( event.start.getTime() + 30 * 60000 );
    }
  }
  var start, end;
  if ( event.start !== null )
    start = $j.fullCalendar.formatDate( event.start, bbCalendar.ISO8601_FORMAT );
  if ( event.end !== null )
    end = $j.fullCalendar.formatDate( event.end, bbCalendar.ISO8601_FORMAT );
  // for month view, fullcalendar widget considers all drag/drop as allDay, which is wrong. 
  // We need to correct that.
  if ( viewname === 'month')
    allDay = event.oldAllDay;
  // repeat event should re-render so that event broken is rendered properly
  // gradable event should re-render if new due date > 11:00 pm
  var successFunc = ((event.repeat === true ) || (event.gradable === true || event.itemSourceType.indexOf('GradableItem') > 0))?  function() {
      $j( '#calendar' ).fullCalendar('removeEvents', event.id ); bbCalendar.getEvent( event.id ); 
    } : undefined;
  bbCalendar.dropAjax ( event, start, end, allDay, revertFunc, successFunc );
};

bbCalendar.dropAjax = function(event, start, end, allDay, revertFunc, successFunc) {
  var dropFn = function(){
    $j('#calendar').spin('large', 'purple');
    $j.ajax({
      url : '/webapps/calendar/calendarData/event/' + event.id,
      type : 'PUT',
      data : JSON.stringify({
        "start" : start,
        "end" : end,
        "allDay" : allDay
      }),
      contentType : "application/json;charset=utf-8",
      dataType : "json",
      processData : false,
      success : function() {  if ( successFunc ) successFunc(); },
      error : function(xhr) { if (xhr.status === 200  ) // jquery can now raise error even when json is null
                              { 
                                if ( successFunc )
                                  successFunc();
                              }
                              else if (revertFunc) revertFunc(); 
                            },
      complete : function() {
        $j('#calendar').spin(false);
        event.oldAllDay = allDay;
      }
    });
  };
  if ( event.isDateRangeLimited === true )
  {
    var cancel = page.bundle.getString( 'calendar.event.cancel' ),  okbut = page.bundle.getString( 'calendar.event.ok' );
    var buttons = {};
    buttons[ cancel ] = function (){  $j('#create-new-event').dialog('close'); revertFunc(); };
    buttons[ okbut ] = function () { $j('#create-new-event').dialog('close'); dropFn(); };
    $j('#create-new-event').empty().append( '<div class="event-detail"> <div class="event-details">' + page.bundle.getString( 'calendar.event.dateRangeLimited.warning',
                     $ESAPI.encoder().encodeForHTML( event.title ) ) + '</div></div>' );
    $j('#create-new-event').dialog(
    {
                        modal : true,
                        title : page.bundle.getString( 'calendar.event.confirm' ),
                        buttons : buttons,
                        width : 600
     } ); 
  } else {
    dropFn();
  }

};

bbCalendar.eventResized = function( event, dayDelta, minuteDelta, revertFunc )
{
  if ( event.disableResizing === true )
  {
    revertFunc();
    return;
  }

  bbCalendar.eventDropped( event, dayDelta, minuteDelta, false, revertFunc );
};

bbCalendar.eventRender = function( event, element )
{
  // button role
  element.attr('role', 'button').attr('tabindex', '1' ).on( "keydown",
    function(e){
      if ( e.which === 32 || e.which === 13 )
      { 
        e.preventDefault();
        bbCalendar.eventClicked( event, e, null, element );
      }
    } ).on( "click", function (e) {
      e.preventDefault();
      bbCalendar.eventClicked( event, e, null, element );
    });
  // date for aria 
  if ( event.allDay === true )
  {
    var startformat = "";
    var endformat = "";
    if ( bbHijriCalendar.hijriDisplay )
    {
      //If Hijri Date format it properly
      startformat = bbHijriCalendar.formatToIslamicDate('dddd, MMM dd, yyyy ',event.start );
      endformat = event.end ? bbHijriCalendar.formatToIslamicDate('dddd, MMM dd, yyyy ',event.end ): startformat;
    } else 
    {
      startformat = formatDate(event.start, 'EE, MMM dd, yyyy');
      endformat = event.end ? formatDate(event.end, 'EE, MMM dd, yyyy') : startformat;
    }
    var endformathtml = (startformat === endformat )?'' : ' - '+ endformat;
    var html = page.bundle.getString('calendar.text.allDay') + ', '+ startformat + endformathtml +', ' ;
    element.find('.fc-event-title').before('<span class="hideoff">'+html+'</span>');
  }
  else
  {
    var htmltime =  "";
    if ( bbHijriCalendar.hijriDisplay )
    {
      //If Hijri Date format it properly
      htmltime =  bbHijriCalendar.formatToIslamicDate('dddd, MMM dd, yyyy, ',event.start );
    } else 
    {
      htmltime =  formatDate(event.start, 'EE, MMM dd, yyyy, ' );
    }
    element.find('.fc-event-time').before('<span class="hideoff">'+htmltime+'</span>');
  }
  if ( event.disableResizing === true )
  {
    element.find( '.ui-resizable-handle.ui-resizable-s' ).remove();
  }
  else  
  {
    element.find( '.ui-resizable-handle.ui-resizable-s' ).attr('aria-hidden', 'true' );
  }
  var imgurl, title;
  if ( event.userCreated === false ) {
    title = page.bundle.getString('calendar.event.grade.img.alt');
    imgurl = '<img src = "/webapps/calendar/images/calendar/calendar_grade.png" alt="'+title+'" title="'+title+'"/>';
    element.find('.fc-event-title').after(imgurl);
  } else if ( event.repeat === true ){
    if ( event.repeatBroken === false ){
      title = page.bundle.getString('calendar.event.create.multiple');
      imgurl = '<img src = "/webapps/calendar/images/calendar/calendar_recur.png" alt="'+title+'" title="'+title+'"/>';
    } else {
      title = page.bundle.getString('calendar.event.create.multiple');
      imgurl = '<img src = "/webapps/calendar/images/calendar/calendar_recur_broken.png" alt="'+title+'" title="'+title+'"/>';      
    }
    element.find('.fc-event-title').after(imgurl);
  }
  bbCalendar.updateGradableEventHead(event, element);
};

//update event head for gradable event
bbCalendar.updateGradableEventHead = function( event, element )
{
  if (event.gradable === true || event.itemSourceType.indexOf('GradableItem') > 0) {
    //8:00 am - 9:00 am => 8:00 am
    var title = element.find('.fc-event-time').text().replace(/ -.*$/, '');
    element.find('.fc-event-time').text(title);
    if (event.originalStart !== undefined) {
      //display original start time for due date > 11:00 pm gradable event
      var originalMinutes = event.originalStart.match(/:(\d\d):/)[1];
      title = title.replace(/00/, originalMinutes);
      element.find('.fc-event-time').text(title);
    }
  }
};

bbCalendar.viewDisplay = function( view )
{
  bbCalendar.customizeFullCalendar( view );
};

bbCalendar.getEventsError = function( jqXHR, textStatus, errorThrown )
{  
  alert( page.bundle.getString("calendar.error.events") +" "+ errorThrown );
};


bbCalendar.getEvents = function( start, end, callback, calendarIds )
{
  if ( bbHijriCalendar.hijriDisplay )
  {
    if ( (end-start)/bbCalendar.ONEDAY_TIME > 29 ) {
      //Adjust the dates only if it is month view 
      //Getting the correct start and end date 
      var monthDetails = bbHijriCalendar._getHijriMonthStartDate( start ) ;
      start = monthDetails[0];
      end = new Date( start.getTime() + bbCalendar.ONEDAY_TIME * (6*7) ); //Displaying 6 weeks
    }
  }
  
  $j( '#calendar' ).spin( 'large', 'purple' );

  var url = '';

  // if no calendar ids were specified, then pull the current set of checked calendars
  // also don't send a request with too many characters in the url. The calendar ids will be 
  // determined from the checked calendars on the server in that case
  // (default url max length for tomcat is 8k. Assuming 99% of characters fit into 2 bytes that
  //  gives us 2048 characters for the url before Tomcat complains)
  var calendarIdsString = calendarIds && calendarIds.join && calendarIds.join();
  if ( calendarIds === undefined || !_.isArray ( calendarIds ) || (calendarIdsString && calendarIdsString.length > 2000 ) ) 
  {
    url = '/webapps/calendar/calendarData/selectedCalendarEvents?start=' + start.getTime() + '&end=' + end.getTime() +  '&course_id=' + bbCalendar.courseId + '&mode=' + bbCalendar.mode;
    // cache the range passed from fullCalendar
    // will be used in bbCalendar.calendarClicked to load for checked calendar for entire range
    bbCalendar.range.start = start;
    bbCalendar.range.end = end;
  }
  // convert the calendar ids array into a comma separated list for the url
  else 
  {
    calendarIds = _.map( calendarIds, function( id ){ return encodeURIComponent( id ); } );
    url = '/webapps/calendar/calendarData/events?start=' + start.getTime() + '&end=' + end.getTime() +  '&course_id=' + bbCalendar.courseId + '&calendarIds=' + calendarIdsString;
  }
  
  $j.ajax(
  {
      url : url,
      type : 'GET',
      success : function( data, textStatus, jqXHR )
      {
        _.each(data, function (event) {
            bbCalendar.handleGradableEvent(event);
          }
        );
        callback ( data );
      },
      error : bbCalendar.getEventsError,
      complete : function()
      {
        $j( '#calendar' ).spin( false );
      }
  } );
};

//1.for due date > 11:00 pm gradable events, display one hour event block from 11:00 pm to 11:59 pm
//2.change event duration from 2 hours to 1 hour for gradable events (align with Ultra).
bbCalendar.handleGradableEvent = function( event )
{
  if ( event.gradable === true || (event.itemSourceType && event.itemSourceType.indexOf( 'GradableItem' ) > 0 ) ) {
    var hours = parseInt(event.start.match(/T(\d\d):/)[1], 10);
    if ( hours === 23 )
    {
      //start: 2017-03-22T23:40:00 => 2017-03-22T23:00:00 and end: 2017-03-22T23:40:00 => 2017-03-22T23:59:00
      event.originalStart = event.start;
      event.originalStartDate = event.start.replace( /T/, ' ' );
      event.start = event.start.replace( /:\d\d:/, ':00:' );
      event.end = event.start.replace( /:\d\d:/, ':59:' );
    }
    else
    {
      //2017-03-22T08:00:00 => 2017-03-22T09:00:00 or 2017-03-22T15:00:00 => 2017-03-22T16:00:00
      event.end = event.start.replace( /T(\d\d ):/, function ( x, y )
        {
        return 'T' + ( '0'+( parseInt( y, 10 ) + 1 ) ).slice( -2 ) + ':';
      } );
    }
  }
};

bbCalendar.syncHeight = function()
{
  var winHeight = document.viewport.getHeight();

  // equalize column heights
  var lhs = $j( '#streamHeader_calendar' );
  var rhs = $j( '#calendar_content' );
  var lhsHeight = lhs.height();
  var rhsHeight = rhs.height();
  var wrapperHeight = $j( '#outer_left_stream_alerts' ).height();

  if ( lhsHeight < winHeight )
  {
    lhsHeight = winHeight;
    lhs.css( 'height', winHeight + 'px' );
    lhs.css( 'minHeight', wrapperHeight + 'px' );
  }

  if ( lhsHeight > rhsHeight )
  {
    // if left column larger then right column, equalize
    rhs.css( 'height', lhsHeight + 'px' );
    rhs.css( 'minHeight', wrapperHeight + 'px' );
    // wrapperHeight can be more than both only when switching between views
    if ( wrapperHeight > lhsHeight )
      lhs.css( 'minHeight', wrapperHeight + 'px' );
  }
  else if ( lhsHeight < rhsHeight )
  {
    // if left column smaller then right column, equalize
    lhs.css( 'height', rhsHeight + 'px' );
    lhs.css( 'minHeight', wrapperHeight + 'px' );
    // wrapperHeight can be more than both only when switching between views
    if ( wrapperHeight > rhsHeight )
      rhs.css( 'minHeight', wrapperHeight + 'px' );
  }
};

bbCalendar.eventDragStart = function( event, jsEvent, ui, view )
{
  event.oldAllDay = event.allDay; // set oldAllday. we need it on drop
  // code for making datepicker droppable
  if ( view.name === 'month' )
  {
    // make the date picker on left droppable only for month view
    ui.helper.data( "fcevent", event ); // store full calendar event
    // if droppable exists in date picker destroy them
    if ( $j( ".ui-datepicker-calendar td" ).first().is(':data(droppable)') === true )
      $j( ".ui-datepicker-calendar td" ).droppable('destroy');
    
    $j( ".ui-datepicker-calendar td" ).droppable(
    { 
      tolerance : "pointer",
      drop : function( event, ui )
      {
        bbCalendar.skipFullCalendarOnSelect = true;
        $j(this).click();
        var theDate = $j( "#datepicker" ).datepicker( "getDate" );
        bbCalendar.skipFullCalendarOnSelect = false;
        var fcevent =ui.draggable.data( "fcevent" );
        var start = fcevent.start;
        var end = fcevent.end;
        start.setFullYear( theDate.getFullYear());
        start.setMonth( theDate.getMonth());
        start.setDate( theDate.getDate());
        if ( end )
        {
          end.setFullYear( theDate.getFullYear());
          end.setMonth( theDate.getMonth());
          end.setDate( theDate.getDate());
        }
        bbCalendar.dropBetweenCalendars( fcevent, start, end );
      }
    } );
  }
};

bbCalendar.eventDragStop = function( event, jsEvent, ui, view )
{  
};

bbCalendar.dropBetweenCalendars = function ( event, startdate, enddate )
{
  $j( '#calendar' ).fullCalendar('removeEvents', event.id );
  var start, end;
  if ( startdate !== null )
    start = $j.fullCalendar.formatDate( startdate, bbCalendar.ISO8601_FORMAT );
  if ( enddate !== null )
    end = $j.fullCalendar.formatDate( enddate, bbCalendar.ISO8601_FORMAT );
  var func = function() { bbCalendar.getEvent( event.id ); };  
  bbCalendar.dropAjax( event, start, end, event.oldAllDay, func, func );
};


bbCalendar.getEvent = function( eventid )
{
  $j.ajax(
  {
      url : "/webapps/calendar/calendarData/event/" + eventid,
      type : 'GET',
      statusCode :
      {
        200 : function( data )
        {
          bbCalendar.handleGradableEvent(data);
          $j( '#calendar' ).fullCalendar( 'renderEvent', data );
        }
      },
      error : function( jqXHR )
      {
        var msg = ( jqXHR.responseText ) ? jqXHR.responseText : page.bundle.getString( 'ajax.error' );
        alert( msg );
      }
  } );
};


bbCalendar.createCalendar = function( $, viewName )
{
  var startingView = viewName || 'month';

  $( '#calendar' ).fullCalendar(
  {
      header :
      {
          left : 'today, prev, next, title',
          middle : '',
          right : ''
      },
      defaultView : startingView,
      editable : true,
      allDayDefault : false,
      eventSources : [ bbCalendar.getEvents ],
      dayClick : bbCalendar.dayClicked,
      eventClick : bbCalendar.eventClicked,
      viewDisplay : bbCalendar.viewDisplay,
      eventDrop : bbCalendar.eventDropped,
      eventResize : bbCalendar.eventResized,
      eventRender : bbCalendar.eventRender,
      eventDragStart: bbCalendar.eventDragStart,
      eventDragStop: bbCalendar.eventDragStop,
      monthNames: bbCalendar.monthNames, 
      monthNamesShort: bbCalendar.monthNamesShort,
      dayNames: bbCalendar.dayNames,
      dayNamesShort: bbCalendar.dayNamesShort,
      buttonText: {
       today: page.bundle.getString('calendar.text.Today'),
       month: page.bundle.getString('calendar.text.Month'),
       week: page.bundle.getString('calendar.text.Week'),
       day: page.bundle.getString('calendar.text.Day')
      },
      allDayText: page.bundle.getString('calendar.text.allDay'),
      firstHour: 9,
      isRTL : bbCalendar.isRTL,
      timeFormat : bbCalendar.fcOptions.timeFormat,
      axisFormat : bbCalendar.fcOptions.axisFormat,
      columnFormat: bbCalendar.fcOptions.columnFormat,
      titleFormat: bbCalendar.fcOptions.titleFormat,
      firstDay : bbCalendar.firstDay
  } );
  
  $j( "ul.cal-nav li" ).removeClass( "active" );
  $j( "#" + startingView ).addClass( "active" );
  // sync height
  bbCalendar.syncHeight();  
  //hide create button if no modifiable calendars
  var calendars = $j.grep( $j( "#calendars" ).calendarlist("getCalendars"), function( cal ){ return cal.canCreate; } );
  if ( calendars.length === 0   ) 
    $j("#createeventbutton").hide();
};

bbCalendar.calendarClicked = function( calId, checked, color )
{  
  if ( !calId )
    return;
  var json = {};
  if ( checked !== undefined )
    json.checked = checked;
  else if ( color !== undefined )
    json.color = color;
  else
    return;

  $j.ajax(
  {
      url : "/webapps/calendar/calendarData/calendar/" + calId,
      type : "PUT",
      data : JSON.stringify( json ),
      contentType : "application/json;charset=utf-8",
      dataType : "json",
      processData : false,
      statusCode :
      {
        200  : function ()
        {
          if ( checked === false )
          {
            // disable until the operation is over
            $j( "#calendars" ).calendarlist("disableCalendar", calId);
            // no need to hit server. just remove the events from full calendar
            _.each( 
              $j( "#calendar" ).fullCalendar( 'clientEvents' , function ( clientEvent ) { return (clientEvent.calendarId === calId ); } ),
              function ( fcevent ){                       
                $j('#calendar').fullCalendar( 'removeEvents', fcevent.id );
              } 
            );
            $j( "#calendars" ).calendarlist("enableCalendar", calId);
          }
          else if ( checked === true  )
          {
            //disable until the operation is over
            $j( "#calendars" ).calendarlist("disableCalendar", calId);
            var callback = function(){
              $j( "#calendars" ).calendarlist("enableCalendar", calId);
            };
            // only fetch the events belonging to the calendar checked and render them
            bbCalendar.fetchAndRenderCalendar( calId, callback);
          } else if ( color )
          {
            // just update the colors
            _.each( 
                   $j( "#calendar" ).fullCalendar( 'clientEvents' , function ( clientEvent ) { return (clientEvent.calendarId === calId ); } ),
                   function ( fcevent ){ 
                     fcevent.color = color;
                     $j('#calendar').fullCalendar( 'updateEvent', fcevent );
                   } 
                 );
          }
        } 
      }
  } );

};

bbCalendar.fetchAndRenderCalendar = function( calId, callbackFnParam){
  if ( !calId )
    return;
  // only fetch the events belonging to the calendar checked and render them
  var callback = function( events ){
    _.each( events, function ( event ){
      $j( '#calendar' ).fullCalendar( 'removeEvents', event.id ); // no such event should exist but cleanup regardless
      $j( '#calendar' ).fullCalendar( 'renderEvent', event ); 
    } 
    );
    if ( callbackFnParam )
      callbackFnParam();
  };
  // fullCalendar has lazyLoading enabled and may not load on change of view.
  // Therefore, we must load for entire cached range in bbCalendar.calendarClicked
  // currentView start/end is only a fallback and should never be needed
  var curview = $j( '#calendar' ).fullCalendar( 'getView' );
  var start = bbCalendar.range.start ? bbCalendar.range.start : curview.start;
  var end = bbCalendar.range.end ? bbCalendar.range.end : curview.end;
  bbCalendar.getEvents( start, end, callback, [calId] );
};


bbCalendar.showIcal = function()
{
  var text = page.bundle.getString( 'ical.dialog.text' );
  $j( '#icaldialog' ).empty().append(
                                      $j( '<div class="event-detail"><div class="event-details"><p><span class="icaldialog">' + text +
                                          '</span></p><br><p> <div id="icalurlid" class="icalurl"/></p></div></div>' ) );
  var title = page.bundle.getString( 'ical.dialog.title' );
  var regenstr = page.bundle.getString( 'ical.dialog.regenerate' );
  var closestr = page.bundle.getString( 'calendar.event.cancel' );
  var buttons = {};
  buttons[ closestr ] = function()
  {
    $j( '#icaldialog' ).dialog( "close" );
  };
  buttons[ regenstr ] = function()
  {
    bbCalendar.regenerateIcalUrl( 'POST' );
  };
  $j( '#icaldialog' ).dialog(
  {
      modal : true,
      title : title,
      buttons : buttons,
      minWidth : 720
  } );
  bbCalendar.regenerateIcalUrl( 'GET' );
};

bbCalendar.regenerateIcalUrl = function( type )
{
  $j( '#icaldialog' ).spin( 'small', 'purple' );
  $j.ajax(
  {
      url : "/webapps/calendar/calendarFeed/url",
      type : type,
      success : function( data, textStatus, jqXHR )
      {
        $j( '#icalurlid' ).empty().append( data );
        bbCalendar.selectText('icalurlid');
      },
      error : function()
      {
        $j( '#icalurlid' ).empty().append( page.bundle.getString( 'ajax.error' ) );
      },
      complete : function()
      {
        $j( '#icaldialog' ).spin( false );
      }
  } );
};

// old fashioned, non jquery code for selection but works
bbCalendar.selectText = function(elementId) {
  var doc = document, text = doc.getElementById(elementId), range, selection;    
  if (doc.body.createTextRange) {//ms
      range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select();
  } else if (window.getSelection) {
      selection = window.getSelection();        
      range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
  }
};

bbCalendar.customizeFullCalendar = function( view ){
  // The code here should be re-entrant. 
  $j('<button class="fc-button-content fc-button-main" role="button" tabindex="1" title="'+page.bundle.getString('calendar.text.Today')+'">'+page.bundle.getString('calendar.text.Today')+'</button>').replaceAll('.fc-button-today').click(
      function(){ bbCalendar.viewType = 'today'; $j('#calendar').fullCalendar ('today'); });
  $j('<button class="fc-button-content fc-button-main fc-button-img" role="button" tabindex="1"  title="'+page.bundle.getString('calendar.text.prev')+'"><span class="button-img-prev">'+page.bundle.getString('calendar.text.prev')+'</span></button>').replaceAll('.fc-button-prev').click(
     function(){ bbCalendar.viewType = 'prev'; $j('#calendar').fullCalendar ('prev'); });
  $j('<button class="fc-button-content fc-button-main fc-button-img" role="button" tabindex="1"  title="'+page.bundle.getString('calendar.text.next')+'"><span class="button-img-next">'+page.bundle.getString('calendar.text.next')+'</span></button>').replaceAll('.fc-button-next').click(
     function(){ bbCalendar.viewType = 'next'; $j('#calendar').fullCalendar ('next'); });
  if ( $j('#createeventbutton').length === 0 ) {
    $j('.fc-header-right').empty().append('<button id="createeventbutton" class="fc-button-content fc-button-img fc-button-main" role="button" tabindex="1" title="'+page.bundle.getString('calendar.event.create.newevent')+'"><span class="button-img-create">'+
                                  page.bundle.getString('calendar.event.create.newevent')+'</span></button>').click(
      function(){$j( '#create-new-event' ).calendarevent( 'create' ); });
  }  
  // help text
  if ( view )
  {
    var axHelpText = page.bundle.getString( 'calendar.view.ax.'+view.name );
    $j('#axViewHelp').text(axHelpText);
    
    //Call Hijri Calendar 
    bbHijriCalendar.hijriCalendar( view );
  }
  // aria-hidden for table inside fc-content
  $j('.fc-content table').attr('aria-hidden', 'true');

  // This method should be called every time the main page header -- the one indicating the period currently being
  // displayed in the calendar -- changes. It sends all page headers to the Quick Links framework. See LRN-64726.
  bbCalendar.sendQuickLinks();
};




bbCalendar.createKeyboardShortcuts = function(){
  $j('#create-new-event').on( "keydown", function(e) {
    if ( e.which === 27 )// unless escape, stop propogation in dialog
    {
      if ( $j('#create-new-event').is(':data(dialog)') === true )
        $j('#create-new-event').dialog('close').dialog('destroy');
    }
    else
      e.stopPropagation();
  });
  $j(document).on( "keydown", function(e) {
      // do nothing if dialog is open      
      if ( ( $j('#create-new-event').is(':data(dialog)') === true && $j("#create-new-event").dialog( "isOpen" ) === true ) || 
          ( $j('#icaldialog').is(':data(dialog)') === true && $j("#icaldialog").dialog( "isOpen" ) === true ) )
        return;
      if( $j("input").is(":focus") ) // disable if any input is in focus
        return;
    // keyboard short cuts
      if ( ( e.ctrlKey && e.which  === 37 ) || e.which === 80 ) { // ctrl-left or p 
        bbCalendar.viewType = 'prev';
        $j('#calendar').fullCalendar ('prev');
      } else if ( ( e.ctrlKey && e.which  === 39 ) || e.which === 78 ) { // ctrl-left or p
        bbCalendar.viewType = 'next';
        $j('#calendar').fullCalendar ('next');
      } else if ( e.ctrlKey || e.metaKey ){ // no ctrl key for the rest of events
        return; 
      } else if ( e.which === 67 || e.which === 187 ) { // c or +
        e.preventDefault();
        $j( '#create-new-event' ).calendarevent( 'create' );
      } else if ( e.which === 82 ){  // r
        $j('#calendar').fullCalendar ('refetchEvents');
      } else if ( e.which === 84 ){ // t
        bbCalendar.viewType = 'today';
        $j('#calendar').fullCalendar ('today');
      } else if (e.which === 49 || e.which === 68 ) { // 1 or d 
        bbCalendar.viewClickHandler( null, 'agendaDay' );
      } else if (e.which === 50 || e.which === 87 ) { // 2 or w
        bbCalendar.viewClickHandler( null, 'agendaWeek' );
      } else if (e.which === 51 || e.which === 77 ) { // 3 or m
        bbCalendar.viewClickHandler( null, 'month' );
      }
  });  

  // Send the key definitions created above to the Quick Links framework
  bbCalendar.sendHotkeys();  
};

/** Send information about Calendar keyboard shortcuts to Quick Links */
bbCalendar.sendHotkeys = function()
{
  if ( window.quickLinks )
  {
    var hotkeys = [];
    for ( var i = 1; i < 9; ++i )
    {
      hotkeys.push(
      {
          'key' :
          {
            'accesskey' : page.bundle.getString( 'calendar.keyboard.shortcut.key' + i )
          },
          'label' : page.bundle.getString( 'calendar.keyboard.shortcut.value' + i )
      } );
    }

    var sourceId = 'bbCalendar';
    quickLinks.removeAll( sourceId );
    quickLinks.addHotKeys( sourceId, hotkeys );
  }
};

/** Collect headers, landmarks, and access keys from DOM and send to Quick Links */
bbCalendar.sendQuickLinks = function()
{
  if ( window.quickLinks && window.quickLinks.vars.helper )
  {
    setTimeout( function()
    {
      window.quickLinks.vars.helper.sendQuickLinks();
    }, 500 );
  }
};

bbCalendar.bindXSRF = function(){
  $j( document ).ajaxSend( function(event, xhr, options){
    var method = "GET";
    if ( options && options.type )
      method = options.type.toUpperCase();
    if ( method === "POST" || method === "PUT" || method === "DELETE" ) {
       xhr.setRequestHeader("X-Blackboard-XSRF", bbCalendar.nonceVal );
    }
 });
};

$j( function( $ )
{
  bbCalendar.bindXSRF();
  
  bbCalendar.localize();
  // Code that uses jQuery's $ can follow here.
  $( "#datepicker" ).datepicker(
  {
    onSelect : bbCalendar.dateSelected
  } );
  
  $( "#calendars" ).calendarlist(
  {
      calendars : "/webapps/calendar/calendarData/calendars?mode=" + bbCalendar.mode + "&course_id=" + bbCalendar.courseId,
      callback : bbCalendar.createCalendar,
      clickCallback : bbCalendar.calendarClicked
  } );
  

  // Wire up click events for View buttons
  $( "ul.cal-nav > li" ).on( "click", bbCalendar.viewClickHandler );
  $( "#checkAllCalendars" ).on( "click", bbCalendar.allClickHandler( true ) );
  $( "#uncheckAllCalendars" ).on( "click", bbCalendar.allClickHandler( false ) );
  $( window ).on( "resize", bbCalendar.syncHeight );

  $( '#ical' ).button().on( "click", bbCalendar.showIcal );
  var loadFn = function(){return $j( "#calendars" ).calendarlist("getCalendars");}; 
  $( '#create-new-event' ).calendarevent( { defaultCalendarId:bbCalendar.defaultCalendarId, loadFn:loadFn, isoformat : bbCalendar.ISO8601_FORMAT, 
              dateformat: bbCalendar.dateFormat, datetimeformat: bbCalendar.dateFormat+" "+bbCalendar.timeFormat, calendardiv:"calendar",
              fetchAndRenderCalendarFn: bbCalendar.fetchAndRenderCalendar, dayNamesMin : bbCalendar.dayNamesMin, firstDay : bbCalendar.firstDay,
              dayNames : bbCalendar.dayNames } );  
  bbCalendar.createKeyboardShortcuts();  
} );
