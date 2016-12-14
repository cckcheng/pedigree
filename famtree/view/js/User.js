Ext.namespace('famtree');

famtree.user = function() {
	
	var config = {
		id:'famtree_user_grid_id',
		title: 'User',
		panelType:'user',
		shim:false,
		animCollapse:false,
		constrainHeader:true,
		loadMask: true,
				
		viewConfig: {
			forceFit:true,
			enableRowBody:true,
			showPreview:true,
			getRowClass : this.applyRowClass
		}
	
	};
	this.find_user = new Ext.form.TextField();

        this.find_user.on("specialkey", function(field,e){
		if ( e.getKey() == e.RETURN || e.getKey() == e.ENTER ) {
                        this.handle_findUser();
                }
            },
            this);


	var refreshButton = new Ext.Button ({
        	iconCls:'refresh',
			text:'Refresh',
			width:80
			  		
    	});
	refreshButton.on('click', function(){
		var search_box = this.find_user.getValue();
		if (search_box == '') {
			this.getStore().baseParams.action = 'getUserList';
		}
		this.getStore().load(); 
            },
	this);

	this.sm = new Ext.grid.RowSelectionModel({ singleSelect:true });
	this.cm =  new Ext.grid.ColumnModel([
		{
			header: 'User ID',
			dataIndex: 'id', 
			width: 60,
			hidden:true,
			menuDisabled:true,
			align:'left',
			sortable: true
		},
		{
			header: 'Username',
			dataIndex: 'username', 
			width: 300,
			fixed: true,
			align:'left',
			menuDisabled:true,
			sortable: true
		},
		{
			header:"Full Name",
			dataIndex: 'name',
			width: 200,
			align:'left',
			menuDisabled:true,
			sortable: false
		},
		{
			header:"Manufacturer",
			dataIndex: 'manufacture',
			width: 100,
			fixed: true,
			align:'left',
			menuDisabled:true,
			sortable: false
		},
		
		{
			header:"Level",
			dataIndex: 'level',
			width: 150,
			fixed:true,
			renderer:this.renderLevel,
			align:'center',
			menuDisabled:true,
			sortable: false
		},
		{
			header:"Enable Status",
			dataIndex: 'disabled',
			width: 100,
			fixed: true,
			align:'left',
			renderer: this.renderStatus,
			menuDisabled:true,
			sortable: false
		},
		{
			header:"Action",
			dataIndex: 'tact',
			width: 120,
			fixed: true,
			align:'center',
			renderer:this.renderAction,
			menuDisabled:true,
			sortable: false
		}

	]);

	this.ds =  new Ext.data.JsonStore({
		baseParams: {dowhat:'Admin',action:'getUserList', disabled:1},
		url:	'actionServlet',
		totalProperty: 'total',
		root: 'users',
		fields: [
			{name: 'id'},
			{name: 'username'},
			{name: 'name'},
			{name: 'level'},
			{name: 'disabled'},
			{name: 'onused'},
			{name: 'manuf_id'},
			{name: 'manufacture'}
		],

		sortInfo:{field: 'username', direction: "ASC"} 
	});
	this.ds.on({'loadexception':famtree.handle_return_exception, scope:this});
	this.bbar = [
                    {
                        iconCls:'add',
			pressed: true,
			text: 'Add Manufacturer User',
			handler: this.handle_addManufactureUser,
			scope: this

                    },
                    {
                        iconCls:'add',
			pressed: true,
			text: 'Add Fortinet User',
			handler: this.handle_addFortinetUser,
			scope: this

                    },'->','Find User:',this.find_user,
                    {
			text: '',
			tooltip: 'Find User',
			handler: this.handle_findUser,
			iconCls:'find2',
			scope: this
                    },
                    '-',
                    refreshButton
	];
	
	this.collapsible= true;

	Ext.Panel.superclass.constructor.call(this,config);
	
}

Ext.extend(famtree.user,Ext.grid.GridPanel, {

	handle_delete : function(idx){
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		famtree.deleteUser(idx,ds);
	},
	handle_reset : function(idx){
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		famtree.resetUser(idx,ds);
	},
	handle_edit : function(idx){
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		var record = ds.getById(idx);
                var uname = record.get('username');
                if (uname.indexOf("@")>=0)
                    famtree.editUser('manufacture','edit',ds,record);
                else
                    famtree.editUser('fortinet','edit', ds, record);
	},
	renderLevel: function(value,p,record,ridx,cindx,dd) {
		var admin_macro = 50;
		if (famtree.global.macro.ADMIN_LEVEL) admin_macro = famtree.global.macro.ADMIN_LEVEL;
		var result = '';
		switch (value){
			case admin_macro:
				result = 'Administrator';
				break;
			default:
				result = 'Normal User';
				break;
		}
		return result;
	},
	renderStatus: function(value,p,record,ridx,cindx,dd) {
		if (record.data.disabled == 0) return 'Enabled';
		else return 'Disabled';
	},
	
	renderAction: function(value,p,record,ridx,cindx,dd) {
		var html_s='<table><tr>';
		html_s=html_s+'<td><img border=0 src="images/icons/fam/insert-before.gif"  style="cursor:hand" alt="Edit"';
		html_s=html_s+' ext:qtip="Edit" onclick="javascript:famtree.user.prototype.handle_edit({0})"';
		html_s=html_s+' ></td>';

                if (record.data.onused == 0) {
                    html_s=html_s+'<td><img border=0 src="images/icons/fam/trash.gif" style="cursor:hand" alt="Remove"';
                    html_s=html_s+' ext:qtip="Remove"';
                    html_s=html_s+' onclick="javascript:famtree.user.prototype.handle_delete({0})"';
                    html_s=html_s+'</td>';
                } else {
                    html_s = html_s + '<td></td>';
                }

		var usrname = record.get('username');
		if (usrname.indexOf("@")>=0){
			html_s=html_s+'<td><img border=0 src="images/icons/fam/arrow_rotate_anticlockwise.png" style="cursor:hand" alt="Reset"';
			html_s=html_s+' ext:qtip="Reset Password"';
			html_s=html_s+' onclick="javascript:famtree.user.prototype.handle_reset({0})"';
			html_s=html_s+'</td>';
		}
		
		html_s=html_s+'</tr></table>';
		return String.format(html_s,record.data.id,ridx);
	},
	handle_findUser :function() {
		var search_val = this.find_user.getValue();
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		if (search_val == ''){
			ds.baseParams.action = 'getUserList';
		}else{
			ds.baseParams.action = 'getUserByUsername';
			search_val = search_val.replace(/\*/g,'%');
			search_val = '%' + search_val.trim() + '%';
			ds.baseParams.username = search_val;
		}
		ds.load();
	},
	handle_addManufactureUser :function() {
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		famtree.editUser('manufacture','new',ds);
	},
        handle_addFortinetUser :function() {
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		famtree.editUser(fortinet','new',ds);
	}
});
famtree.editUser = function(type,which, ds, record){
	var str_macro_max = 255;
	var admin_macro = 50;
	if (famtree.global.macro.MAX_STRLEN) str_macro_max = famtree.global.macro.MAX_STRLEN;
	if (famtree.global.macro.ADMIN_LEVEL) admin_macro = famtree.global.macro.ADMIN_LEVEL;
	var saveButton = new Ext.Button ({
        	id:'famtree_save_button_id',
        	text: 'Save',
			minWidth: 80
    	});
	saveButton.on('click', mysavehandler, this);
		
	var username = new Ext.form.TextField
    	({
        	fieldLabel: 'Username',
        	name: 'username',
			maxLength: str_macro_max,
			allowBlank:false,
			msgTarget:'side',
			disabled: (type == 'fortinet' && which=='edit'),
        	anchor: '95%'
    	});
	var cname = new Ext.form.TextField
    	({
        	fieldLabel: 'Full Name',
        	name: 'name',
			maxLength: str_macro_max,
			msgTarget:'side',
        	anchor: '95%'
    	});
		
	var isadmin = new Ext.form.Checkbox ({
                hideLabel: true,
                labelWidth:100,
                name:'level',
                width:200,
                height:20,
                //boxLabel: 'Administrator?',
                hidden: type == 'manufacture',
                checked: false
        });
	var status = new Ext.form.Checkbox ({
                hideLabel: true,
                name:'status',
				width: 140
				//,
                //boxLabel: 'Disabled'
        });
	var statusLabel = new Ext.form.Label({
		html: (which=='new')?'':'<span style="font-size:small;">Disabled:&nbsp;&nbsp;</span>'
	});
	var adminLabel = new Ext.form.Label({
		html: (type=='manufacture')?'':'<span style="font-size:small;">Administrator:&nbsp;&nbsp;</span>'
	});
	var manuf_ds = new Ext.data.JsonStore ({
                fields:[
                    {
                        name:'name',
                        type:'string'
                    },
                    {
                        name:'id',
                        type:'int'
                    }
                ]
        });
	if (type == 'manufacture') loadManufList();
	var manufacture = new Ext.form.ComboBox({
                fieldLabel: 'Manufacturer',
				name: 'manufacturer',
                store: manuf_ds,
                mode: 'local',
				anchor: '95%',
                displayField: "name",
                valueField: "id",
                editable: false,
                selectOnFocus: true,
				hideLabel: type != 'manufacture',
                hidden: type != 'manufacture',
                triggerAction: 'all'

        });
	var ingroupds = new Ext.data.JsonStore ({
                fields:[
                        {name:'id', type:'int'},
                        {name:'name', type:'string'}
                ]
        });

	var outgroupds = new Ext.data.JsonStore ({
                fields:[
                        {name:'id', type:'int'},
                        {name:'name', type:'string'}
                ]
        });
		
	var formPanel = new Ext.form.FormPanel ({
        	baseCls: 'x-plain',
        	labelWidth: 250,
        	labelAlign: 'top',
        	items: [
					username,
					cname,
                    manufacture,
					{   xtype:'panel',
						baseCls:'x-plain',
						layout:'column',
                        items: [{
                                columnWidth:.6,
                                layout: 'column',
								baseCls: 'x-plain',
								border: false,
                                items: [adminLabel,isadmin]
                        }, {
                                columnWidth:.4,
                                layout: 'column',
								baseCls: 'x-plain',
								border: false,
                                items: [statusLabel,status]
                        }]
					},
					{   xtype:'itemselector',
						name: 'groups',
						id:'user_itemselector_id',
						fieldLabel: 'Set Group Membership',
						imagePath: 'ext-3.0.0/examples/ux/images',
						drawUpIcon:false,
						drawDownIcon:false,
						drawLeftIcon:true,
						drawRightIcon:true,
						drawTopIcon:false,
						drawBotIcon:false,
						multiselects: [{
                                    legend:"Available Groups",
                                    width: 265,
                                    height: 200,
                                    store: outgroupds,
                                    displayField: 'name',
                                    valueField: 'id'
            			},
						{
                                    legend:"Group Membership",
                                    width: 265,
                                    height: 200,
                                    store: ingroupds,
                                    displayField: 'name',
                                    valueField: 'id',
                                    tbar:[{
										text: 'clear',
										handler:function(){
                                            formPanel.getForm().findField('groups').reset();
										}
                                    }]
                		}
                 ]
			}
		]
    	});
		
    	var window = new Ext.Window
    	({
        	title: 'Edit User',
        	width: 580,
        	height:466,
        	layout: 'form',
        	plain:true,
        	bodyStyle:'padding:5px;',
        	buttonAlign:'center',
        	constrain:true,
        	modal: true,
        	items: formPanel,
        	buttons: [saveButton,
        		{
                            text: 'Cancel',
                            handler: function(){
				window.close();
                            }
			}
        	]

    	});
        window.show();
        if (which == 'new'){
                if (type == 'manufacture')
                    window.setTitle('Add Manufacturer User');
                else
                    window.setTitle('Add Fortinet User');
				status.hide();
				famtree.DataLoader('actionServlet',
					{'dowhat':'Admin','action':'getGroupList','shorted':1},
					this,
					handle_newgroupload,
					famtree.handle_server_exception
				);
		}else{
			var t_username = record.get('username');
			if (t_username.indexOf("@")>=0)
				window.setTitle("Edit Manufacturer User");
			else
				window.setTitle("Edit Fortinet User");
			var t_name = record.get('name');
			var user_id = record.get('id');
			var t_level = record.get('level');
			var tstatus = record.get('disabled');
			username.setValue(t_username);
			cname.setValue(t_name);
			if (t_level == admin_macro) isadmin.setValue(true);
			if (tstatus == 1) status.setValue(true);
			//var tonused = record.get('onused');
			//if (tonused) username.disable();
			famtree.DataLoader(
                    'actionServlet',
                    {'dowhat':'Admin','action':'getUser',id:user_id},
                    this,
                    handle_editgroupload,famtree.handle_server_exception
                );
		}
	
	if (famtree.global.user.level != famtree.global.macro.ADMIN_LEVEL) isadmin.disable();
        function afterManufLoad(scope,json){
		manuf_ds.loadData(json.results);
		if (which == 'new') return;
		var manuf_id = record.get('manuf_id');
		if (manuf_id) manufacture.setValue(manuf_id);
	}
	function loadManufList(){
	famtree.DataLoader('actionServlet',
                    {'dowhat':'Admin','action':'getManufactures','shorted':1, 'show_disabled':1},
                    this,
                    afterManufLoad,
                    famtree.handle_server_exception
                );
	}
	
	function handle_editgroupload(scope,json) {
                outgroupds.loadData(json.user.outusers);
                ingroupds.loadData(json.user.inusers);
	}
	function handle_newgroupload(scope,json) {
                outgroupds.loadData(json.groups);
	}
	function mysavehandler(){
		if (formPanel.form.isValid() == false) {
			Ext.Msg.minWidth = 360;
			Ext.MessageBox.alert('Errors', 'Please fix too long length or required field.');
			return;
		}
		var values = formPanel.getForm().getValues();      
		var para = new Object();
		para = values;
		if (which == 'new'){
			para.action = 'addUser';
		}else{
			para.action = 'editUser';
			var chk = status.getValue();
			if (chk == true) para.disabled = 1;
			else para.disabled = 0;
		}
		para.dowhat = 'Admin';
		para.type = type;
		if(record) para.id = record.get('id');
		var isadmin_value = isadmin.getValue();
		if (isadmin_value == true) 
			para.level = "on";
		else
			para.level = 0;
		var username_value = username.getValue();
		if (type == 'manufacture'){
                        if (username_value.indexOf("@")<0){
							Ext.Msg.minWidth = 360;
							Ext.MessageBox.alert('Errors', 'A normal user must use email address as a username.');
							return;
						}
		}else{
                        if (username_value.indexOf("@")>=0){
							Ext.Msg.minWidth = 360;
							Ext.MessageBox.alert('Errors', '@ is not allowed as a fortinet username.');
							return;
						}
		}
		var m_id = manufacture.getValue();
		para.manufacturer_id = m_id;
		if (!m_id && (type == 'manufacture')){
			Ext.Msg.minWidth = 360;
			Ext.MessageBox.alert('Errors', 'A normal user must have a manufacturer.');
			return;
		}
		famtree.doServerAction(para,afterSave,this);
		function afterSave(scope, json){
			window.close();
			if (which == 'new'){
				ds.baseParams.action = 'getUserList';
				var list_grid = Ext.getCmp('famtree_user_grid_id');
				if (list_grid) {
					list_grid.find_user.setValue('');
				}
				
			}
			ds.load({callback:function(){
				var grid = Ext.getCmp('famtree_user_grid_id');
				var id ;
				if (which == 'new') id = json.id;
				else id = record.get('id');
				famtree.setSelectedRow(grid,id);
				}
			});	
		}
	}		
}
famtree.deleteUser = function(id,ds){
		var mydelete = function (btn){
			if ( 'yes'==btn ){
            		var para = new Object();
					para.action = 'removeUser';
					para.dowhat = 'Admin';
					para.id = id;
					famtree.doServerAction(para,afterRemove,this);
			}
		};
		var helpInfo = 'Are you sure you want to delete the item?';
        Ext.Msg.minWidth = 360;
		Ext.MessageBox.confirm( 'Message',
                    helpInfo,
                    mydelete
		);

		function afterRemove(scope, json){
			var rec = ds.getById(id);
			ds.remove(rec);
                        var grid = Ext.getCmp('famtree_user_grid_id');
                        grid.getSelectionModel().clearSelections();
                }
 
}
famtree.resetUser = function(id,ds){
	var myreset = function (btn){
		if ( 'yes'==btn ){
            	var para = new Object();
				para.action = 'resetPassword';
				para.dowhat = 'Admin';
				para.id = id;
				famtree.doServerAction(para,afterReset,this);
		}
    };
	var helpInfo = 'Are you sure you want to reset the password for this user?';
	Ext.Msg.minWidth = 360;
	Ext.MessageBox.confirm( 'Message',
							helpInfo,
							myreset
        );

	function afterReset(scope, json){
		var grid = Ext.getCmp('famtree_user_grid_id');
		var ds = grid.getStore();
		ds.load({callback:function(){
					var grid = Ext.getCmp('famtree_user_grid_id');
					famtree.setSelectedRow(grid,id);
				}
		});
	}  
}
famtree.setSelectedRow = function(grid, id){
		var max_id = 0;
		var max_idx = 0;
		var ds = grid.getStore();
		var count = ds.getCount();
		if (count == 0) return;
		if (id == undefined){
			for (var j=0; j<count; j++){
				var tmprec = ds.getAt(j);
				var tid = tmprec.get('id');
				if (tid>max_id){
					max_id = tid;
					max_idx = j;
				}				
			}
			grid.getSelectionModel().selectRow(max_idx);
			var s_value = grid.getView().scroller.dom.scrollHeight ;
			grid.getView().scroller.scrollTo('top',s_value*(max_idx/count));
			return;
		}
		for (var i=0; i<count; i++){
			var rec = ds.getAt(i);
			var tmpid = rec.get('id');
			if (tmpid == id){
				grid.getSelectionModel().selectRow(i);
				var scroll_value = grid.getView().scroller.dom.scrollHeight ;
				grid.getView().scroller.scrollTo('top',scroll_value*(i/count));
				return;
			}
		}
}
// the following override fixed a IE bug in ItemSelector
Ext.override(Ext.ux.form.ItemSelector,{
    destroy: function(){
        if(this.fromMultiselect){
               this.fromMultiselect.destroy();
        }
        if(this.toMultiselect){
               this.toMultiselect.destroy();
        }
    }

});
Ext.override(Ext.ux.form.MultiSelect,{
    destroy: function(){

        Ext.destroy(this.fs);
        if (this.dragZone){
           Ext.dd.ScrollManager.unregister(this.dragZone.el);
            if (this.dragZone.destroy){
                this.dragZone.destroy();
            }
        }
        if (this.dropZone ) {
            Ext.dd.ScrollManager.unregister(this.dropZone.el);
            if (this.dropZone.destroy){
                this.dropZone.destroy();
            }
        }

        Ext.ux.form.MultiSelect.superclass.destroy.call(this);
    }

});
// the following override fixed a bug in ItemSelector
// this bug will happen in both FF and IE when you drag one item to select window then immediately try to drag it back to available win
Ext.override(Ext.ux.form.MultiSelect.DropZone,{
   onNodeDrop : function(n, dd, e, data){
        if (this.ms.fireEvent("drop", this, n, dd, e, data) === false) {
            return false;
        }
        var pt = this.getDropPoint(e, n, dd);
        if (n != this.ms.fs.body.dom)
            n = this.view.findItemFromChild(n);
        var insertAt = (this.ms.appendOnly || (n == this.ms.fs.body.dom)) ? this.view.store.getCount()-1 : this.view.indexOf(n);
        if (pt == "below") {
            insertAt++;
        }

        var dir = false;

        // Validate if dragging within the same MultiSelect
        if (data.sourceView == this.view) {
            // If the first element to be inserted below is the target node, remove it
            if (pt == "below") {
                if (data.viewNodes[0] == n) {
                    data.viewNodes.shift();
                }
            } else {  // If the last element to be inserted above is the target node, remove it
                if (data.viewNodes[data.viewNodes.length - 1] == n) {
                    data.viewNodes.pop();
                }
            }

            // Nothing to drop...
            if (!data.viewNodes.length) {
                return false;
            }

            // If we are moving DOWN, then because a store.remove() takes place first,
            // the insertAt must be decremented.
            if (insertAt > this.view.store.indexOf(data.records[0])) {
                dir = 'down';
                insertAt--;
            }
        }

        for (var i = 0; i < data.records.length; i++) {
            var r = data.records[i];
            if (data.sourceView) {
                data.sourceView.store.remove(r);
            }
            this.view.store.insert(dir == 'down' ? insertAt : insertAt++, r);
            var si = this.view.store.sortInfo;
            if(si){
                this.view.store.sort(si.field, si.direction);
            }
        }
        return true;
    }


});

