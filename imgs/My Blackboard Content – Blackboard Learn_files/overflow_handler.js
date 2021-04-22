var overflow_handler =
{
  RESIZE_DELAY : 300,

  init: function( listId, getMaxHeight )
  {
    this.getMaxHeight = getMaxHeight.bind( this );

    this.list = $( listId );

    this.moreLink = this.list.down( 'li.more-link' );
    this.moreBox  = this.list.next( 'ul.more-tools' );

    this.resizeTimeout = false;

    var listItems = this.list.select('li');
    if ( listItems && listItems.size() > 0 )
    {
      Event.observe( window, "resize", this.onWindowResize.bind( this ) );
      this.moreLink.observe( "click", this.onMoreLinkClick.bind( this ) );
      this.resizeList();
    }
  },

  onWindowResize : function()
  {
    if ( this.moreBox.visible() )
    {
      this.moreBox.hide();
    }

    if ( this.resizeTimeout !== false )
    {
      clearTimeout( this.resizeTimeout );
    }

    this.resizeTimeout = setTimeout( this.resizeList.bind( this ), overflow_handler.RESIZE_DELAY );
  },

  resizeList : function()
  {
    // move all shortcuts out back to shortcut list first to start over
    var moreboxItems = this.moreBox.select( 'li' );
    if ( moreboxItems.size() > 0 )
    {
      moreboxItems.each( function( item )
      {
        this.moreLink.insert( { before : item } );
      }.bind( this ));
    }

    var listItems = this.list.select('li');
    var maxHeight = this.getMaxHeight.call();

    // more link is always hidden
    if ( listItems.length > 1 )
    {
      var listHeight = this.list.getHeight();

      // resize containing div
      var listContainer = this.list.up( 'div', 0 );
      if ( listContainer )
      {
        listContainer.setStyle( { height : maxHeight +'px'} );
      }
      else
      {
        this.list.setStyle( { height : maxHeight +'px'} );
      }

      // if list is taller than maxHeight
      if( listHeight > maxHeight)
      {
        this.moreLink.show();

        // start from the second to last list item (this avoids the More link, which is the last item in the list)
        // insert the items that overflow into a separate list - "more box"
        var i = listItems.size() - 2;
        while ( listHeight > ( maxHeight - 20 ) && i >= 0 )
        {
          // move one item to more box then re-measure list height
          this.moreBox.insert( { top: listItems[i] } );
          listHeight = this.list.getHeight();
          i--;
        }
      }

      if( this.moreBox.select( 'li' ).size() === 0 )
      {
        this.moreLink.hide();
      }
    }
  },

  onMoreLinkClick : function( event )
  {
    if ( !this.moreBox.visible() )
    {
      this.drawMoreBox();
    }
    else
    {
      this.moreBox.hide();
    }


    Event.element( event ).up().toggleClassName( 'active' );

    return false;

  },

  drawMoreBox : function()
  {
    // need to show it first to get heights
    this.moreBox.show();

    var items = this.moreBox.select( 'li' );
    var gridSize = Math.sqrt( items.size() );
    gridSize = Math.ceil( gridSize );

    var item = items[0];
    var itemHeight = item.getHeight() + item.style.paddingTop + item.style.paddingBottom;
    gridSize *= itemHeight;

    this.moreBox.setStyle( { height: gridSize +'px', width: gridSize +'px'} );
  }



};
