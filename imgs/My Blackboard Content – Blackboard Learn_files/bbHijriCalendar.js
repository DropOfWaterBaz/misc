var bbHijriCalendar = bbHijriCalendar ||
{};

bbHijriCalendar.localize = function()
{
  
  bbHijriCalendar.hasHijirCalendar = ( bbCalendar.calendarType.toUpperCase() !== 'GREGORIAN' );
  bbHijriCalendar.hijriDisplay = ( bbCalendar.calendarType === 'HIJRI' || bbCalendar.calendarType === 'HIJRI_GREGORIAN' );
  
  // localize 
  //Default Values
  bbHijriCalendar.monthNamesHijri = ['Mu\u1E25arram', '\u1E62afar', 'Rab\u012B\u02BF\u0027al-Awwal',  'Rab\u012B\u02BF\u0027ath-Th\u0101n\u012B', 'Jum\u0101d\u0101\u0027al-\u016Al\u0101',  'Jum\u0101d\u0101\u0027ath-Th\u0101niya', 'Rajab', 'Sha\u02BFb\u0101n', 'Rama\u1E0D\u0101n', 'Shaww\u0101l', 'Dh\u016B\u0027al-Qa\u02BFda', 'Dh\u016B\u0027al-\u1E24ijja'];
  bbHijriCalendar.monthNamesShortHijri = ['Mu\u1E25arram', '\u1E62afar', 'Rab\u012B\u02BF\u0027I', 'Rab\u012B\u02BF\u0027II', 'Jum\u0101d\u0101\u0027I', 'Jum\u0101d\u0101\u0027II', 'Rajab', 'Sha\u02BFb\u0101n', 'Rama\u1E0D\u0101n', 'Shaww\u0101l', 'Dh\u016B\u0027al-Qa\u02BFda', 'Dh\u016B\u0027al-\u1E24ijja'];
  bbHijriCalendar.AMPM = LOCALE_SETTINGS[ 'LOCALE_SETTINGS.AM_PM.00522' ].split( /\s+/g );
  
  if ( LOCALE_SETTINGS[ 'LOCALE_SETTINGS.MONTH_FULL_HIJRI.02100' ] )
    bbHijriCalendar.monthNamesHijri = LOCALE_SETTINGS[ 'LOCALE_SETTINGS.MONTH_FULL_HIJRI.02100' ].split("," );

  if ( LOCALE_SETTINGS[ 'LOCALE_SETTINGS.MONTH_SHORT_HIJRI.00520' ] )
    bbHijriCalendar.monthNamesShortHijri = LOCALE_SETTINGS[ 'LOCALE_SETTINGS.MONTH_SHORT_HIJRI.00520' ].split( "," );

  if ( LOCALE_SETTINGS[ 'LOCALE_SETTINGS.NUMBERS_HIJRI_LOCALIZED.00521' ]  && LOCALE_SETTINGS[ 'LOCALE_SETTINGS.NUMBERS_HIJRI_LOCALIZED.00521' ] =='YES')
    bbHijriCalendar.numbersLocale = LOCALE_SETTINGS[ 'LOCALE_SETTINGS.NUMBERS_HIJRI.00521' ].split( /\s+/g );
  
  bbHijriCalendar.islamicCal = $j.calendars.instance( 'UmmAlQura' );
  bbHijriCalendar.localizedNames = { monthNames: bbCalendar.monthNames, 
                         monthNamesShort: bbCalendar.monthNamesShort,
                         dayNames: bbCalendar.dayNames,
                         dayNamesShort: bbCalendar.dayNamesShort };
};


//update the GREGORIAN calendar display to Hijri Calendar based on the View
bbHijriCalendar.hijriCalendar = function( view )
{
  //The Classes used in the Full calendar display
  var cellClasses = [ ".fc-sun", ".fc-mon", ".fc-tue", ".fc-wed", ".fc-thu", ".fc-fri", ".fc-sat" ];
  var fdotw = parseInt( bbCalendar.firstDay, 10 );
  
  if ( !bbHijriCalendar.hasHijirCalendar )
  {
    bbHijriCalendar._numberOnly( view, cellClasses, fdotw );
    return;
  }

  if ( view.name === 'month' )
  {
    bbHijriCalendar._monthViewUpdate( view, fdotw, cellClasses  );
  }
  else if ( view.name === 'agendaWeek' )
  {
    bbHijriCalendar._weekViewUpdate( view, fdotw, cellClasses  );
  }
  else if ( view.name === 'agendaDay' ){
    bbHijriCalendar._dayViewUpdate( view, fdotw, cellClasses  );
  }
};

bbHijriCalendar._getHijriMonthStartDate = function ( startDate )
{
  var fdotw = parseInt( bbCalendar.firstDay, 10 );
  // Current Month and year of the month displayed
  var startDateHijri = bbHijriCalendar.islamicCal.fromJSDate( startDate );
  var currentHijriMonth = startDateHijri.month() - 1;
  var firstDayofMonthHijri = startDateHijri; //Assuming both are same
  
  if ( !bbHijriCalendar.hijriDisplay )
  {
    return [ startDate, currentHijriMonth, firstDayofMonthHijri ];
  }
  var monthStartDateJS = startDate;
  //Calculate the Hijri Month to display
  if ( bbCalendar.viewType == 'today' ||  !bbCalendar.currentHijriMonth )
  {
    // Displaying the Today's month 
    firstDayofMonthHijri = bbHijriCalendar.islamicCal.newDate();
    firstDayofMonthHijri._day = 1;
  } else 
  { 
    firstDayofMonthHijri = bbHijriCalendar._copyHijriCalendar( bbCalendar.currentHijriMonth );
    var currentYear = bbCalendar.currentHijriMonth.year();
    var currentMonth =  bbCalendar.currentHijriMonth.month();
    if ( bbCalendar.viewType == 'next' )
    {
      //Next month button clicked
      currentMonth =  bbCalendar.currentHijriMonth.month()  + 1 ; 
      if (  bbCalendar.currentHijriMonth.month() == 12 )
      {
        currentMonth  = 1;
        currentYear = currentYear + 1;
      }
    } else if ( bbCalendar.viewType == 'prev' )
    {
      //Previous month button clicked
      currentMonth =  bbCalendar.currentHijriMonth.month() - 1 ; 
      if (  bbCalendar.currentHijriMonth.month() == 1 )
      {
        currentMonth  = 12;
        currentYear = currentYear - 1;
      }
    }
    //Setting the month and year 
    firstDayofMonthHijri._month = currentMonth;
    firstDayofMonthHijri._year = currentYear;
    firstDayofMonthHijri._day = 1;
  }
  
  // Calculating the start day of the week to be displayed
  var startWeek = firstDayofMonthHijri.dayOfWeek() - fdotw;
  if ( startWeek < 0 )
  {
    startWeek = startWeek + 7;
  }
  bb = bbCalendar.ONEDAY_TIME * startWeek;
  
  monthStartDateJS = bbHijriCalendar.islamicCal.toJSDate( firstDayofMonthHijri );
  //Moving the start date based on the current month
  currentHijriMonth = firstDayofMonthHijri.month() - 1;
  var newStartDate = new Date( monthStartDateJS.getTime() - bb );
  startDateHijri = bbHijriCalendar.islamicCal.fromJSDate( newStartDate );
  
  return [  newStartDate, currentHijriMonth, firstDayofMonthHijri ];
};

bbHijriCalendar._copyHijriCalendar = function( hijriCalendar ) 
{
  var newHijriDate =  bbHijriCalendar.islamicCal.newDate();
  newHijriDate._month = hijriCalendar.month();
  newHijriDate._year = hijriCalendar.year();
  newHijriDate._day = hijriCalendar.day();
  return newHijriDate;
};

/**
 * Modify the Month View
 */
bbHijriCalendar._monthViewUpdate = function( view, fdotw, cellClasses )
{
  // visEnd is one day extra deleting the extra date.
  var currentEndDate = new Date( view.visEnd.getTime() - bbCalendar.ONEDAY_TIME );
  var startDateHijri = bbHijriCalendar.islamicCal.fromJSDate( view.visStart );
  var endDateHijri = bbHijriCalendar.islamicCal.fromJSDate( currentEndDate );
  
  var today = new Date();
  today.setHours( 0, 0, 0, 0 );

  // Current Month and year of the month displayed
  var monthDetails = bbHijriCalendar._getHijriMonthStartDate(  view.visStart ) ;
  view.visStart = monthDetails[0];
  var currentHijriMonth =  monthDetails[1];
  var firstDayofMonthHijri =  monthDetails[2];
  
  var currentDate = view.visStart;

  // Get all the month date cell
  for ( var i = 0; i < view.getRowCnt(); i++ )
  {
    var rowCell = $j( ".fc-view-month" ).find( ".fc-week" + i );
    for ( var j = 0; j < view.getColCnt(); j++ )
    {
      //Calculate the current column based of the First day of the week
      var col = fdotw + j;
      if ( col >= view.getColCnt() )
      {
        col = col - view.getColCnt();
      }
      //Find the cell based on the column calculated above
      var _cell = rowCell.find( cellClasses[ col ] );

      var hijriDate = bbHijriCalendar.islamicCal.fromJSDate( currentDate );
      
      _cell.find( ".fc-day-number" ).html( bbHijriCalendar.getHtmlBasedOnCalendarType( bbHijriCalendar.convertNumbers(""+ currentDate.getDate() ), bbHijriCalendar.convertNumbers( ""+hijriDate.day() )  )  );

      if ( bbHijriCalendar.hijriDisplay )
      {
        //Change the classes only if the Hijri is the Primary display
        if ( today.getTime() === currentDate.getTime() )
        {
          _cell.addClass( "fc-today" );
          _cell.addClass( "fc-state-highlight" );
        }
        else
        {
          _cell.removeClass( "fc-today" );
          _cell.removeClass( "fc-state-highlight" );
        }
        if ( ( hijriDate.month() - 1 ) !== currentHijriMonth )
        {
          _cell.addClass( "fc-other-month" );
        }
        else
        {
          _cell.removeClass( "fc-other-month" );
        }
      }
      // Move to the next date
      currentDate = new Date( currentDate.getTime() + bbCalendar.ONEDAY_TIME );
    }
  }

  //Using the exsting title for the Gregorian Date 
  var gMonthTitle = $j( ".fc-header-title" ).find("h2").html();
  var hMonthTitle = bbHijriCalendar.formatIslamicDate( bbCalendar.fcOptions.titleFormat.month, firstDayofMonthHijri );

  // Default to Hijri Month
  var monthTitle = hMonthTitle;
  bbCalendar.currentHijriMonth = bbHijriCalendar._copyHijriCalendar( firstDayofMonthHijri );

  //Calculate the Title to be displayed
  if ( bbCalendar.calendarType === 'GREGORIAN_HIJRI' )
  {
    // For Dual display the first and the last month
    // If start and end year are same display only once
    if ( startDateHijri.year() === endDateHijri.year() )
    {
      hMonthTitle = bbHijriCalendar.monthNamesHijri[ startDateHijri.month() - 1] + " - " +
      bbHijriCalendar.monthNamesHijri[ endDateHijri.month() - 1 ] + "  " + endDateHijri.year();
    }
    else
    {
      // Years are different so display along with year
      hMonthTitle = bbHijriCalendar.monthNamesHijri[ startDateHijri.month() - 1 ] + "  " + startDateHijri.year() + " - " +
      bbHijriCalendar.monthNamesHijri[ endDateHijri.month() - 1 ] + "  " + endDateHijri.year();
    }
    monthTitle = gMonthTitle + ' (' + hMonthTitle.trim() + ') ';
  }
  else if ( bbCalendar.calendarType === 'HIJRI_GREGORIAN' )
  {
    if ( view.visStart.getFullYear() === currentEndDate.getFullYear() )
    {
      gMonthTitle = bbCalendar.monthNames[ view.visStart.getMonth() ] + " - " +
               bbCalendar.monthNames[ currentEndDate.getMonth() ] + "  " + currentEndDate.getFullYear();
    }
    else
    {
      // Years are different so display along with year
      gMonthTitle = bbCalendar.monthNames[ view.visStart.getMonth() ] + "  " + view.visStart.getFullYear() + " - " +
               bbCalendar.monthNames[ currentEndDate.getMonth() ] + "  " + currentEndDate.getFullYear();
    }
    monthTitle = monthTitle + ' (' + gMonthTitle.trim() + ') ';
  }
  
  gMonthTitle = bbHijriCalendar.convertNumbers( gMonthTitle.trim() );
  hMonthTitle = bbHijriCalendar.convertNumbers( hMonthTitle.trim() );
  
  $j( ".fc-header-title" ).find("h2").html( bbHijriCalendar.getHtmlBasedOnCalendarType( gMonthTitle, hMonthTitle  ) );
};

/**
 * Update the Week view with Hijri Dates
 */
bbHijriCalendar._weekViewUpdate = function( view, fdotw, cellClasses )
{
  if ( view.name !== 'agendaWeek' )
  {
    return;
  }
  // visEnd is one day extra deleting the extra date.
  var currentEndDate = new Date( view.visEnd.getTime() - bbCalendar.ONEDAY_TIME );
  var startDateHijri = bbHijriCalendar.islamicCal.fromJSDate( view.visStart );
  var endDateHijri = bbHijriCalendar.islamicCal.fromJSDate( currentEndDate );
  // Title
  var titleH2 = $j( ".fc-header-title" ).find( "h2" );
  var hijriTitle = null;
  var gregorianTitle =  bbHijriCalendar.convertNumbers( titleH2.html() );
  var timeSlots = $j(".fc-view-agendaWeek").find(".fc-agenda-slots").find(".fc-agenda-axis");
  bbHijriCalendar._updateTimeSlots(  timeSlots );
  var cDate = view.visStart;

  hijriTitle = bbHijriCalendar.formatIslamicDates( bbCalendar.fcOptions.titleFormat.week, startDateHijri, endDateHijri );
  titleH2.html( bbHijriCalendar.getHtmlBasedOnCalendarType( gregorianTitle, hijriTitle ) );
  headerCells = $j( ".fc-view-agendaWeek" ).find( ".fc-agenda-days" ).find( ".fc-widget-header" );
  
  // Calculate the Cells for the week
  var weekHeader = $j( ".fc-view-agendaWeek" ).find( ".fc-agenda-days" ).find( "thead" );
  for ( var j1 = 0; j1 < view.getColCnt(); j1++ )
  {
    var col = fdotw + j1;
    if ( col >= view.getColCnt() )
    {
      col = col - view.getColCnt();
    }

    var _weekCell = weekHeader.find( cellClasses[ col ] );
    var hijriWeekDate = bbHijriCalendar.islamicCal.fromJSDate( cDate );
    //Update Date with corrected formated value
    
    var hhtmlWeek = "";
    var ghtmlWeek = "";

    var dualFormat =  bbCalendar.fcOptions.columnFormat.week.replace( "ddd","" ); 
    if ( bbCalendar.calendarType === 'GREGORIAN_HIJRI' )
    {
      ghtmlWeek = bbHijriCalendar.convertNumbers( $j.fullCalendar.formatDate(cDate, bbCalendar.fcOptions.columnFormat.week, bbHijriCalendar.localizedNames) );
      hhtmlWeek = bbHijriCalendar.formatIslamicDate( dualFormat, hijriWeekDate ) ;
    }
    else if ( bbCalendar.calendarType === 'HIJRI_GREGORIAN' )
    {
      ghtmlWeek = bbHijriCalendar.convertNumbers( $j.fullCalendar.formatDate(cDate, dualFormat, bbHijriCalendar.localizedNames) );
      hhtmlWeek = bbHijriCalendar.formatIslamicDate( bbCalendar.fcOptions.columnFormat.week, hijriWeekDate ) ;
    }
    else if ( bbCalendar.calendarType === 'HIJRI' )
    {
      hhtmlWeek = bbHijriCalendar.formatIslamicDate( bbCalendar.fcOptions.columnFormat.week, hijriWeekDate ) ;
    }
    _weekCell.html( bbHijriCalendar.getHtmlBasedOnCalendarType(ghtmlWeek,  hhtmlWeek  )  );

    cDate = new Date( cDate.getTime() + bbCalendar.ONEDAY_TIME );
  }
};

/**
 * Update the Day view with Hijri Dates
 */
bbHijriCalendar._dayViewUpdate = function( view, fdotw, cellClasses )
{
  if ( view.name !== 'agendaDay' )
  {
    return;
  }
  // Title
  var titleH2 = $j( ".fc-header-title" ).find( "h2" );
  var timeSlots = $j(".fc-view-agendaWeek").find(".fc-agenda-slots").find(".fc-agenda-axis");
    //Day view only One cell to modify 
  var dayCell = $j( ".fc-view-agendaDay" ).find( ".fc-agenda-days" ).find( "thead" ).find( ".fc-col0" );
  var hijriDayDate = bbHijriCalendar.islamicCal.fromJSDate( view.visStart );
  var cDate = view.visStart;
  //Update Date with corrected formated value
  var index =  bbCalendar.fcOptions.titleFormat.day.indexOf("dddd");
  var dualFormatTitle = bbCalendar.fcOptions.titleFormat.day.substring(0,index) +  bbCalendar.fcOptions.titleFormat.day.substring( index+5 );
  
  var hijriTitle = bbHijriCalendar.formatIslamicDate( bbCalendar.fcOptions.titleFormat.day, hijriDayDate );
  var gregorianTitle = "";
  var hhtmlDay = "";
  var ghtmlDay = "";

  var dualFormatDay =  bbCalendar.fcOptions.columnFormat.day.replace( "dddd","" );
  //Setting the title 
  if ( bbCalendar.calendarType === 'GREGORIAN_HIJRI' )
  {
    ghtmlDay = bbHijriCalendar.convertNumbers( $j.fullCalendar.formatDate(cDate, bbCalendar.fcOptions.columnFormat.day, bbHijriCalendar.localizedNames ) );
    hhtmlDay = bbHijriCalendar.formatIslamicDate( dualFormatDay, hijriDayDate ) ;
    hijriTitle = bbHijriCalendar.formatIslamicDate( dualFormatTitle, hijriDayDate ) ;
    gregorianTitle = bbHijriCalendar.convertNumbers ( $j.fullCalendar.formatDate(cDate, bbCalendar.fcOptions.titleFormat.day, bbHijriCalendar.localizedNames) );
  }
  else if ( bbCalendar.calendarType === 'HIJRI_GREGORIAN' )
  {
    ghtmlDay =  bbHijriCalendar.convertNumbers( $j.fullCalendar.formatDate( cDate, dualFormatDay, bbHijriCalendar.localizedNames ) );
    hhtmlDay = bbHijriCalendar.formatIslamicDate( bbCalendar.fcOptions.columnFormat.day, hijriDayDate ) ;
    gregorianTitle =  bbHijriCalendar.convertNumbers( $j.fullCalendar.formatDate( cDate, dualFormatTitle, bbHijriCalendar.localizedNames ) );
  }
  else if ( bbCalendar.calendarType === 'HIJRI' )
  {
    hhtmlDay = bbHijriCalendar.formatIslamicDate( bbCalendar.fcOptions.columnFormat.day, hijriDayDate ) ;
  }
  
  dayCell.html( bbHijriCalendar.getHtmlBasedOnCalendarType( ghtmlDay, hhtmlDay )  );
  titleH2.html( bbHijriCalendar.getHtmlBasedOnCalendarType( gregorianTitle, hijriTitle ) );
  timeSlots = $j(".fc-view-agendaDay").find(".fc-agenda-slots").find(".fc-agenda-axis");
  bbHijriCalendar._updateTimeSlots(  timeSlots );
};

/**
 * Pass the new text based on the Calendar Type
 */
bbHijriCalendar.getHtmlBasedOnCalendarType = function( gregorianTxt, hijriTxt )
{
  // Calendar type Hijri
  var text = hijriTxt;
  if ( bbCalendar.calendarType === 'GREGORIAN_HIJRI' )
  {
    text = gregorianTxt.trim() + ' (' + hijriTxt.trim() + ') ';
  }
  else if ( bbCalendar.calendarType === 'HIJRI_GREGORIAN' )
  {
    text = hijriTxt.trim() + ' (' + gregorianTxt.trim() + ') ';
  }
  else if ( bbCalendar.calendarType === 'GREGORIAN' )
  {
    text = gregorianTxt.trim();
  }
  return text;
};

/**
 * Update time slots
 */
bbHijriCalendar._updateTimeSlots = function( timeSlots )
{
  timeSlots.each( function( i, _cell )
  {
      var cell = $j(_cell);
      if ( !cell.parent().hasClass("fc-minor") ) 
      {
        var newValue = bbHijriCalendar.convertNumbers( cell.html() );
        newValue = newValue.toLowerCase().replace( "am", bbHijriCalendar.AMPM[ 0 ] );
        newValue = newValue.toLowerCase().replace( "pm", bbHijriCalendar.AMPM[ 1 ] );
        cell.html( newValue );
      }
  } );
};

/**
 * Update Calendar with the Localized dates 
 */
bbHijriCalendar._numberOnly = function( view, cellClasses, fdotw )
{
  //The Date need not change, but if the locale has number format, need to change it to according to Locale
  if ( bbHijriCalendar.numbersLocale )
  {
    //Need to convert the numbers 
    if ( view.name === 'month' )
    {
      var mtitle = $j( ".fc-header-title" ).find("h2");
      mtitle.html( bbHijriCalendar.convertNumbers( mtitle.html() ) );
      for ( var i1 = 0; i1 < view.getRowCnt(); i1++ )
      {
        var currentRow = $j( ".fc-view-month" ).find( ".fc-week" + i1 );
        for ( var m = 0; m < view.getColCnt(); m++ )
        {
          var currentCol = fdotw + m;
          if ( currentCol >= view.getColCnt() )
          {
            currentCol = currentCol - view.getColCnt();
          }
          var currentCell = currentRow.find( cellClasses[ currentCol ] );
          var anchor = currentCell.find( ".fc-day-number" );
          anchor.html( bbHijriCalendar.convertNumbers( anchor.html() ) );
        }
      }
    } 
    else if ( view.name === 'agendaDay' || view.name === 'agendaWeek' )
    { 
      var titileH2 = $j( ".fc-header-title" ).find( "h2" );
      var timeSlots = $j(".fc-view-agendaWeek").find(".fc-agenda-slots").find(".fc-agenda-axis");
       if ( view.name === 'agendaWeek' )
      {
        var weekHeader = $j( ".fc-view-agendaWeek" ).find( ".fc-agenda-days" ).find( "thead" );
        for ( var w = 0; w < view.getColCnt(); w++ )
        {
          var col = fdotw + w;
          if ( col >= view.getColCnt() )
          {
            col = col - view.getColCnt();
          }
          var weekCell = weekHeader.find( cellClasses[ col ] );
          weekCell.html( bbHijriCalendar.convertNumbers(  weekCell.html() ) );
        }
      } else
      {
        //Day view only One cell to modify 
        var dayCell = $j( ".fc-view-agendaDay" ).find( ".fc-agenda-days" ).find( "thead" ).find( ".fc-col0" );
        dayCell.html(  bbHijriCalendar.convertNumbers(  dayCell.html() ) );
        timeSlots = $j(".fc-view-agendaDay").find(".fc-agenda-slots").find(".fc-agenda-axis");
      } 
      titileH2.html( bbHijriCalendar.convertNumbers(  titileH2.html() ) );
      bbHijriCalendar._updateTimeSlots(  timeSlots );
    }
  }
};

/**
 * Returns the formated date string of Javascript date to Islamic Date format
 */
bbHijriCalendar.formatToIslamicDate = function( format, date )
{
  var hijriDate = bbHijriCalendar.islamicCal.fromJSDate( date );
  return bbHijriCalendar.formatIslamicDates( format, hijriDate, null, date );
};
/**
 * Returns the formated date string of the Islamic Date
 */
bbHijriCalendar.formatIslamicDate = function( format, date1, jsDateWithTime )
{
  return bbHijriCalendar.formatIslamicDates( format, date1, null, jsDateWithTime );
};

/**
 * Returns the formated date String of Islamic Dates. 
 */
bbHijriCalendar.formatIslamicDates = function( format, date1, date2, jsDateWithTime )
{
  var localizeSettings =
  {};
  localizeSettings.dayNamesShort = bbCalendar.dayNamesShort;
  localizeSettings.dayNames = bbCalendar.dayNames;
  localizeSettings.monthNamesShort = bbHijriCalendar.monthNamesShortHijri;
  localizeSettings.monthNames = bbHijriCalendar.monthNamesHijri;

  /* 
   * datetimeformat: "MM/dd/yyyy hh:mm a", isoformat : "yyyy-MM-dd'T'HH:mm:ss"
   */
  var tformat1 = " hh:mm a";
  var tformat2 = "'T'HH:mm:ss";
  var tformat3 = "HH:mm";
  var tformat4 = " mm:hh a";
  var timeFormat = "";
  if ( jsDateWithTime )
  {
    if ( format.indexOf (tformat1)  !== -1 )
    {
      format = format.replace(tformat1, "");
      timeFormat = formatDate( jsDateWithTime, tformat1 );
    } else if (  format.indexOf (tformat2)  !== -1 )
    {
      format = format.replace(tformat2 ,"");
      timeFormat = formatDate( jsDateWithTime, tformat2  );
    } else if (  format.indexOf (tformat3)  !== -1 )
    {
      format = format.replace(tformat3 ,"");
      timeFormat = formatDate( jsDateWithTime, tformat3  );
    } else if (  format.indexOf (tformat4)  !== -1 )
    {
      format = format.replace(tformat4 ,"");
      timeFormat = formatDate( jsDateWithTime, tformat4  );
    }
    timeFormat = timeFormat.replace("AM", bbHijriCalendar.AMPM[0]);
    timeFormat = timeFormat.replace("PM", bbHijriCalendar.AMPM[1]);
  }
  if ( date2 === null )
  {
    return bbHijriCalendar.convertNumbers( bbHijriCalendar.islamicCal.formatDate( bbHijriCalendar.getIslamicFormat( format ), date1, localizeSettings ) + timeFormat );
  }
  // 2 days passed format the days seperately
  //Time format not valid for 2 days
  var i1 = format.indexOf( "{" );
  var i2 = format.indexOf( "}" );

  var monthFormat = "[ MMM]";
  var yearFormat = "[ yyyy]";

  //MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}
  var f1 = format.substring( 0, i1 );
  var f2 = format.substring( i1 + 1, i2 );
  var f3 = null;
  
  if ( i2 + 1 !== format.length )
  {
    //d{'&#8212;'d[ MMM][ yyyy]} MMM yyyy
    f1 = format.substring( 0, i1 );
    f3 = format.substring( i2 + 1, format.length ) ;
  } 
  
  if ( date1.month() == date2.month() )
  {
    // If month are same remove the month 
    i1 = f1.indexOf( monthFormat );
    if ( i1 !== -1 )
      f1 = f1.substring( 0, i1 ) + f1.substring( i1 + monthFormat.length );
    i1 = f2.indexOf( monthFormat );
    if ( i1 !== -1 )
      f2 = f2.substring( 0, i1 ) + f2.substring( i1 + monthFormat.length );
  }
  else
  {
    // The months are different remove [ ]
    f1 = f1.replace( monthFormat, " MMM" );
    f2 = f2.replace( monthFormat, " MMM" );
  }
  if ( date1.year() == date2.year() )
  {
    // If year are same remove the year
    i1 = f1.indexOf( yearFormat );
    if ( i1 !== -1 )
      f1 = f1.substring( 0, i1 ) + f1.substring( i1 + yearFormat.length );
    i1 = f2.indexOf( yearFormat );
    if ( i1 !== -1 )
      f2 = f2.substring( 0, i1 ) + f2.substring( i1 + yearFormat.length );
  }
  else
  {
    // The year are different remove [ ]
    f1 = f1.replace( yearFormat, " yyyy" );
    f2 = f2.replace( yearFormat, " yyyy" );
  }
  var format1 = bbHijriCalendar.islamicCal.formatDate( bbHijriCalendar.getIslamicFormat( f1 ), date1, localizeSettings );
  var format2 = bbHijriCalendar.islamicCal.formatDate( bbHijriCalendar.getIslamicFormat( f2 ), date2, localizeSettings );
  var format3 = "";
  if ( f3 )
  {
    format3 = bbHijriCalendar.islamicCal.formatDate( bbHijriCalendar.getIslamicFormat( f3 ), date1, localizeSettings );
  }

  return bbHijriCalendar.convertNumbers( format1 + format2  + format3 );
};

//Converts the Current format to the Hijri Format
bbHijriCalendar.getIslamicFormat = function( format )
{
  /*
   * The format is different from the jQuery Formatter so converting to islamic Format 
   * # d - date number ( e.g. 7 )                 -> d 
   * # dd - date number, 2 digits ( e.g. 07 )     -> dd 
   * # ddd - day name, short ( e.g. Mon )         -> D 
   * # dddd - day name, full (e.g. Monday )       -> DD 
   * # M - month number ( e.g. 3 )                -> m 
   * # MM - month number, 2 digits ( e.g. 03 )    -> mm 
   * # MMM - month name, short ( e.g. Feb )       -> M 
   * # MMMM - month name, full ( e.g. February )  -> MM 
   * # yy - year, 2 digits ( e.g.14 )             -> yy 
   * # yyyy - year, 4 digits ( e.g. 2014 )        -> yyyy
   */  

  //Check if this has Time format
  // Date Formating
  var islamicFormat = format.replace( "dddd", "DD" );
  islamicFormat = islamicFormat.replace( "ddd", "D" );

  // Month Formating
  if ( format.indexOf( "MMMM" ) !== -1 )
  {
    islamicFormat = islamicFormat.replace( "MMMM", "MM" );
  }
  else if ( format.indexOf( "MMM" ) !== -1 )
  {
    islamicFormat = islamicFormat.replace( "MMM", "M" );
  }
  else if ( format.indexOf( "MM" ) !== -1 )
  {
    islamicFormat = islamicFormat.replace( "MM", "mm" );
  }
  else if ( format.indexOf( "M" ) !== -1 )
  {
    islamicFormat = islamicFormat.replace( "M", "m" );
  }
  return islamicFormat;
};


//Modify the Gregorian Display to Hijri Display for the Date Picker
bbHijriCalendar.hijriDatepicker = function( inst  )
{
  var calDiv = inst.dpDiv;
  if ( !bbHijriCalendar.hijriDisplay )
  {
    //The Date need not change, but if the locale has number format, need to change it to according to Locale
    if ( bbHijriCalendar.numbersLocale )
    {
      //Need to convert the numbers 
      var tdCells = calDiv.find( "td" );
      tdCells.each( function( i, _cell )
      {
        var cell = $j( _cell );
        var anchor = cell.find("a") ;
        if ( anchor && anchor.length === 1 )
        {
          var currentDate = anchor.html();
          if ( currentDate )
          {
            //Set the attribute the same as the current date display
            cell.attr( 'data-day', currentDate  );
            anchor.html( bbHijriCalendar.convertNumbers( currentDate ) );
          }
        }
       } );
    }
    calDiv.find( ".ui-datepicker-year" ).html(  bbHijriCalendar.convertNumbers(calDiv.find( ".ui-datepicker-year" ).html() ) ) ;
    return;
  }
  var today = bbHijriCalendar.islamicCal.newDate();

  //Getting all the Cells in the Picker
  var headerCells = calDiv.find( "[data-year]" );
  if ( headerCells.length <= 0 )
    return;
  
  var selectedYear = inst.selectedYear;
  var selectedMonth = inst.selectedMonth;
  
  var selectedDateStr = "";
  if ( inst.selectedMonth < 9 )
    selectedDateStr += "0";
  selectedDateStr +=  (inst.selectedMonth  + 1 ) +"/";
  
  if ( inst.selectedDay < 10 )
    selectedDateStr += "0";
  selectedDateStr +=  inst.selectedDay  +"/";
  
  selectedDateStr +=  inst.selectedYear ;
  
  var timeInMillis1 = getDateFromFormat( selectedDateStr, "MM/dd/yyyy" );
  var selectedDate = new Date(timeInMillis1);
  var hijriMonthStartDate =  bbHijriCalendar.islamicCal.fromJSDate( selectedDate );
  

  
  var todayDate = new Date();
  //Calcuating the next/previous click of the month. The data is not passed from the jQuery date pickers. 
  if ( !bbHijriCalendar.datePickerCurrentMonthHijri  || ( todayDate.getMonth() == selectedMonth && todayDate.getFullYear() == selectedYear )  )
  {
    //Get today's date for the Hijri Calendar
    hijriMonthStartDate = bbHijriCalendar.islamicCal.newDate();
    hijriMonthStartDate._day = 1;
  } else 
  {
    //Hijri Date picker is set, the render is either through Next or Previous
    var diff = hijriMonthStartDate.month() - bbHijriCalendar.datePickerCurrentMonthHijri.month() ;
    //Calculate the edge case 
    if ( diff === 11 )
    {
      diff = -1; //Previous
    } else if ( diff === -11 )
    {
      diff = 1; //Next
    }
    var newMonth = bbHijriCalendar.datePickerCurrentMonthHijri.month() + diff;
    //Calcuate the year for edge case
    var newYear = bbHijriCalendar.datePickerCurrentMonthHijri.year();
    if ( newMonth === 13 )
    {
      newMonth = 1; // Get the next year
      newYear = newYear + 1;
    } else if ( newMonth === 0 )
    {
      newMonth = 12;  //Previous year
      newYear = newYear - 1;
    }
    hijriMonthStartDate  = bbHijriCalendar.islamicCal.newDate();
    hijriMonthStartDate._month = newMonth;
    hijriMonthStartDate._year = newYear;
    hijriMonthStartDate._day = 1;
  }
  
  //Setting the data to using in the next/previous click 
  bbHijriCalendar.datePickerCurrentMonth = hijriMonthStartDate.month();
  bbHijriCalendar.datePickerCurrentYear = hijriMonthStartDate.year();
  bbHijriCalendar.datePickerCurrentMonthHijri = hijriMonthStartDate;
  
  var fdotw = parseInt( bbCalendar.firstDay, 10 );

    var hijriDaysInMonth = hijriMonthStartDate.daysInMonth();

    // Now Display the Hijri date
    var dayCells = calDiv.find( "td" );
    //Calcualte the Week Start date based on the First Day of the week
    var hijriDayOfWeek = hijriMonthStartDate.dayOfWeek() - fdotw;
    if ( hijriDayOfWeek < 0 )
    {
      hijriDayOfWeek = hijriDayOfWeek + 7;
    }

    //Setting the date selected by the user, so it is selected date is highlighted.  
    var pickedDateStr = "";
    if ( inst.currentMonth < 9 )
      pickedDateStr += "0";
    pickedDateStr +=  (inst.currentMonth  + 1 ) +"/";
    
    if ( inst.currentDay < 10 )
      pickedDateStr += "0";
    pickedDateStr +=  inst.currentDay  +"/";
    
    pickedDateStr +=  inst.currentYear ;

    var pickedDate = new Date( getDateFromFormat( pickedDateStr, "MM/dd/yyyy" ) );

    var started = false;
    var dayCount = 1;
    var jsDate = bbHijriCalendar.islamicCal.toJSDate( hijriMonthStartDate );
    dayCells.each( function( i, _cell )
    {
      var cell = $j( _cell );
      if ( dayCount <= hijriDaysInMonth & ( i === hijriDayOfWeek || started ) )
      {
        started = true;
        //This cell is not visible, it is part of other month so make it visible
        if ( cell.hasClass( 'ui-datepicker-other-month' ) )
        {
          cell.removeClass( "ui-datepicker-other-month" );
          cell.removeClass( "ui-datepicker-unselectable" );
          cell.removeClass( "ui-state-disabled" );
          cell.attr( 'data-event', 'click' );
          cell.attr( 'data-handler', 'selectDay' );
        }
        var aClass = 'ui-state-default';

        
        if ( today.day() === dayCount && today.month() == hijriMonthStartDate.month() && today.year() == hijriMonthStartDate.year() )
        {
          //Higlight today's date
          cell.addClass( "ui-datepicker-days-cell-over" );
          cell.addClass( "ui-datepicker-current-day" );
          cell.addClass( "ui-datepicker-today" );

          aClass = aClass + ' ui-state-highlight ui-state-active ui-state-hover ';
        } 
        if ( jsDate.getDate() === pickedDate.getDate() && jsDate.getFullYear()  === pickedDate.getFullYear() && jsDate.getMonth() === pickedDate.getMonth() )
        {
          //Selected date
          aClass = aClass + ' ui-state-active';
        }
        //Storing the Gegorian Date 
        cell.attr( 'data-day', jsDate.getDate() );
        cell.attr( 'data-year', jsDate.getFullYear() );
        cell.attr( 'data-month', jsDate.getMonth() );        
        var innerTxt = '<a class="' + aClass + '" href="#" role="button"> ' + bbHijriCalendar.convertNumbers( dayCount ) + '</a>';
        cell.html( innerTxt );

        dayCount = dayCount + 1;
        jsDate = new Date( jsDate.getTime() + bbCalendar.ONEDAY_TIME );
      }
      else if ( !cell.hasClass( 'ui-datepicker-other-month' ) )
      {
        cell.addClass( "ui-datepicker-other-month" );
        cell.addClass( "ui-datepicker-unselectable" );
        cell.addClass( "ui-state-disabled" );
        cell.removeAttr('data-day');
        cell.removeAttr('data-year');
        cell.removeAttr('data-month');
        cell.removeAttr('data-event');
        cell.removeAttr('data-handler');
        cell.html( ' ' );
      }
    } );

    // Check if all the dates are displayed 
    if ( dayCount <= hijriDaysInMonth )
    {
      //The month display not finished. Need to create a new row 
      var tbody = calDiv.find( "tbody" );
      var trLast = tbody.find( "tr:last" );
      var newRow = trLast.clone();
      trLast.after( newRow );
      dayCells = newRow.find( "td" );
      dayCells.each( function( i, _cell )
      {
        var cell = $j( _cell );
        if ( dayCount <= hijriDaysInMonth )
        {
          started = true;
          if ( cell.hasClass( 'ui-datepicker-other-month' ) )
          {
            newCell = true;
            cell.removeClass( "ui-datepicker-other-month" );
            cell.removeClass( "ui-datepicker-unselectable" );
            cell.removeClass( "ui-state-disabled" );
            //Added attributes
            cell.attr( 'data-year', jsDate.getFullYear() );
            cell.attr( 'data-month', jsDate.getMonth() );
            cell.attr( 'data-event', 'click' );
            cell.attr( 'data-handler', 'selectDay' );
          }

          var aClass = 'ui-state-default';
          if ( today.day() === dayCount && today.month() == hijriMonthStartDate.month() )
          {
            cell.addClass( "ui-datepicker-days-cell-over" );
            cell.addClass( "ui-datepicker-current-day" );
            cell.addClass( "ui-datepicker-today" );

            aClass = aClass + ' ui-state-highlight ui-state-active ui-state-hover ';
          }
          var innerTxt = '<a class="' + aClass + '" href="#" role="button">' + bbHijriCalendar.convertNumbers( dayCount ) + '</a>';
          cell.html( innerTxt );

          dayCount = dayCount + 1;
        }
        else if ( !cell.hasClass( 'ui-datepicker-other-month' ) )
        {
          cell.addClass( "ui-datepicker-other-month" );
          cell.addClass( "ui-datepicker-unselectable" );
          cell.addClass( "ui-state-disabled" );

          cell.html(' ' );
        }

      } );
    }
  
  calDiv.find( ".ui-datepicker-month" )
      .html( bbHijriCalendar.monthNamesHijri[ hijriMonthStartDate.month() - 1 ] );
  calDiv.find( ".ui-datepicker-year" ).html(  bbHijriCalendar.convertNumbers( hijriMonthStartDate.year() ) );
};


//Change the Date String to Hijri date, and this is called when the dates are updated. 
bbHijriCalendar.hijriDateForEvents = function( event )
{
  Event.stop( event );
  var gregorianDate = this.value;
  
  //Finding the correct format in which the date was passed
  var format = bbHijriCalendar.eventDisplayDateTimeFormat; //dd/MM/yyyy hh:mm a
  var f1 = format;
  if ( bbCalendar.isRTL )
  {
    f1 = bbHijriCalendar.eventDisplayDateTimeFormatRTL;
  }  
  // If all day is selected, not time is passed
  if ( $j( "#eventallday" ).is( ':checked' ) || $j( "#endsOnOn" ).is( ':checked' ) )
  {
    format = bbHijriCalendar.eventDisplayDateFormat; // dd/MM/yyyy
    f1 = format;
    if ( bbCalendar.isRTL )
    {
      f1 = bbHijriCalendar.eventDisplayDateFormatRTL;
    }
  }
  var timeInMillis = getDateFromFormat( gregorianDate, format );
  // Passed date is not valid could be the formated dates
  if ( timeInMillis === 0 )
  {
    return gregorianDate;
  }
  
  //Using the correct format to parse the date
  var tmpDate = new Date( timeInMillis );
  
  // The date display is already converted no changes needed
  if ( bbHijriCalendar.numbersLocale && $j.inArray(gregorianDate[ 0 ], bbHijriCalendar.numbersLocale) != -1 )
  {
    bbHijriCalendar.convertTime();
    return gregorianDate;
  }
  if ( !bbHijriCalendar.hijriDisplay )
  {
    if ( bbHijriCalendar.numbersLocale )
    {
      //convert the date display
      var lstr = bbHijriCalendar.convertNumbers( formatDate( tmpDate, f1) ) ;
      this.value = lstr;
    }
    return gregorianDate;
  }

  try
  {
    var hijriDate = bbHijriCalendar.islamicCal.fromJSDate( tmpDate );
    this.value = bbHijriCalendar.formatIslamicDate( f1, hijriDate, tmpDate ) ;
    
    this.setAttribute( "data-modified", true );
    var gid = this.getAttribute( "data-gid" );
    var gregorianInput = $j( "#" + gid );
    gregorianInput.val( gregorianDate );
  }
  catch ( e )
  {
    //ignore if invalid islamic date, then the date passed is hijri
  }
};

bbHijriCalendar.convertTime = function(  )
{
  //If time picker is displayed. Convert the Time displayed in 
  var time = $j(".ui_tpicker_time");
  if ( time !== null )
  {
    var tmpTime = bbHijriCalendar.convertNumbers( time.html() ) ;
    tmpTime = tmpTime.replace("AM", bbHijriCalendar.AMPM[0]);
    tmpTime = tmpTime.replace("PM", bbHijriCalendar.AMPM[1]);
    time.html( tmpTime ); 
  }
};

bbHijriCalendar.convertNumbers = function( text )
{
  // The text passed has some special number like 24 Shaʿbān &#8212; Ramaḍān 1 1435. &#8212; should not be converted.
  var specialNumberStart = [ '#', '\\', '&'];
  var specialNumberEnd = [ ' ', '\'', ';' ];
  
  text = "" + text;
  if ( bbHijriCalendar.numbersLocale && text.length > 0 )
  {
    //Sometimes the text passed is a number so converting it to Character 
    var tmpNumber = "";
    var startSpecialNumber = false;
    for ( var i = 1; i <= text.length; i++ )
    {
      var currentChar = text.substring( i - 1, i );
      if ( $j.inArray(currentChar, specialNumberStart) != -1)
      {
        // Special Charecter starts don't change the number
        startSpecialNumber = true;
        tmpNumber = tmpNumber + currentChar;
        continue;
      }
      if ( startSpecialNumber )
      {
        // Check the end of the special number
        if ( $j.inArray(currentChar, specialNumberEnd) != -1 )
        {
          startSpecialNumber = false;
        }
        tmpNumber = tmpNumber + currentChar;
        continue;
      }
      if ( !isNaN( currentChar.trim() ) && currentChar.trim() !== "" )
      {
        var tNum = parseInt( currentChar, 10 );
        //Convert the current number based on the Locale
        tmpNumber = tmpNumber + bbHijriCalendar.numbersLocale[ tNum ];
      }
      else
      {
        tmpNumber = tmpNumber + currentChar;
      }
    }
    tmpNumber = tmpNumber.replace("AM", bbHijriCalendar.AMPM[0]);
    tmpNumber = tmpNumber.replace("PM", bbHijriCalendar.AMPM[1]);
    return tmpNumber;
  }
  return text;
};

bbHijriCalendar.isLeapYear = function( inputYear )
{
  var cycle30 = inputYear/30;
  var roundVal = (Math.floor( inputYear / 30 ) ); 
  var remain = cycle30 - roundVal;
  var newYearVal  = (Math.floor(remain * 30));
  
  var str = "2,5,7,10,13,16,18,21,24,26,29";
  var split_str = str.split(",");
  if ( $j.inArray("" +newYearVal, split_str) != -1 )
  {
      return true;
  }
  return false;
};