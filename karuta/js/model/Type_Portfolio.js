/* =======================================================
	Copyright 2014 - ePortfolium - Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
   ======================================================= */
	
var portfolios_byid = {};
var portfolios_list = [];
var bin_list = [];

/// Check namespace existence
if( UIFactory === undefined )
{
  var UIFactory = {};
}


/// Define our type
//==================================
UIFactory["Portfolio"] = function( node )
//==================================
{
	this.id = $(node).attr('id');
	this.owner = $(node).attr('owner');
	this.node = node;
	this.code_node = $("code",$("asmRoot>asmResource[xsi_type='nodeRes']",node));
	this.date_modified = $(node).attr('modified');
	//------------------------------
	this.seerootnoderoles = $("metadata-wad",$("asmRoot",node)).attr('seenoderoles');
	if (this.seerootnoderoles==undefined)
		this.seerootnoderoles = "all";
	//------------------------------
	this.label_node = [];
	for (var i=0; i<languages.length;i++){
		this.label_node[i] = $("label[lang='"+languages[i]+"']",$("asmRoot>asmResource[xsi_type='nodeRes']",node)[0]);
		if (this.label_node[i].length==0) {
			var newElement = document.createElement("label");
			$(newElement).attr('lang', languages[i]);
			$(newElement).text(karutaStr[languages[languages[i]],'new']);
			$("asmResource[xsi_type='nodeRes']",node)[0].appendChild(newElement);
			this.label_node[i] = $("label[lang='"+languages[i]+"']",$("asmRoot>asmResource[xsi_type='nodeRes']",node)[0]);
		}
	}
	//------------------------------
	this.display = {};
	this.groups = [];
	this.roles = [];
};


/// Display

//==================================
UIFactory["Portfolio"].displayAll = function(destid,type,lang)
//==================================
{
	$("#"+destid).html("<table id='table_portfolio' class='tablesorter'><thead><th>label</th><th>code</th><th>date</th><th id='th_menus'></th></thead><tbody id='list_portfolios'></tbody></table>");
	$("#list_portfolios").append($("<tr><td></td><td></td><td></td></tr>")); // to avoid js error: table.config.parsers[c] is undefined
	for ( var i = 0; i < portfolios_list.length; i++) {
		if (portfolios_list[i]!=null) { // not removed
			var itemid = destid+"_"+portfolios_list[i].id;
			if (USER.creator || USER.admin || portfolios_list[i].seerootnoderoles.indexOf('all')>-1) {
				$("#list_portfolios").append($("<tr class='item' id='"+itemid+"'></tr>"));
				$("#"+itemid).html(portfolios_list[i].getView(destid,type,lang));
			} else {
				$.ajax({ // get group-role for the user
					Accept: "application/xml",
					type : "GET",
					dataType : "xml",
					url : "../../../"+serverBCK+"/credential/group/" + portfolios_list[i].id,
					success : function(data) {
						var usergroups = $("group",data);
						g_userrole = $("role",usergroups[0]).text();
						if (portfolios_list[i].seerootnoderoles.indexOf(g_userrole)>-1) {
							$("#list_portfolios").append($("<tr class='item' id='"+itemid+"'></tr>"));
							$("#"+itemid).html(portfolios_list[i].getView(destid,type,lang));
						}
					}
				});
			}
		}
	}
};

//==================================
UIFactory["Portfolio"].displayBin = function(destid,type,lang)
//==================================
{
	$("#"+destid).html("<table id='table_bin' class='tablesorter'><thead><th>label</th><th>code</th><th></th></thead><tbody id='list_bin'></tbody></table>");
	$("#list_bin").append($("<tr><td></td><td></td><td></td></tr>")); // to avoid js error: table.config.parsers[c] is undefined
	for ( var i = 0; i < bin_list.length; i++) {
		if (bin_list[i]!=null) { // not delete
			var itemid = destid+"_"+bin_list[i].id;
			$("#list_bin").append($("<tr class='item' id='"+itemid+"'></tr>"));
			$("#"+itemid).html(bin_list[i].getView(destid,type,lang));
		}
	}
};

//==================================
UIFactory["Portfolio"].prototype.getView = function(dest,type,langcode)
//==================================
{
	if (dest!=null) {
		this.display[dest]=true;
	}
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	var html = "";
	if (type=='list') {
		html += "<td>";
		//------------ portfolio label --------
		html += " <a href='main.htm?id="+this.id+"&edit=true&lang="+LANG+"'>"+this.label_node[langcode].text()+"</a> ";
		//------------ edit button ---------------
/*		if (this.groups.length>1)
		{
			for (var i=0;i<this.groups.length;i++){
				html += "<a class='btn btn-mini' href='main.htm?id="+this.id+"&edit=true' data-toggle='tooltip' data-placement='top' data-title='"+karutaStr[LANG]["button-edit"]+" - "+this.roles[i]+"'>";
				html += "<i class='icon-edit'></i>";
				html += "</a> ";
			}
		}
		else
		{
			var role = this.roles[0];
			if (role == undefined){
				if (USER.admin)
					role = "admin";
			}
			html += " <a class='btn btn-mini' href='main.htm?id="+this.id+"&group="+this.groups[0]+"&role="+role+"&lang="+languages[langcode]+"&edit=true' data-toggle='tooltip' data-placement='top' data-title='"+karutaStr[LANG]["button-edit"]+" - "+role+"'>";
			html += "<i class='icon-edit'></i>";
			html += "</a>";
		}*/
		html += "</td>";
		html += "<td>"+this.code_node.text()+"</td>";
		html += "<td>"+this.date_modified.substring(0,10)+"</td>";
		//------------ buttons ---------------
		html += "<td style='padding-left:10px'> ";
		if (USER.admin || this.owner=='Y') {
			html += "<div class='btn-group'>";
			html += "<a href='#' data-toggle='dropdown' class='btn  btn-mini dropdown-toggle'>&nbsp;<b class='caret'></b>&nbsp;</a>";
			html += "<ul class='dropdown-menu'>";
			html += "<li><a onclick=\"document.getElementById('wait-window').style.display='block';UIFactory['Portfolio'].copy('"+this.id+"','"+this.code_node.text()+"-copy',true)\" href='#'><i class='fa fa-file-o'></i><i class='fa fa-file-o'></i> "+karutaStr[LANG]["button-duplicate"]+"</a></li>";
			html += "<li><a onclick=\"document.getElementById('wait-window').style.display='block';UIFactory['Portfolio'].instantiate('"+this.id+"','"+this.code_node.text()+"-instance',true)\" href='#'><i class='fa fa-file-o'></i><i class='fa fa-file'></i> "+karutaStr[LANG]["button-instantiate"]+"</a></li>";
			html += "<li><a onclick=\"UIFactory['Portfolio'].remove('"+this.id+"')\" href='#'><i class='fa fa-trash-o'></i> "+karutaStr[LANG]["button-delete"]+"</a></li>";
			html += "<li><a onclick=\"UIFactory['Portfolio'].callShare('"+this.id+"')\" href='#'><i class='fa fa-share-square-o'></i> "+karutaStr[LANG]["addshare"]+"</a></li>";
			html += "<li><a onclick=\"UIFactory['Portfolio'].callUnShare('"+this.id+"')\" href='#'><i class='fa fa-times'></i><i class='fa fa-share-square-o'></i> "+karutaStr[LANG]["unshare"]+"</a></li>";
			html += "<li><a href='../../../"+serverBCK+"/portfolios/portfolio/"+this.id+"?resources=true&export=true'><i class='fa fa-download'></i> "+karutaStr[LANG]["export"]+"</a></li>";
			html += "<li><a href='../../../"+serverBCK+"/portfolios/portfolio/"+this.id+"?resources=true&files=true'><i class='fa fa-download'></i> "+karutaStr[LANG]["export-with-files"]+"</a></li>";
			html += "</ul></div>";
		}
		html += "</td>";
	}
	if (type=='bin') {
		if (USER.admin || USER.creator){
			html += "<td>";
			html += this.label_node[langcode].text();
			html += "</td>";
			html += "<td>";
			html += this.code_node.text();
			html += "</td>";
			html += "<td>";
			html += " <a class='btn btn-mini' onclick=\"UIFactory['Portfolio'].restore('"+this.id+"')\" data-toggle='tooltip' data-placement='top' data-title='"+karutaStr[LANG]["button-restore"]+"'>";
			html += "<i class='icon-arrow-left'></i>";
			html += "</a>";
			html += " <a class='btn btn-mini' onclick=\"UIFactory['Portfolio'].del('"+this.id+"')\" data-toggle='tooltip' data-placement='top' data-title='"+karutaStr[LANG]["button-delete"]+"'>";
			html += "<i class='icon-remove'></i>";
			html += "</a>";
			html += "</td>";
		}
	}	return html;
};

//======================
UIFactory["Portfolio"].displayPortfolio = function(destid,type,langcode,edit)
//======================
{	var html = "";
	if (type==null || type==undefined)
		type = 'standard';
	if (type=='standard'){
		html += "<div id='navigation_bar'></div>";
		html += "<div id='main-container' class='container' style = 'padding-top:60px'>";
		html += "	<div class='row'>";
		html += "		<div class='span3' id='sidebar'></div>";
		html += "		<div class='span9' id='contenu'></div>";
		html += "	</div>";
		html += "</div>";
		html += "<div id='footer'></div>";
		$("#"+destid).append($(html));
		UIFactory["Portfolio"].displaySidebar('sidebar','standard',LANGCODE,edit);
	}
	if (type=='header'){
		html += "<div id='main-header' class='navbar navbar-fixed-top'>";
		html += "   <div id='header' style='height:200px'></div>";
		html += "   <div id='menu'></div>";
		html += "</div>";
		html += "<div id='navigation_bar'></div>";
		html += "<div id='contenu' class='container' style = 'padding-top:250px'></div>";
		html += "<div id='footer'></div>";
		$("#"+destid).append($(html));
		UIFactory["Portfolio"].displayNodes('header',UICom.root.node,'header');
		UIFactory["Portfolio"].displayMenu('menu','horizontal_menu',LANGCODE,edit,UICom.root.node);
	}
	$('a[data-toggle=tooltip]').tooltip({html:true});
};

//======================
UIFactory["Portfolio"].displaySidebar = function(destid,type,langcode,edit)
//======================
{	
	var html = "";
	if (type==null || type==undefined)
		type = 'standard';
	if (type=='standard'){
		html += "<div id='main-nav' class='well'>";
		html += "<div class='panel-group' id='group-"+portfolios_list[0]+"'>";
		html += "<div id='sidebar-title' class='sidebar-title'><a id='sidebar_"+UICom.rootid+"' href='#' onclick=\"displayPage('"+UICom.rootid+"',1,'"+type+"','"+langcode+"',"+edit+")\">"+UICom.structure["ui"][$(UICom.root.node).attr('id')].getLabel('sidebar-title')+"</a></div>";
		html += "<div id='sidebar-content'></div>";
		html += "</div><!-- panel-group -- >";
		html += "</div>";
		$("#"+destid).append($(html));
		UIFactory["Node"].displaySidebar(UICom.root,'sidebar-content',type,langcode,edit);
	}
};

//======================
UIFactory["Portfolio"].displayMenu = function(destid,type,langcode,edit,tree)
//======================
{	
	var html = "";
	if (type==null || type==undefined)
		type = 'horizontal_menu';
	if (type=='horizontal_menu'){
		var nodes = $("asmUnit:has(metadata[semantictag='horizontal_menu'])",tree);
		html += "<ul class='nav nav-tabs' style='width:85%;border-top:1px solid lightgrey;margin-right:90px;margin-left:40px'>";
		for (var i=0; i<nodes.length; i++){
			uuid = $(nodes[i]).attr('id');
			html += "<li><a  id='sidebar_"+uuid+"' href='#' onclick=\"displayPage('"+uuid+"',99,'standard','"+langcode+"',"+edit+")\">"+UICom.structure["ui"][uuid].getLabel()+"</a></li>";
		}
		html += "</ul>";
		$("#"+destid).html(html);
	}
};

//======================
UIFactory["Portfolio"].displayNodes = function(destid,tree,semtag,langcode,edit)
//======================
{	
	$("#"+destid).html("");
	var rootnodeid = $("*:has(metadata[semantictag="+semtag+"])",tree).attr("id");
	var depth = 99;
	UIFactory['Node'].displayStandard(UICom.structure['tree'][rootnodeid],destid,depth,langcode,edit);
};


/// Editor
//==================================
UIFactory["Portfolio"].update = function(input,itself)
//==================================
{
	var value = $.trim($(input).val());
	$(itself.text_node).text(value);
	itself.save();
	itself.refresh();
	$("#"+itself.id+"_saved").html(" saved");
};

//==================================
UIFactory["Portfolio"].prototype.getEditor = function(type,lang)
//==================================
{
	var html = "";
	html += "<input type='text'  value=\""+$(this.text_node).text()+"\" onclick=\"document.getElementById('"+this.id+"_saved').innerHTML=''\">";
	html += "<span id='"+this.id+"_saved'></span>";  // to write 'saved'
	var obj = $(html);
	var self = this;
	$(obj).change(function (){
		UIFactory["Portfolio"].update(obj,self);
	});
	return obj;
};

//==================================
UIFactory["Portfolio"].reload = function(portfolioid) 
//==================================
{
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/portfolios/portfolio/" + portfolioid + "?resources=true",
		success : function(data) {
			UICom.parseStructure(data);
		}
	});
};

//==================================
UIFactory["Portfolio"].reloadparse = function(portfolioid) 
//==================================
{
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/portfolios/portfolio/" + portfolioid + "?resources=true",
		success : function(data) {
			UICom.parseStructure(data);
			UIFactory["Portfolio"].parse(data);
			$("#sidebar").html("");
			UIFactory["Portfolio"].displaySidebar('sidebar',null,null,g_edit);
			$('a[data-toggle=tooltip]').tooltip({html:true});
		}
	});
};


//==================================
UIFactory["Portfolio"].parse = function(data) 
//==================================
{
	var portfolioid ="";
	var items = $("portfolio",data);
	for ( var i = 0; i < items.length; i++) {
		try {
			portfolioid = $(items[i]).attr('id');
			portfolios_byid[portfolioid] = new UIFactory["Portfolio"](items[i]);
			portfolios_list[i] = portfolios_byid[portfolioid];
		} catch(e) {
			alert("Error:"+portfolioid);
		}
	}
};

//==================================
UIFactory["Portfolio"].parseBin = function(data) 
//==================================
{
	var portfolioid ="";
	var items = $("portfolio",data);
	for ( var i = 0; i < items.length; i++) {
		try {
			portfolioid = $(items[i]).attr('id');
			bin_list[i] = new UIFactory["Portfolio"](items[i]);
		} catch(e) {
			alert("Error:"+portfolioid);
		}
	}
};


//==================================
UIFactory["Portfolio"].create = function()
//==================================
{
	$("#edit-window-title").html(karutaStr[LANG]['create_portfolio']);
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var create_button = "<span id='creste_button' class='btn'>"+karutaStr[LANG]['Create']+"</span>";
	var obj = $(create_button);
	$(obj).click(function (){
		var code = $("#codetree").val();
		if (code!='') {
			var xml = "";
			xml +="<?xml version='1.0' encoding='UTF-8'?>";
			xml +="<portfolio code='"+code+"'>";
			xml +="	<asmRoot>";
			xml +="		<metadata semantictag='root' sharedNode='N' sharedResource='N' multilingual-node='Y' />";
			xml +="		<metadata-wad seenoderoles='all' />";
			xml +="		<asmResource xsi_type='nodeRes'>";
			xml +="			<code>"+code+"</code>";
			xml +="			<label lang='fr'>"+code+"</label>";
			xml +="			<label lang='en'>"+code+"</label>";
			xml +="		</asmResource>";
			xml +="		<asmResource xsi_type='context'></asmResource>";
			xml +="	</asmRoot>";
			xml +="</portfolio>";
			$.ajax({
				type : "POST",
				contentType: "application/xml",
				dataType : "xml",
				url : url,
				data : xml,
				success : function(data) {
					window.location.reload();
				},
				error : function(jqxhr,textStatus) {
					alert("Error : "+jqxhr.responseText);
				}
			});
		}
	});
	$("#edit-window-footer").append(obj);
	var footer = " <span class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Cancel']+"</span>";
	$("#edit-window-footer").append($(footer));

	//--------------------------
	$("#edit-window-body-content").html(karutaStr[LANG]['code_portfolio']+" ");
	//--------------------------
	var url = "../../../"+serverBCK+"/portfolios";
	var html = "<input id='codetree' type='text'>";
	$("#edit-window-body-content").html(html);
	//--------------------------
	$('#edit-window').modal('show');
};

//==================================
UIFactory["Portfolio"].getid_bycode = function(code,resources) 
//==================================
{
	var result = "";
	$.ajaxSetup({async: false});
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/portfolios/portfolio/code/" + code + (resources)?"?resources=true":"",
		success : function(data) {
			var portfolio = $("portfolio", data);
			result = $(portfolio).attr('id');
		}
	});
	$.ajaxSetup({async: true});
	return result;
};


//==================================
UIFactory["Portfolio"].instantiate_bycode = function(sourcecode,targetcode)
//==================================
{
	var uuid = null;
	var url = "../../../"+serverBCK+"/portfolios/instanciate/null?sourcecode="+sourcecode+"&targetcode="+targetcode;
	$.ajax({
			type : "POST",
			contentType: "application/xml",
			dataType : "text",
			url : url,
			data : "",
			success : function(data) {
				uuid = data;
			}
	});
	return uuid;
};

//==================================
UIFactory["Portfolio"].instantiate = function(templateid,targetcode,reload)
//==================================
{
	var uuid = null;
	var url = "../../../"+serverBCK+"/portfolios/instanciate/"+templateid+"?targetcode="+targetcode;
	$.ajax({
			type : "POST",
			contentType: "application/xml",
			dataType : "text",
			url : url,
			data : "",
			success : function(data) {
				uuid = data;
				if (reload!=null && reload){
					window.location.reload();
				}
			}
	});
	return uuid;
};

//==================================
UIFactory["Portfolio"].copy_bycode = function(sourcecode,targetcode)
//==================================
{
	var uuid = null;
	var url = "../../../"+serverBCK+"/portfolios/copy/null?sourcecode="+sourcecode+"&targetcode="+targetcode;
	$.ajax({
			type : "POST",
			contentType: "application/xml",
			dataType : "text",
			url : url,
			data : "",
			success : function(data) {
				uuid = data;
			}
	});
	return uuid;
};

//==================================
UIFactory["Portfolio"].copy = function(templateid,targetcode,reload)
//==================================
{
	var uuid = null;
	var url = "../../../"+serverBCK+"/portfolios/copy/"+templateid+"?targetcode="+targetcode;
	$.ajax({
			type : "POST",
			contentType: "application/xml",
			dataType : "text",
			url : url,
			data : "",
			success : function(data) {
				uuid = data;
				if (reload!=null && reload)
					window.location.reload();
			}
	});
	return uuid;
};

//==================================
UIFactory["Portfolio"].importFile = function()
//==================================
{
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var footer = "<span class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</span>";
	$("#edit-window-footer").html($(footer));
	$("#edit-window-title").html("Import");
	var html = "";
	$("#edit-window-body-content").html($(html));
	//--------------------------
	var url = "../../../"+serverBCK+"/portfolios";
	html +=" <div id='divfileupload'>";
	html +=" <input id='fileupload' type='file' name='uploadfile' data-url='"+url+"'>";
	html += "</div>";
	html +=" <div id='progress'><div class='bar' style='width: 0%;'></div></div>";
	$("#edit-window-body-content").append($(html));
	$("#loading").hide();
	$("#fileupload").fileupload({
		progressall: function (e, data) {
			$("#progress").css('border','1px solid lightgrey');
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$('#progress .bar').css('width',progress + '%');
			$("#wait-window").show();
		},
		success : function(data) {
			$("#wait-window").hide();
			window.location.reload();
		},
		error : function(jqxhr,textStatus) {
			$("#wait-window").hide();
			alert("Error : "+jqxhr.responseText);
		}
    });
	//--------------------------
	$('#edit-window').modal('show');
};

//==================================
UIFactory["Portfolio"].importZip = function()
//==================================
{
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var footer = "<span class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</span>";
	$("#edit-window-footer").html($(footer));
	var html = "";
	$("#edit-window-body-content").html($(html));
	//--------------------------
	var url = "../../../"+serverBCK+"/portfolios/zip";
	html +=" <div id='divfileupload'>";
	html +=" <input id='fileupload' type='file' name='uploadfile' data-url='"+url+"'>";
	html += "</div>";
	html +=" <div id='progress'><div class='bar' style='width: 0%;'></div></div>";
	$("#edit-window-body-content").append($(html));
	$("#fileupload").fileupload({
		progressall: function (e, data) {
			$("#progress").css('border','1px solid lightgrey');
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$('#progress .bar').css('width',progress + '%');
			$("#wait-window").show();
		},
		success : function(data) {
			$("#wait-window").hide();
			window.location.reload();
		},
		error : function(jqxhr,textStatus) {
			$("#wait-window").hide();
			alert("Error : "+jqxhr.responseText);
		}
    });
	//--------------------------
	$('#edit-window').modal('show');
};


//==================================
UIFactory["Portfolio"].remove = function(portfolioid) 
//==================================
{
	var url = "../../../"+serverBCK+"/portfolios/portfolio/" + portfolioid + "?active=false";
	$.ajax({
		type : "PUT",
		contentType: "application/xml",
		dataType : "text",
		url : url,
		data : "",
		success : function(data) {
			for (var i=0;i<portfolios_list.length;i++){
				if (portfolios_list[i]!=null && portfolios_list[i].id==portfolioid) {
					bin_list[bin_list.length] = portfolios_list[i];
					portfolios_list[i] = null;
					break;
				}
			}
			UIFactory["Portfolio"].displayAll('portfolios','list');
			$("#table_portfolio").tablesorter( {sortList: [[0,0], [1,0]],headers : {2:{sorter:false}}} ); 
			UIFactory["Portfolio"].displayBin('bin','bin');
			$("#table_bin").tablesorter( {sortList: [[0,0], [1,0]],headers : {2:{sorter:false}}} ); 
			$('[data-toggle=tooltip]').tooltip();
		}
	});
};

//==================================
UIFactory["Portfolio"].restore = function(portfolioid) 
//==================================
{
	var url = "../../../"+serverBCK+"/portfolios/portfolio/" + portfolioid + "?active=true";
	$.ajax({
		type : "PUT",
		contentType: "application/xml",
		dataType : "text",
		url : url,
		data : "",
		success : function(data) {
			for (var i=0;i<bin_list.length;i++){
				if (bin_list[i]!=null && bin_list[i].id==portfolioid) {
					portfolios_list[length] = bin_list[i];
					bin_list[i] = null;
					break;
				}
			}
			UIFactory["Portfolio"].displayAll('portfolios','list');
			$("#table_portfolio").tablesorter( {sortList: [[0,0], [1,0]],headers : {2:{sorter:false}}} ); 
			UIFactory["Portfolio"].displayBin('bin','bin');
			$("#table_bin").tablesorter( {sortList: [[0,0], [1,0]],headers : {2:{sorter:false}}} ); 
			$('[data-toggle=tooltip]').tooltip();
		}
	});
};

//==================================
UIFactory["Portfolio"].del = function(portfolioid) 
//==================================
{
	var url = "../../../"+serverBCK+"/portfolios/portfolio/" + portfolioid;
	$.ajax({
		type : "DELETE",
		contentType: "application/xml",
		dataType : "xml",
		url : url,
		data : "",
		success : function(data) {
			for (var i=0;i<bin_list.length;i++){
				if (bin_list[i]!=null && bin_list[i].id==portfolioid) {
					bin_list[i] = null;
					break;
				}
			}
			UIFactory["Portfolio"].displayBin('bin','bin');
			$("#table_bin").tablesorter( {sortList: [[0,0], [1,0]],headers : {2:{sorter:false}}} ); 
			$('[data-toggle=tooltip]').tooltip();
		}
	});
};

//=======================================================================
UIFactory["Portfolio"].getPDF = function(portfolioid) 
//=======================================================================
{
	var urlS = "../../../"+serverFIL+"/xsl?portfolioids="+portfolioid+"&xsl="+appliname+"/karuta/xsl/xmlportfolio2fo.xsl&parameters=lang:fr;pers:mimi&format=application/pdf";
	$.ajax({
		type : "GET",
		headers: {
	        Accept : "application/pdf; charset=utf-8",
	        "Content-Type": "application/pdf; charset=utf-8"
	    },
		url : urlS,
	 });
};

//==================================
UIFactory["Portfolio"].getActions = function(portfolioid) 
//==================================
{
	var url = window.location.href;
	var serverURL = url.substring(0,url.indexOf(appliname)-1);
	var html ="";
	html += "			<ul class='nav'>";
	html += "				<li class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle' href='#'>Actions<b class='caret'></b></a>";
	html += "					<ul class='dropdown-menu'>";
	html += "						<li><a href='../../../"+serverFIL+"/xsl?portfolioids="+portfolioid+"&xsl="+appliname+"/karuta/xsl/xmlportfolio2fo.xsl&parameters=lang:"+LANG+";url:"+serverURL+"/"+serverFIL+";url-appli:"+serverURL+"/"+bckname+"&format=application/pdf'>"+karutaStr[LANG]['getPDF']+"</a></li>";
	if (USER.admin || portfolios_byid[portfolioid].owner=='Y') {
		html += "						<li><a onclick=\"javascript:UIFactory['Portfolio'].callShare('"+portfolioid+"')\" href='#'>"+karutaStr[LANG]['addshare']+"</a></li>";
		html += "						<li><a onclick=\"javascript:UIFactory['Portfolio'].callUnShare('"+portfolioid+"')\" href='#'>"+karutaStr[LANG]['unshare']+"</a></li>";
	}
	html += "						<li><a href='../../../"+serverBCK+"/portfolios/portfolio/"+portfolioid+"?resources=true&export=true'>"+karutaStr[LANG]['export']+"</a></li>";
	if (USER.admin || g_userrole=='designer') {
		html += "						<li><a href='../../../"+serverBCK+"/portfolios/portfolio/"+portfolioid+"?resources=true&amp;files=true'>"+karutaStr[LANG]['export-with-files']+"</a></li>";
		html += "						<li><a href='#' onclick=\"$('.metainfo').css('visibility','hidden');\">"+karutaStr[LANG]['hide-metainfo']+"</a></li>";
		html += "						<li><a href='#' onclick=\"$('.metainfo').css('visibility','visible');\">"+karutaStr[LANG]['show-metainfo']+"</a></li>";
	}
	html += "					</ul>";
	html += "				</li>";
	html += "			</ul>";
	return html;
};

//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//-------------------------- SHARING - UNSHARING -----------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------

//==================================
UIFactory["Portfolio"].callShare = function(portfolioid)
//==================================
{
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var js2 = "javascript:UIFactory['Portfolio'].share('"+portfolioid+"')";
	var footer = "<span class='btn' onclick=\""+js2+";\">"+karutaStr[LANG]['addshare']+"</span><span class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</span>";
	$("#edit-window-footer").html(footer);
	$("#edit-window-title").html(karutaStr[LANG]['addshare']);
	var html = "";
	html += "<h4>"+karutaStr[LANG]['shared']+"</h4>";
	html += "<div id='shared'></div>";
	//-------------------------------------
	html += "<div id='sharing' style='display:none'>";
	html += "<h4>"+karutaStr[LANG]['sharing']+"</h4>";
	html += "<div class='row'>";
	html += "<div class='span1'>";
	html += karutaStr[LANG]['select_role'];
	html += "</div>";
	html += "<div class='span4'>";
	html += "<div id='sharing_roles'></div>";
	html += "</div>";
	html += "</div><!--row-->";
	html += "<div class='row'>";
	html += "<div class='span1'><br>";
	html += karutaStr[LANG]['select_users'];
	html += "</div>";
	html += "<div class='span4'>";
	html += "<div id='sharing_users'></div>";
	html += "</div>";
	html += "</div><!--row-->";
	html += "</div><!--sharing-->";
	$("#edit-window-body-content").html(html);
	$("#edit-window-body-node").html("");
	$("#edit-window-body-metadata").html("");
	$("#edit-window-body-metadata-epm").html("");
	//-------------------------------------
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/users",
		success : function(data) {
			UIFactory["User"].parse(data);
			UIFactory["User"].displaySelectMultipleActive('sharing_users');
			UIFactory["User"].displaySelectMultipleActiveDesigner('sharing_designers');
			//--------------------------
			$.ajax({
				type : "GET",
				dataType : "xml",
				url : "../../../"+serverBCK+"/rolerightsgroups/all/users?portfolio="+portfolioid,
				success : function(data) {
					UIFactory["Portfolio"].displayShared('shared',data);
				}
			});
			//--------------------------
		}
	});
	//------------------------------------
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/rolerightsgroups?portfolio="+portfolioid,
		success : function(data) {
			UIFactory["Portfolio"].displaySharingRoleEditor('sharing_roles',portfolioid,data);
			$("#sharing").show();
			$("#sharing_designer").show();
		}
	});

	
	//--------------------------	//--------------------------
	$('#edit-window').modal('show');
};

//==================================
UIFactory["Portfolio"].displaySharingRoleEditor = function(destid,portfolioid,data)
//==================================
{
	//--------------------------
	var groups = $("rolerightsgroup",data);
	if (groups.length>0) {
		var first = true;
		for (var i=0; i<groups.length; i++) {
			var groupid = $(groups[i]).attr('id');
			var label = $("label",groups[i]).text();
			if (!first)
				$("#"+destid).append($("<br>"));
			first = false;
			var input = "<input type='radio' name='radio_group' value='"+groupid+"'";
			input += "onclick=\"$('input:checkbox').removeAttr('checked')\" ";
			input +="> "+label+" </input>";
			$("#"+destid).append($(input));
		}
	} else {
		$("#"+destid).html(karutaStr[LANG]['nogroup']);
	}
};

//==================================
UIFactory["Portfolio"].displayShared = function(destid,data)
//==================================
{
	var html = "";
	$("#"+destid).html(html);
	var groups = $("rrg",data);
	if (groups.length>0) {
		for (var i=0; i<groups.length; i++) {
			var label = $("label",groups[i]).text();
			var users = $("user",groups[i]);
			if (users.length>0){
				html += "<div class='row'><div class='span1'>"+label+"</div><div class='span4'>";
				for (var j=0; j<users.length; j++){
					var userid = $(users[j]).attr('id');
					if (Users_byid[userid]==undefined)
						alert('error userid:'+userid);
					else
						html += "<div>"+Users_byid[userid].getView()+"</div>";
				}
				html += "</div></div>";
			}
		}
		$("#"+destid).append($(html));
	} else {
		$("#"+destid).html(karutaStr[LANG]['noshared']);
	}
	$('#edit-window-body').animate({ scrollTop: 0 }, 'slow');
};

//==================================
UIFactory["Portfolio"].share = function(portfolioid)
//==================================
{
	var users = $("input[name='select_users']").filter(':checked');
	var groups = $("input[name='radio_group']");
	var groupid = null;
	if (groups.length>0){
		var group = $("input[name='radio_group']").filter(':checked');
		groupid = $(group).attr('value');
	}
	var url = null;
	if (groupid!=null) {
		url = "../../../"+serverBCK+"/rolerightsgroups/rolerightsgroup/" + groupid + "/users";
		var xml = "<users>";
		for (var i=0; i<users.length; i++){
			var userid = $(users[i]).attr('value');
			xml += "<user id='"+userid+"'/>";
		}
		xml += "</users>";
		if (xml.length>20) {
			$.ajax({
				type : "POST",
				contentType: "application/xml",
				dataType : "xml",
				url : url,
				data : xml,
				success : function(data) {
					//--------------------------
					$.ajax({
						type : "GET",
						dataType : "xml",
						url : "../../../"+serverBCK+"/rolerightsgroups/all/users?portfolio="+portfolioid,
						success : function(data) {
							UIFactory["Portfolio"].displayShared('shared',data);
						}
					});
					//--------------------------
				}
			});
		}
	}
	//--------------------- designers -----------------------
	var designers = $("input[name='select_designers']").filter(':checked');
	for (var i=0; i<designers.length; i++){
		var userid = $(designers[i]).attr('value');
		url = "../../../"+serverBCK+"/share/"+portfolioid+"/"+userid+"?write=y";
		$.ajax({
			type : "POST",
			contentType: "application/xml",
			dataType : "xml",
			url : url,
			data : "",
			success : function(data) {
				//--------------------------
				$.ajax({
					type : "GET",
					dataType : "xml",
					url : "../../../"+serverBCK+"/rolerightsgroups/all/users?portfolio="+portfolioid,
					success : function(data) {
						UIFactory["Portfolio"].displayShared('shared',data);
					}
				});
				//--------------------------
			}
		});
	}
	//------------------------------------------------------------
};

//==================================
UIFactory["Portfolio"].callUnShare = function(portfolioid)
//==================================
{
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var js2 = "javascript:UIFactory['Portfolio'].unshare('"+portfolioid+"')";
	var footer = "<span class='btn' onclick=\""+js2+";\">"+karutaStr[LANG]['unshare']+"</span><span class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</span>";
	$("#edit-window-footer").html(footer);
	$("#edit-window-title").html(karutaStr[LANG]['unshare']);
	var html = "";
	html += "<h4>"+karutaStr[LANG]['shared']+"</h4>";
	html += "<div id='shared'></div>";
	$("#edit-window-body-content").html(html);
	$("#edit-window-body-node").html("");
	$("#edit-window-body-metadata").html("");
	$("#edit-window-body-metadata-epm").html("");
	//----------------------------------------------------------------
	if (Users_byid.length>0) { // users loaded
		//--------------------------
		$.ajax({
			type : "GET",
			dataType : "xml",
			url : "../../../"+serverBCK+"/rolerightsgroups/all/users?portfolio="+portfolioid,
			success : function(data) {
				UIFactory["Portfolio"].displayUnSharing('shared',data);
			}
		});
		//--------------------------		
	} else {
		$.ajax({
			type : "GET",
			dataType : "xml",
			url : "../../../"+serverBCK+"/users",
			success : function(data) {
				UIFactory["User"].parse(data);
				//--------------------------
				$.ajax({
					type : "GET",
					dataType : "xml",
					url : "../../../"+serverBCK+"/rolerightsgroups/all/users?portfolio="+portfolioid,
					success : function(data) {
						UIFactory["Portfolio"].displayUnSharing('shared',data);
					}
				});
				//--------------------------
			}
		});
	}
	//----------------------------------------------------------------
	$('#edit-window').modal('show');
};

//==================================
UIFactory["Portfolio"].displayUnSharing = function(destid,data)
//==================================
{
	var html = "";
	$("#"+destid).html(html);
	var groups = $("rrg",data);
	if (groups.length>0) {
	for (var i=0; i<groups.length; i++) {
		var groupid = $(groups[i]).attr('id');
		var label = $("label",groups[i]).text();
			var users = $("user",groups[i]);
			if (users.length>0){
				html += "<hr><div class='row'><div class='span1'>"+label+"</div><div class='span4'>";
				for (var j=0; j<users.length; j++){
					var userid = $(users[j]).attr('id');
					if (Users_byid[userid]==undefined)
						alert('error userid:'+userid);
					else
						html += "<div>"+Users_byid[userid].getSelector('group',groupid,'select_users')+"</div>";
				}
				html += "</div></div>";
			}
		}
		$("#"+destid).append($(html));
	} else {
		$("#"+destid).append($(karutaStr[LANG]['noshared']));
	}
};

//==================================
UIFactory["Portfolio"].unshare = function(portfolioid)
//==================================
{
	var users = $("input[name='select_users']").filter(':checked');
	for (var i=0; i<users.length; i++){
		var userid = $(users[i]).attr('value');
		var groupid = $(users[i]).attr('group');
		var url = "../../../"+serverBCK+"/rolerightsgroups/rolerightsgroup/" + groupid + "/users/user/"+userid;
		$.ajax({
			type : "DELETE",
			contentType: "application/xml",
			dataType : "xml",
			url : url,
			data : "",
			success : function(data) {
				//--------------------------
				$.ajax({
					type : "GET",
					dataType : "xml",
					url : "../../../"+serverBCK+"/rolerightsgroups/all/users?portfolio="+portfolioid,
					success : function(data) {
						UIFactory["Portfolio"].displayUnSharing('shared',data);
					}
				});
				//--------------------------
			}
		});
	}
};
