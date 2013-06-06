jQuery.fn.externalLinkify = function (){
  return this.each(function(){
    $target = $(this);
    //Force any outside link to be target blank
    $target.find('a[href^=http]:not([href*=theloop])').not('[href*=xls]').attr('target', '_blank')

    //Add title to target blank links which do not have titles
    $target.find('a[target="_blank"]:not([title])').attr('title', 'This link will open in a new window')

    //Add icon to outside link
    $target.find('img.externalLink').remove() //pull out existing icons
    $target.find('a.[href^=http]:not([href*=theloop])').not('a[href$=pdf]').not('a[href$=pdf]').append('<img class="externalLink" src="/ssrc/PublishingImages/icons/iconExternalLink.gif" align="absmiddle" title="Clicking on this link leave The Loop" style="margin-left:3px;"/>');

  });

}

// http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript/
function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

// In SP2010 this will be your subsite eg: '/mysubsite/evendeeper'
// Allows us to keep this code directory agnostic
var L_Menu_BaseUrl = L_Menu_BaseUrl || '';

jQuery(function($){
  var ptable = $('#procedures');
  // Template for displaying the detailed view of a procedure
  var procedureTemplate = Handlebars.compile($("#procedure-template").html());

  // displaying detailed view is handled by hash changes
  window.onhashchange = function(){
    var hash = History.getHash();
    if(!hash) return;
    var procedure = procedureFromSlug(hash);
    showProcedure(procedure);
    hideTable();
  };
  // First page load we'll look for a hash
  $(window).on('proceduresReady', function(){
    var hash = History.getHash();
    if(!hash) return;
    var procedure = procedureFromSlug(hash);
    showProcedure(procedure);
    hideTable();
  });

  $.getJSON(L_Menu_BaseUrl + "/_vti_bin/listdata.svc/Procedures",function(data){
    function linkToShowPolicy(topic, slug) {
      return '<a href="#' + slug + '" class="policy">' + topic + '</a>';
    }
    var slugList = {};

    var advisories = $.map(data.d.results, function(advisory, i) {
      var topic = advisory.Topic;
      var slug = string_to_slug(topic);
      var links = [];
      var data = {
        title: topic,
        text: advisory.Policy || 'no procedure yet',
        slug: slug,
        qrg: linkFromSP(advisory.QRG),
        olr: linkFromSP(advisory.OLR),
        links: links
      };

      data.topics = $.map(advisory.Topics.results, function(topic) {
        return topic.Value;
      });

      slugList[slug] = i;

      if(advisory.QRG) links.push(data.qrg);
      if(advisory.OLR) links.push(data.olr);
      if(advisory.EAAct) concatLinks(links, advisory.EAAct);
      if(advisory.EARegulations) concatLinks(links, advisory.EARegulations);
      if(advisory.EAWPAct) concatLinks(links, advisory.EAWPAct);
      if(advisory.EAPWDRegulations) concatLinks(links, advisory.EAPWDRegulations);

      return [[
        linkToShowPolicy(topic, slug),
        data.topics.join(', '),
        // for dataTables to search
        data.text,
        // for access to raw data later
        data
      ]];
      function concatLinks(targetArray, html){
        $(html).find('a').each(function() {
          targetArray.push('<a href="' + this.href + '">' + this.innerText + '</a>');
        });
      }
    });

    ptable.show()
      .data('slugList', slugList)
      .dataTable({
        "bJQueryUI": true,
        "aaData": advisories,
        "oLanguage": {
          "sSearch": "Search Content:"
        },
        "aoColumns" : [
          { "sType": "html" },
          null,
          { "bVisible": false },
          { "bVisible": false }
        ]
      });
    $('#procedure-pulltab')
      .hide()
      .button({
        icons: {
          primary: "ui-icon-triangle-1-s"
        }
      })
      .toggleClass('ui-corner-all ui-corner-bottom')
      .on('click', showTable);

    $(window).trigger('proceduresReady');

    $.getJSON(L_Menu_BaseUrl + "/_vti_bin/listdata.svc/ProceduresTopics",function(data){
      var topics = $.map(data.d.results, function(topic, i) {
        return { id: topic.Value, text: topic.Value };
      });

      $('<div id="topic-filter">')
        .insertAfter('#procedures_length')
        .select2({
          data: topics,
          placeholder: "Filter by topic...",
          allowClear: true,
          multiple: true,
          width: 200
        }).
        on('change', function(e) {
          var topicString = e.val.join(' ');
          ptable.fnFilter(topicString, 1);
        });
    });
  });


  // SP links come as a string 'https://www.google.ca/, Google'
  function linkFromSP(spLinkString) {
    if(!spLinkString) return '';
    var match = spLinkString.match(/([^,]*), (.*)/);

    return match? '<a href="' + match[1] + '">' + match[2] + '</a>': '';
  }
  function procedureFromSlug(slug){
    var slugList = ptable.data('slugList');
    var rowIndex = slugList[slug];

    return ptable.fnGetData(rowIndex)[3];
  }
  function showProcedure(procedure){
    var content = procedureTemplate(procedure);

    $('#procedurePanel').html(content);

   /* var linksPanel = $('#linksPanel').html('<h2>' + advisories[idx][2]  + ' Links</h2>' + procedureLinks[idx]);
    externalLinkify(linksPanel);
    linksPanel.externalLinkify();
    if(query){
      $('#procedurePanel').highlight(query);
    }
    $pTable.find('tr').removeClass('highlight');
    $(this).closest('tr').addClass( 'highlight' );
*/
  }
  function showTable(){
    $('#procedure-pulltab').hide();
    $('#procedures_wrapper').slideDown();
  }
  function hideTable(){
    $('#procedure-pulltab').show();
    $('#procedures_wrapper').slideUp();
  }
});
