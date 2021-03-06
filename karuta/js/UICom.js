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

var g_portfolio_current = ""; // XML jQuery Object - must be set after loading xml
var proxies_data = {};
var proxies_edit = {};
if( UIFactory === undefined )
{
  var UIFactory = {};
}

var UICom =
{
	//=======================================================================
	query: function( type, url, callback, dataType, data )
	//=======================================================================
	{
		var set =
		{
			dataType: dataType,
			type: type,
			url: url,
			contentType: "application/xml",
			processData: false,
			data: data,
			success: function(data, textStatus)
			{
				if( callback != null )
					callback(data);
			}
		};
		jQuery.ajax(set);
	},

	//=======================================================================
	parseStructure: function( data, treeroot, parentid, treerootname )
	//=======================================================================
	{
		if (treeroot==null || treeroot) {
			treeroot = true;
			g_portfolio_current = data;
		}
		if( UICom.structure["tree"] == null )
			UICom.structure["tree"] = {};
		if( UICom.structure["ui"] == null )
			UICom.structure["ui"] = {};
		/// ------------------ Get root node
		var root = $("asmRoot", data);
		var name = "asmRoot";
		if (root.length==0) {
			root = $("asmStructure", data);
			name = "asmStructure";
		}
		if (root.length==0){
			root = $("asmUnit", data);
			name = "asmUnit";
		}
		if (root.length==0) {
			root = $("asmUnitStructure", data);
			name = "asmUnitStructure";
		}
		if (root.length==0) {
			root = $("asmContext", data);
		}
		//---------------------
		var id = $(root).attr("id");
		var r = new UICom.Tree(root[0]);
		//---------------------
		if (treeroot) {
			UICom.root = r;
			UICom.rootid = id;
			if (treerootname!=null && treerootname!=undefined){
				UICom.treeroot[treerootname] = r;
				UICom.treerootid[treerootname] = id;
			}
		} else {
			UICom.structure["tree"][parentid].childs.push(id);
		}
		//---------------------
		UICom.structure["tree"][id] = r;
		UICom.structure["ui"][id] = new UIFactory["Node"](root);
		UICom.parseElement(r);
	},


	//=======================================================================
	parseElement: function( currentNode)
	//=======================================================================
	{
		if (g_userrole=='designer')
			UICom.addRoles(currentNode.node);
		var current = currentNode.node;
		var children = $(current).children();
	
		for( var i=0; i<children.length; ++i ) {
			var child = children[i];
			var name = child.tagName;
			if( "asmRoot" == name || "asmStructure" == name || "asmUnit" == name || "asmUnitStructure" == name || "asmContext" == name ) {
				var id = $(child).attr("id");
				var childTree = new UICom.Tree(child);
				currentNode.childs.push(id);
				UICom.structure["tree"][id] = childTree;
				UICom.structure["ui"][id] = new UIFactory["Node"](child);
				if (name=='asmContext') {
					resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",child);
					resource_type = $(resource).attr("xsi_type");
					if (resource_type=='Proxy') {
						var targetid = $("code",$("asmResource[xsi_type='Proxy']",child)).text();
						var semtag = $("metadata",child).attr('semantictag');
						var edittargetroles = ($("metadata-wad",child).attr('edittargetroles')==undefined)?'none':$("metadata-wad",child).attr('edittargetroles');
						$.ajax({
							type : "GET",
							dataType : "xml",
							url : "../../../"+serverBCK+"/nodes/node/" + targetid + "?resources=true",
							success : function(data) {
								proxies_data[semtag] = data;
								proxies_edit[semtag] = edittargetroles;
								UICom.parseStructure(data,false,$(current).attr("id"));
							}
						});
					}
					if (resource_type=='Get_Proxy') {
						var targetid = $("code",$("asmResource[xsi_type='Get_Proxy']",child)).text();
						$.ajax({
							type : "GET",
							dataType : "xml",
							url : "../../../"+serverBCK+"/nodes/node/" + targetid + "?resources=true",
							success : function(data) {
								UICom.parseStructure(data,false,$(current).attr("id"));
							}
						});
					}
				}
				// recurse
				UICom.parseElement(childTree);
			}
		}
	},
	
	//=======================================================================
	addRoles: function(node)
	//=======================================================================
	{
		UICom.addRole(node,'seenoderoles');
		UICom.addRole(node,'editresroles');
		UICom.addRole(node,'delnoderoles');
		UICom.addRole(node,'commentnoderoles');
		UICom.addRole(node,'submitroles');
		UICom.addRole(node,'editnoderoles');
		UICom.addRole(node,'shownoderoles');
		UICom.addRole(node,'showroles');
		UICom.addRole(node,'notifyroles');
		UICom.addRole(node,'menuroles');
		UICom.addRole(node,'showroles');
		UICom.addRole(node,'showtoroles');
		UICom.addRole(node,'submitroles');
	},
	
	//=======================================================================
	addRole: function(node,attribute)
	//=======================================================================
	{
		if ($("metadata-wad",node).attr(attribute)!=undefined) {
			try {
				//----------------------------
				var roles = null;
				if (attribute == 'menuroles' && $("metadata-wad",node).attr(attribute) != undefined && $("metadata-wad",node).attr(attribute).length>10) {
					var items = $("metadata-wad",node).attr(attribute).split(";");
					for (var i=0; i<items.length; i++){
						var subitems = items[i].split(",");
						roles = subitems[3].split(" ");
						//----------------------------
						for (var j=0;j<roles.length;j++){
							if (roles[j]!='all' && roles[j]!='')
							UICom.roles.add(roles[j]);
						}
						//----------------------------
					}
				}
				else {
					roles = $("metadata-wad",node).attr(attribute).split(" ");
					//----------------------------
					for (var i=0;i<roles.length;i++){
						if (roles[i]!='all' && roles[i]!='')
						UICom.roles.add(roles[i]);
					}
					//----------------------------
				}
			} catch(e) {
				alert('Error role in :'+attribute+"  --"+e); 
			}
		}
	},

	
	//========================================
	Tree: function(node)
	//========================================
	{
		this.node = node;
		this.childs = [];
	},

	//=======================================================================
	 UpdateMetadata: function(uuid)
	//=======================================================================
	{
		var treenode = UICom.structure["tree"][uuid];
		var metawad = $(">metadata",treenode.node);
		var data = xml2string(metawad[0]);
		UICom.query("PUT","../../../"+serverBCK+'/nodes/node/'+uuid+'/metadata',null,"xml",data);
	},

	
	//=======================================================================
	 UpdateMeta: function( uuid, cb )
	//=======================================================================
	{
		var treenode = UICom.structure["tree"][uuid];
		var metawad = $(">metadata",treenode.node);
		var data = xml2string(metawad[0]);
		UICom.query("PUT","../../../"+serverBCK+'/nodes/node/'+uuid+'/metadata',null,"xml",data);
		var metawad_wad = $(">metadata-wad",treenode.node);
		data =  xml2string(metawad_wad[0]);
		var urlS = "../../../"+serverBCK+'/nodes/node/'+uuid+'/metadatawad';
		$.ajax({
			type : "PUT",
			dataType : "xml",
			contentType: "application/xml",
			url : urlS,
			data : data,
			success : function (data){
				UICom.structure["ui"][uuid].refresh();
			}
		});
	},

	//=======================================================================
	 UpdateMetaWad: function(uuid)
	//=======================================================================
	{
		var treenode = UICom.structure["tree"][uuid];
		var metawad = $(">metadata-wad",treenode.node);
		data =  xml2string(metawad[0]);
		var urlS = "../../../"+serverBCK+'/nodes/node/'+uuid+'/metadatawad';
		$.ajax({
			type : "PUT",
			dataType : "xml",
			contentType: "application/xml",
			url : urlS,
			data : data,
			success : function (data){
				UICom.structure["ui"][uuid].refresh();
			}
		});
	},

	//=======================================================================
	 UpdateMetaEpm: function( uuid, cb )
	//=======================================================================
	{
		var treenode = UICom.structure["tree"][uuid];
		var metawad_epm = $(">metadata-epm",treenode.node);
		data =  xml2string(metawad_epm[0]);
		var urlS = "../../../"+serverBCK+'/nodes/node/'+uuid+'/metadataepm';
		$.ajax({
			type : "PUT",
			dataType : "xml",
			contentType: "application/xml",
			url : urlS,
			data : data,
			success : function (data){
				UICom.structure["ui"][uuid].refresh();
			}
		});
	},
	
	//=======================================================================
	  UpdateResource: function( uuid, cb1, cb2 )
	//=======================================================================
	{
		var treenode = UICom.structure["tree"][uuid];
		var resource = $(">asmResource[xsi_type!='nodeRes'][xsi_type!='context']",treenode.node)[0];
	
		/// Strip specific id (WAD stuff)
		$(resource).removeAttr("id");
		$(resource).removeAttr("contextid");
		$(resource).removeAttr("modified");
		data = xml2string(resource);
		var urlS = "../../../"+serverBCK+'/resources/resource/'+uuid;
		$.ajax({
			type : "PUT",
			dataType : "text",
			contentType: "application/xml",
			url : urlS,
			data : data,
			success : function (data){
				if (cb1!=undefined && jQuery.isFunction(cb1))
					cb1(uuid,data);
				if (cb2!=undefined && jQuery.isFunction(cb2))
					cb2(uuid,data);
			}
		});
	},

	  
	//=======================================================================
	  UpdateNode: function( uuid, cb )
	//=======================================================================
	{
		var treenode = UICom.structure["tree"][uuid];
		var resources = $(">asmResource",treenode.node);
	
		for( var i=0; i<resources.length; ++i )
		{
			var res = resources[i];
			/// Strip specific id (WAD stuff)
			$(res).removeAttr("id");
			$(res).removeAttr("contextid");
			$(res).removeAttr("modified");
			var type = $(res).attr("xsi_type");
			data = xml2string(res);
			/// nodeRes content
			if( "nodeRes" == type ) {
				UICom.query("PUT","../../../"+serverBCK+'/nodes/node/'+uuid+'/noderesource',null,"text",data);
			}
			else if( "context" == type )
			{
				UICom.query("PUT","../../../"+serverBCK+'/nodes/node/'+uuid+'/nodecontext',null,"text",data);
			}
			/// Other than nodeRes content
			else {
				var urlS = "../../../"+serverBCK+'/resources/resource/'+uuid;
				$.ajax({
					type : "PUT",
					dataType : "text",
					contentType: "application/xml",
					url : urlS,
					data : data,
					success : function (data){
						if (cb!=undefined && jQuery.isFunction(cb))
							cb(uuid,data);
					}
				});
			}
		}
	},
	
	
	//=======================================================================
	  DeleteNode: function( uuid, callback,param1,param2 )
	//=======================================================================
	{
		$.ajax({
			type : "DELETE",
			dataType : "text",
			url : "../../../"+serverBCK+"/nodes/node/" + uuid,
			success : function(data) {
				if (callback!=null && callback!='undefined')
					if (jQuery.isFunction(callback))
						callback(param1,param2);
					else
						eval(callback+"('"+param1+"','"+param2+"')");
			}
		});
	}
	

};

UICom.treeroot = {};
UICom.treerootid = {};
UICom.structure = {};
UICom.roles = new Set();

//=======================================================================
function xml2string(node)
//=======================================================================
{
	if (typeof(XMLSerializer) !== 'undefined') {
		var serializer = new XMLSerializer();
		return serializer.serializeToString(node);
	} else if (node.xml) {
		return node.xml;
	}
}
