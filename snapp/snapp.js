var docLocation = document.location.href;
var foundLMSForum, foundLMSForumExpanded, LMS

/* Helper Functions */
function stripSpaces(x) {
	// Removes spaces from a string
	return (x.replace(/^\W+/,'')).replace(/\W+$/,'');
}

function stripHTML(oldString)
{
  var re= /<\S[^>]*>/g;
  return oldString.replace(re,"");
}

function getTextAfterChar(Text, charToStart)
{
	// Returns all characters in a string after the specified substring
	var len = Text.length;
	var posStart = Text.indexOf(charToStart);
	return Text.substring(posStart,len);
}

function getTextBetweenCharacters(Text, charsAtStart, charsAtEnd)
{
	// Returns all characters in a string between specified substrings
	var posStart = Text.indexOf(charsAtStart) + charsAtStart.length;
	var posEnd = Text.indexOf(charsAtEnd);
	return Text.substring(posStart,posEnd);
}

function getRequestVars()
{
	// Returns an array with all querystring parameters
	var request= new Array();
	var vals=location.search.substr(1).split("&");
	for (var i=0;i<vals.length;i++)
	{
		vals[i] = vals[i].replace(/\+/g, " ").split("=");
		request[unescape(vals[i][0])] = unescape(vals[i][1]);
	}
	return request;
}


function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}

function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}

/* SNAPP Central Processing Functions */

function GenerateGraphML(nodes,edges)
{
	// Generates a the Social Network Graph in the GraphML XML Format
  //alert("GenerateGraphML2() called!");
	var graphML;

	graphML = '<?xml version="1.0" encoding="UTF-8"?>\n';
	graphML += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
	graphML += '<graph id="G" edgedefault="directed">\n';
	// Generate the nodes
	nodeCOUNT = 1;
	for (person in nodes)
	{
		graphML += '<node id="' + person + '" order="' + nodes[person] + '" name="' + person +'"/>\n';
		nodeCOUNT += 1;
	}

	// Generate the edges (ie links between nodes)

	for (reply in edges)
	{
		fromToArray = reply.split("_");
		if (fromToArray.length>1)
		{
			graphML += '<edge source="' + fromToArray[0] + '" target="' + fromToArray[1] + '" count="' + edges[reply] + '"/>' + '\n';
		}
	}

	graphML += '</graph>\n';
	graphML += '</graphml>\n';

	return graphML;
}

function GenerateVNAFileFormat(nodes,edges)
{
	// Generates a the Social Network Graph in the GraphML XML Format

	var vnaBuilder = "";

	vnaBuilder += '*Node data\n';
	vnaBuilder += 'ID posts\n';

	// Generate the nodes
	for (person in nodes)
	{
		vnaBuilder += '"' + person + '" ' + nodes[person] +'\n';
	}

	// Generate the edges (ie links between nodes)

	vnaBuilder += '*Tie data\n';
	vnaBuilder += 'from to talk strength\n';


	for (reply in edges)
	{
		fromToArray = reply.split("_");
		if (fromToArray.length > 1)
		{
			vnaBuilder += '"' + fromToArray[0] + '" "' + fromToArray[1] + '" 1 ' + edges[reply] + '\n';
		}
	}

	return vnaBuilder;
}


/* Moodle Specific Functions */

function PerformSocialAnalysisMoodle()
{
	  allForumPostsTables = jQuery(".forumpost");
	  for (i=0; i < allForumPostsTables.length; i++)
	  {
			currentPost = allForumPostsTables[i];
	    authorObj = jQuery(".author-name a",currentPost);
	    posted_by = authorObj.html();

	    if (forumusers[posted_by])
	    {
		    forumusers[posted_by] = forumusers[posted_by] + 1;
	    }
	    else
	    {
		    forumusers[posted_by] = 1;
	    }

	    posted_on = jQuery(".author-date",currentPost).html();
	    posted_on = posted_on.substring(posted_on.indexOf(',')+2,posted_on.length);

			commandLinkObjs = jQuery(".commands a",currentPost);

			post_id = 0;
			reply_id = 0;

			if (commandLinkObjs.length == 2)
			{
				reply_id = 0;
				post_id = jQuery(commandLinkObjs[0]).attr('href');
				post_id = post_id.substring(post_id.indexOf('#p')+2,post_id.length);
			}
			else
			{
				post_id = jQuery(commandLinkObjs[2]).attr('href');
				post_id = post_id.substring(post_id.indexOf('=')+1,post_id.length);
				post_id = post_id.substring(0,post_id.indexOf('#'));
				reply_id = jQuery(commandLinkObjs[1]).attr('href');
				reply_id = reply_id.substring(reply_id.indexOf('#p')+2,reply_id.length);
			}

	    //console.log(" posted_by:" + posted_by + " postid:" + post_id + " replyid:" + reply_id);

			threadowners[post_id] = posted_by;

    	if (reply_id=="0")
    	{
      	reply_to = "-";
    	}
    	else
    	{
      	reply_to = threadowners[reply_id];
      	sna_relationship = posted_by + "_" + reply_to;
      	if (replies[sna_relationship])
      	{
        	replies[sna_relationship] += 1;
      	}
      	else
      	{
        	replies[sna_relationship] = 1;
      	}
    	}
    	totalposts = totalposts + 1;
  }
}

/* END Moodle Specific Functions */

/* Globals */
var forumusers = {};
var noforumusers = 0;
var postsbyusers = "";
var totalposts = 0;
var threadowners = {};
var replies = {};

/* Central Processing */
if ((docLocation.indexOf("mod/forum/discuss.php") != -1) || (docLocation.indexOf("mod/forum/view.php") != -1))
{
  console.log("Found Moodle")
  // Moodle Individual Thread View && Moodle Forum View with links to Multiple Threads
  foundLMSForum = "Yes"; foundLMSForumExpanded = "Yes"; LMS = "moodle";
	PerformSocialAnalysisMoodle();
	console.log(forumusers);
	console.log(replies);
	var vna_format = GenerateVNAFileFormat(forumusers,replies)
	var pom = document.createElement('a');
	var blob = new Blob([vna_format],{type: 'text/plain;charset=utf-8;'});
	var url = URL.createObjectURL(blob);
	pom.href = url;
	pom.setAttribute('download', 'sna_extract.vna');
	pom.click();
}
else
{
	alert("SNAPP has not found a forum to extract sna data from on this page.");
}
