/**
 * ##uploadify组件，用于文件上传##
 * @module bootstrap/uploadify
 * @author leiy
 */
define(function(require, exports, module) {
    (function ($) {

        /**
         * uploadify 插件
         * @method uploadify
         * @param {object} option 设置参数
         *  @param {boolean} option.enableHtml5Upload=true 开启自动识别是否支持HTML5，支持则用HTML5上传，反之用flash插件
         *  @param {boolean} option.auto=true  选中文件后自动上传
         *  @param {number} option.width 选择浏览文件按钮的的宽度
         *  @param {number} option.zIndex=999 上传按钮区域的z-index层级设置
         *  @param {number} option.height 选择浏览文件按钮的高度
         *  @param {string} option.uploadUrl 上传至服务端的路径
         *  @param {string} option.buttonClass=btn  显示按钮的样式，默认btn
         *  @param {string} option.buttonText=请选择文件  按钮中的文本
         *  @param {string} option.fileTypeDesc    文件类型不匹配时给出的描述
         *  @param {string} option.fileTypeExts    可以上传的文件类型
         *  @param {string} option.fileSizeLimit=10MB  单个上传文件最大大小,可接受单位(B KB MB GB,如果设为0,则不限制)
         *  @param {number} option.timeout=30  上传等待返回的超时时间，默认30秒
         * @return {object} **jQuery对象**
         */
        $.fn.uploadify = function (options) {
            if (methods[options]) {
                return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof options === 'object' || !options) {
                return this.each(function () {
                    methods.init.call(this, $.extend({},
                        $.fn.uploadify.defaults, options));
                });
            } else {
                $.error('The method ' + options + ' does not exist in $.uploadify');
            }
        }

        $.fn.uploadify.defaults = {
            enableHtml5Upload: true, //会优先判断是否使用HMTL5
            auto: true,	//是否自动上传文件 手动上传需要调用upload方法
            width: 100,	//选择浏览文件按钮的的宽度
            height: 30,	//选择浏览文件按钮的高度
            uploadUrl: consts.WEB_BASE + 'linux/put',
            buttonClass: 'btn btn-success',	 //浏览文件按钮的样式
            buttonText: '请选择文件',	// 选择文件按钮的文本描述
            fileTypeDesc: '',   // 浏览文件窗口的可选择文件类型的描述
            fileTypeExts: '',   // 浏览文件窗口允许选择文件的扩展名
            fileSizeLimit: '10MB',//单个上传文件最大大小,可接受单位(B KB MB GB,如果设为0,则不限制)
            multi: false,		// 浏览文件窗口是否允许选择多个文件(多文件上传)
            fileData: [],		//
            fileNumLimit: 0,	//一次选择上传文件的数量
            autoCheck: true,	//是否在初始化uploadify时检测flash版本
            showButton: true,	//是否在初始化uploadify时显示上传按钮
            showQueue: true,	 //是否在初始化uploadify时显示文件上传界面
            timeout: 120          //默认超时120秒

        };

        // These methods can be called by adding them as the first argument in the uploadify plugin call
        var methods = {
            isFlashAvailable: function () {
                var v = swfobject.getFlashPlayerVersion();
                return v.major && v.major >= 9;
            },

            init: function (options) {
                var id = $(this).attr("id"),
                    uploader = null;   //上传的对象

                //上传的路径	
                //options.uploadUrl = '../../kjdp_upload?DIR=' + options.dir + '&READFILE='+options.readfile 
                //		+'&IS_IMAGE_RESOURCE='+options.IS_IMAGE_RESOURCE +'&LOCAL_RESOURCE='+options.LOCAL_RESOURCE +'&UN_RENAME='+options.UN_RENAME;		 

                if (options.enableHtml5Upload && typeof(Worker) !== "undefined") {
                    uploader = new Html5Upload();
                } else {
                    uploader = new FlashUpload();
                }
                uploader.init($(this), options);
                $.data($("#" + id)[0], "uploader", uploader);


            },
            // 取消上传中的文件和从队列中删除它
            cancel: function (fileID, supressEvent) {
                var uploader = $.data(this, "uploader");
                uploader.cancel.call(this, fileID, supressEvent);

            },
            // 禁用选择文件按钮
            disable: function (isDisabled) {
                var id = $(this).attr("id"),
                    uploader = $.data($("#" + id)[0], "uploader");

                uploader.disable.call(this, isDisabled);
            },
            // 上传队列中文件
            upload: function () {
                var uploader = $.data($(this)[0], "uploader"),
                    args = arguments;
                uploader.upload.apply(this, args);
            },

            //清除上传队列
            clear: function () {
                var uploader = $.data($(this)[0], "uploader");
                uploader.clear.call(this);
            },

            // 恢复DOM对象到初始状态
            destroy: function () {
                var uploader = $.data($(this)[0], "uploader");
                uploader.destroy($(this));
            },

            // 设置上传按钮的文本内容
            setButtonText: function(text){
                var uploader = $.data($(this)[0], "uploader");
                uploader.setButtonText.call(this, text);
            },
            
            // 动态添加formData参数
            addFormData: function(data){
            	 var uploader = $.data($(this)[0], "uploader");
                 uploader.addFormData.call(this, data);
            }
        };

        /**html5上传对象及其功能**/
        //单例模式得到html5上传对象
        var Html5Upload = function () {
            // 缓存的实例    
            var instance = this;
            // 重写构造函数    
            Html5Upload = function () {
                return instance;
            };
        }
        Html5Upload.prototype.init = function (target, c) {
            var $this = $(target), self = this;
            $this.data("uploadify", {
                inputs: {},
                inputCount: 0,
                fileID: 0,
                queue: {
                    count: 0,
                    selected: 0,
                    replaced: 0,
                    errors: 0,
                    queued: 0,
                    cancelled: 0,
                    downloaded: 0
                },
                uploads: {
                    current: 0,
                    attempts: 0,
                    successful: 0,
                    errors: 0,
                    count: 0
                },
                width: 100,
                height: 30
            });
            var d = $this.data("uploadify");
            var f = d.settings = $.extend({
                auto: false,
                buttonClass: false,
                buttonText: "请选择文件",
                checkScript: false,
                dnd: true,
                dropTarget: false,
                fileObjName: "uploadFile",
                fileSizeLimit: "0",
                fileType: true,
                formData: {},
                height: 30,
                itemTemplate: false,
                method: "post",
                multi: true,
                overrideEvents: [],
                queueID: false,
                fileNumLimit: 0,
                removeCompleted: false,
                simUploadLimit: 0,
                truncateLength: 0,
                uploadLimit: 0,
                uploadUrl: "",
                width: 100,
                isSimple:true,
                zIndex:999,
                fileType:{
                    image:["jpg","png","bmp","gif","jpeg"]
                }

            }, c);
            f.basefileSizeLimit = f.fileSizeLimit;
            if (isNaN(f.fileSizeLimit)) {
                var e = parseInt(f.fileSizeLimit) * 1.024;
                if (f.fileSizeLimit.indexOf("KB") > -1) {
                    f.fileSizeLimit = e * 1000;
                } else {
                    if (f.fileSizeLimit.indexOf("MB") > -1) {
                        f.fileSizeLimit = e * 1000000;
                    } else {
                        if (f.fileSizeLimit.indexOf("GB") > -1) {
                            f.fileSizeLimit = e * 1000000000;
                        }
                    }
                }
            } else {
                f.fileSizeLimit = f.fileSizeLimit * 1024;
            }

            if (f.itemTemplate == false) {
                d.queueItem = $('<div class="uploadify-queue-item hide"><div class="cancel"><a class="close" href="#"></a></div><div>'
                    + '<span class="filename"></span><span class="fileinfo"></span></div>'
                    //+'<div class="progress"><div class="progress-bar"></div></div></div>');
                    + '<div class="uploadify-progress"><div class="uploadify-progress-bar"></div></div></div>');
            } else {
                d.queueItem = $(f.itemTemplate);
            }

            /**start */
            d.inputTemplate = $('<input type="file">').css({
                position: "absolute",
                "font-size": f.height + "px",
                height:f.height + "px",
                //width: "235px",
                opacity: 0,
                right: 0,
                top: 0,
                "z-index": f.zIndex,
                visibility:"visible",
                cursor: "pointer"
            });

            d.createInput = function () {
                var fileInput = d.inputTemplate.clone();
                var k = fileInput.name = "input" + d.inputCount++;
                if (f.multi) {
                    fileInput.attr("multiple", true);
                }

                //过滤选择的文件类型
                if(f.fileTypeExts){
                    var accepts=[];
                    for(var ft in f.fileType){
                        if(f.fileType.hasOwnProperty(ft)){
                            var types = f.fileType[ft];
                            for(var i = 0,l=types.length;i<l;i++){
                                if(f.fileTypeExts.indexOf(types[i])>0){
                                    accepts.push(ft+"/"+types[i]);
                                }
                            }
                        }
                    }
                    fileInput.attr("accept",accepts.join(","));
                }


                fileInput.bind("change",function () {
                    d.queue.selected = 0;
                    d.queue.replaced = 0;
                    d.queue.errors = 0;
                    d.queue.queued = 0;
                    var l = this.files.length;
                    d.queue.selected = l;

                    for (var m = 0; m < l; m++) {
                        file = this.files[m];
                        d.addQueueItem(file);
                    }
                    d.inputs[k] = this;
                    d.createInput();
                    if (f.auto) {
                        self.upload.call($this);
                    }
                    if (typeof f.onSelect === "function") {
                        f.onSelect.call($this, d.queue);
                    }
                });
                if (d.currentInput) {
                    d.currentInput.hide();
                }
                d.button.append(fileInput);
                d.currentInput = fileInput;
            };
            d.destroyInput = function (j) {
                $(d.inputs[j]).remove();
                delete d.inputs[j];
                d.inputCount--;
            };
            d.drop = function (m) {
                d.queue.selected = 0;
                d.queue.replaced = 0;
                d.queue.errors = 0;
                d.queue.queued = 0;
                var l = m.dataTransfer;

                var k = l.name = "input" + d.inputCount++;
                var j = l.files.length;
                d.queue.selected = j;


                for (var o = 0; o < j; o++) {
                    file = l.files[o];
                    d.addQueueItem(file);
                }
                d.inputs[k] = l;

                if (f.auto) {
                    self.upload($this);
                }
                if (typeof f.onDrop === "function") {
                    f.onDrop.call($this, l.files, l.files.length);
                }
                m.preventDefault();
                m.stopPropagation();
            };
            d.fileExistsInQueue = function (k) {
                for (var j in d.inputs) {
                    input = d.inputs[j];
                    limit = input.files.length;
                    for (var l = 0; l < limit; l++) {
                        existingFile = input.files[l];
                        if (existingFile.name == k.name
                            && !existingFile.complete) {
                            return true;
                        }
                    }
                }
                return false;
            };
            d.removeExistingFile = function (k) {
                for (var j in d.inputs) {
                    input = d.inputs[j];
                    limit = input.files.length;
                    for (var l = 0; l < limit; l++) {
                        existingFile = input.files[l];
                        if (existingFile.name == k.name
                            && !existingFile.complete) {
                            d.queue.replaced++;
                            self.cancel($this, existingFile, true);
                        }
                    }
                }
            };
            d.addQueueItem = function (k) {
                var e = $.Event("closeDialog");
                $(target).trigger(e, k);
                if(e.isDefaultPrevented()){
                    return false;
                }

                if ($.inArray("onAddQueueItem", f.overrideEvents) < 0) {
                    d.removeExistingFile(k);
                    k.queueItem = d.queueItem.clone();
                    var id = f.id + "-file-" + d.fileID++;
                    k.queueItem.attr("id", id);
                    k.queueItem.find(".close").bind("click",
                        function () {
                            self.cancel($this, k);
                            return false;
                        });
                    k.queueItem.find(".filename").html(k.name);
                    k.queueItem.data("file", k);
                    d.queueEl.append(k.queueItem);
                    if (!f.showQueue) {
                        $("#" + id).hide();
                    }
                }
                if (typeof f.onAddQueueItem === "function") {
                    f.onAddQueueItem.call($this, k);
                }

                if(f.fileTypeExts){
                    var name = k.name.split(".");
                    var _fileType = name[name.length-1],
                        types = f.fileTypeExts.split(";");
                    result = false;
                    for(var i=0,typesLen = types.length;i<typesLen;i++){
                        if(types[i].split(".")[1] == _fileType){
                            result = true;
                            break;
                        }
                    }
                    if(!result){
                        d.error("FORBIDDEN_FILE_TYPE", k);
                    }
                }

                if ((d.queue.count + 1) > f.fileNumLimit
                    && f.fileNumLimit !== 0) {
                    if ($.inArray("onError",f.overrideEvents) < 0) {
                        d.error("FILE_NUM_LIMIT_EXCEEDED", k, f);
                    }
                }

                if (k.size > f.fileSizeLimit
                    && f.fileSizeLimit != 0) {
                    d.error("FILE_SIZE_LIMIT_EXCEEDED", k, f);
                } else {
                    d.queue.queued++;
                    d.queue.count++;
                }
            };
            d.removeQueueItem = function (m, l, k) {
                var target = this;
                if (!k) {
                    k = 0;
                }
                var j = l ? 0 : 500;
                if (m.queueItem) {
                    if (m.queueItem.find(".fileinfo").html() != " - Completed") {
                        m.queueItem.find(".fileinfo").html(
                            " - Cancelled");
                    }
                    m.queueItem.find(".uploadify-progress-bar").width(0);
                    m.queueItem.delay(k).fadeOut(j, function () {
                        $(this).remove();
                    });
                    if(f.isSimple)return false;
                    // 灵活设置跳转路径
                    var strFullPath = window.document.location.href;
                    var strPath = window.document.location.pathname;
                    var pos = strFullPath.indexOf(strPath);
                    var prePath = strFullPath.substring(0, pos);
                    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
                    var path = prePath + postPath + "/servlet/Delete";
                    //设置一个判断是否删除服务器端文件成功的boolean值
                    var flag = false;
                    //创建一个XMLHttpRequest对象用于在后台与服务器交换数据
                    xhr = k.xhr = new XMLHttpRequest();
                    //发送请求
                    xhr.open("POST", path, true);
                    //获取删除文件名
                    var fileName = m.name;
                    //设置参数头
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    //向后台发送参数
                    xhr.send("name=" + fileName);
                    delete m.queueItem;
                    d.queue.count--;
                }
            };
            d.filesToUpload = function () {
                var k = 0;
                for (var j in d.inputs) {
                    input = d.inputs[j];
                    limit = input.files.length;
                    for (var l = 0; l < limit; l++) {
                        file = input.files[l];
                        if (!file.skip && !file.complete) {
                            k++;
                        }
                    }
                }
                return k;
            };
            d.checkExists = function (k) {
                if ($.inArray("onCheck", f.overrideEvents) < 0) {
                    $.ajaxSetup({
                        async: false
                    });
                    var j = $.extend(f.formData, {
                        filename: k.name
                    });
                    $.post(f.checkScript, j, function (l) {
                        k.exists = parseInt(l);
                    });
                    if (k.exists) {
                        if (!confirm("A file named "
                            + k.name
                            + " already exists in the upload folder.\nWould you like to replace it?")) {
                            self.cancel($this, k);
                            return true;
                        }
                    }
                }
                if (typeof f.onCheck === "function") {
                    f.onCheck.call($this, k, k.exists);
                }
                return false;
            };

            d.uploadFile = function (k, l) {
                var target = this;
                if (k && !k.skip && !k.complete && !k.uploading) {
                    k.uploading = true;
                    d.uploads.current++;
                    d.uploads.attempted++;
                    xhr = k.xhr = new XMLHttpRequest();

                    xhr.open(f.method, f.uploadUrl, true);
                    xhr.timeout = f.timeout*1000;
                    xhr.ontimeout = function(){
                        var e = $.Event("timeout");
                        $this.trigger(e, f.timeout);
                    }
                    if (typeof FormData === "function"
                        || typeof FormData === "object") {
                        var m = new FormData();
                        m.append(f.fileObjName, k);
                        for (i in f.formData) {
                            m.append(i, f.formData[i]);
                        }
                        xhr.upload.addEventListener("progress",function (n) {
                            if (n.lengthComputable) {
                                d.progress(n, k);
                            }
                        }, false);
                        xhr.addEventListener("load",function (n) {
                            if (this.readyState == 4) {
                                k.uploading = false;
                                if (this.status == 200) {
                                    if (k.xhr.responseText !== "Invalid file type.") {
                                        d.uploadComplete.call(target,n, k, l);
                                    } else {
                                        d.error(k.xhr.responseText, k, l);
                                    }
                                } else {
                                    if (this.status == 404) {
                                        d.error("404_FILE_NOT_FOUND", k, l);
                                    } else {
                                        if (this.status == 403) {
                                            d.error("403_FORBIDDEN", k, l);
                                        } else {
                                            d.error("Unknown Error", k, l);
                                        }
                                    }
                                }
                            }
                        });
                        
                    	xhr.send(m);

                        xhr.onreadystatechange = function(){
                            if(xhr.readyState == 4){
                                try{
                                    var s = xhr.status;
                                    if(s < 200 || s >= 300){
                                        var e = $.Event("error");
                                        $this.trigger(e,s);
                                        if(d.proceBox){
                                        	d.upload_error_flag = true;
                                        	d.proceBox.css({'width': '0%'}).hide();
                                        }
                                    }
                                }catch(e){}
                            }else{}
                        };
                    } else {
                        var j = new FileReader();
                        j.onload = function (q) {
                            var t = "-------------------------"
                                + (new Date).getTime(), p = "--", o = "\r\n", s = "";
                            s += p + t + o;
                            s += 'Content-Disposition: form-data; name="' + f.fileObjName + '"';
                            if (k.name) {
                                s += '; filename="' + k.name + '"';
                            }
                            s += o;
                            s += "Content-Type: application/octet-stream" + o + o;
                            s += q.target.result + o;
                            for (key in f.formData) {
                                s += p + t + o;
                                s += 'Content-Disposition: form-data; name="' + key + '"' + o + o;
                                s += f.formData[key] + o;
                            }
                            s += p + t + p + o;
                            xhr.upload.addEventListener("progress", function (u) {
                                d.progress(u, k);
                            }, false);
                            xhr.addEventListener("load", function (v) {
                                k.uploading = false;
                                var u = this.status;
                                if (u == 404) {
                                    d.error("404_FILE_NOT_FOUND", k, l);
                                } else {
                                    if (k.xhr.responseText != "Invalid file type.") {
                                        d.uploadComplete.call(target,v, k, l);
                                    } else {
                                        d.error(k.xhr.responseText, k, l);
                                    }
                                }
                            }, false);
                            var n = f.uploadUrl;
                            if (f.method == "get") {
                                var r = $(f.formData).param();
                                n += r;
                            }
                            xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + t);
                            if (typeof f.onUploadFile === "function") {
                                f.onUploadFile.call($this, k);
                            }
                            xhr.sendAsBinary(s);
                        };
                        j.readAsBinaryString(k);
                    }
                }
            };
            d.progress = function (l, j) {
                if ($.inArray("onProgress", f.overrideEvents) < 0) {
                    if (l.lengthComputable) {
                        var k = Math.round((l.loaded / l.total) * 100);
                        var e = $.Event("progress");
                        try {
                        	if(d.upload_error_flag){
                        		d.upload_error_flag = false;
                        	} else {
                        		d.proceBox.show().text(k + '%').animate({
                        			width : (k < 5 ? 5 : k) + '%'
                        		}, 100);
                        	}
						} catch (e) {
						}
                        $(target).trigger(e, k);
                    }
                }

            };
            d.error = function (l, j, k) {
                var delay = -1;
                if ($.inArray("onError", f.overrideEvents) < 0) {
                    switch (l) {
                        case "404_FILE_NOT_FOUND":
                            errorMsg = "404 Error";
                            break;
                        case "403_FORBIDDEN":
                            errorMsg = "403 Forbidden";
                            break;
                        case "FORBIDDEN_FILE_TYPE":
                            errorMsg = "Forbidden File Type";
                            errorMsg = '这个文件 "' + j.name + '" 文件类型不支持 (' + f.fileTypeDesc + ').'
                            break;
                        case "FILE_SIZE_LIMIT_EXCEEDED":
                            errorMsg = "大小不能超过" + k.basefileSizeLimit;
                            break;
                        case "FILE_NUM_LIMIT_EXCEEDED":
                            errorMsg =  "选定的文件数量超过设置的上传文件数 (" + f.fileNumLimit + ").";
                            break;
                        default:
                            errorMsg = "Unknown Error";
                            break;
                    }

                    var e = $.Event("error");
                    $this.trigger(e, [errorMsg,l]);
                    if(d.proceBox){
                    	d.proceBox.css('width', '0%').hide();
                    }

                    j.skip = true;
                    if (l == "404_FILE_NOT_FOUND") {
                        d.uploads.errors++;
                    } else {
                        d.queue.errors++;
                    }
                }else{
                    if (k) {
                        self.upload($this, null, true);
                    }
                }
            };
            d.uploadComplete = function (l, j, k) {
                var target = this;
                var data = j.xhr.responseText;

                j.complete = true;
                d.uploads.successful++;
                d.uploads.count++;
                d.uploads.current--;
                delete j.xhr;

                var e = $.Event("uploadSuccess");
                $(target).trigger(e, [j,data]);
                
                if(d.proceBox){
                	setTimeout(function(){
                		d.proceBox.css('width', '0%').hide();
                	}, 200);
                }
            };
            d.queueComplete = function () {
                if (typeof f.onQueueComplete === "function") {
                    f.onQueueComplete.call($this, d.uploads);
                }
            };
            //设置上传启用、禁用
            d.disable = function (isDisabled) {
                var uploadPanel = $("#uploadify-" + $this.attr("id"));
                var btn = uploadPanel.find(".uploadify-button");
                var fileInput = uploadPanel.find("input[type='file']");
                if (isDisabled) {
                    btn.addClass("disabled");
                    uploadPanel.addClass("disabled");
                    btn.attr("disabled",true);
                    fileInput.attr("disabled", true).css({
                        cursor:"default"
                    });
                } else {
                    fileInput.removeAttr("disabled").css({
                        cursor:"pointer"
                    });
                    btn.removeClass("disabled");
                    btn.removeAttr("disabled");
                    uploadPanel.removeClass("disabled");
                }
            };
            /** end */

            if (window.File && window.FileList && window.Blob
                && (window.FileReader || window.FormData)) {
                f.id = "uploadify-" + $this.attr("id");

                var textStr = f.showButton ? "<span class='buttonText'>"+f.buttonText+"</span>" : "";

                d.button = $('<div id="' + f.id + '">'
                    + textStr + "</div>");
                if (f.showButton) {
                    d.button.addClass("uploadify uploadify-button "+f.buttonClass);
                }
                var css = {
                    height: f.height,
                    "line-height": f.height + "px",
                    position: "relative",
                    "text-align": "center",
                    width: f.width,
                    padding: 0
                }

                d.button.css(css);

                var box = $("<div></div>");
                box.css({
                    overflow: "hidden",
                    height: f.height,
                    width: f.width+2
                });
                if (f.onlyView) {
                    box.attr("style", "visibility:hidden");
                }
                box.append(d.button);
                $this.before(box).appendTo(box).hide();
                
                d.proceBox = $('<div class="uploadify-process">0%</div>').css({
                	position: 'absolute',
                    height: '100%',
                    width: '0%',
                    left: 0,
                    top: 0,
                    "z-index": 0,
                    background: 'rgba(56, 56, 56, 0.56)',
                    display: 'none'
                });
                
                d.button.append(d.proceBox);

                var leftW = Number(d.button.css("padding-left").replace(/\D/g,""));
                var rightW = Number(d.button.css("padding-right").replace(/\D/g,""));
                var top = Number(d.button.css("padding-top").replace(/\D/g,""));
                var bottom = Number(d.button.css("padding-bottom").replace(/\D/g,""));

                var h = d.button.height()-top-bottom-2;
                d.button.css({
                    width : (d.button.width()-leftW-rightW-2)+"px"
                    ,height : h+"px"
                    ,"line-height":h+"px"
                });

                d.createInput.call($this);

                //点击上传触发onDialogOpen
                box.find("input[type='file']").bind("click", function () {
                    var e = $.Event("openDialog");
                    $(target).trigger(e,$this);
                });

                if (!f.queueID) {
                    f.queueID = f.id + "-queue";
                    d.queueEl = $('<div id="' + f.queueID
                        + '" class="uploadify-queue" />');
                    box.after(d.queueEl);
                } else {
                    d.queueEl = $("#" + f.queueID);
                }
                if (f.dnd) {
                    var h = f.dropTarget ? $(f.dropTarget)
                        : d.queueEl.get(0);
                    h.addEventListener("dragleave", function (j) {
                        j.preventDefault();
                        j.stopPropagation();
                    }, false);
                    h.addEventListener("dragenter", function (j) {
                        j.preventDefault();
                        j.stopPropagation();
                    }, false);
                    h.addEventListener("dragover", function (j) {
                        j.preventDefault();
                        j.stopPropagation();
                    }, false);
                    h.addEventListener("drop", d.drop, false);
                }
                if (!XMLHttpRequest.prototype.sendAsBinary) {
                    XMLHttpRequest.prototype.sendAsBinary = function (k) {
                        function l(n) {
                            return n.charCodeAt(0) & 255;
                        }

                        var m = Array.prototype.map.call(k, l);
                        var j = new Uint8Array(m);
                        this.send(j.buffer);
                    };
                }
                setTimeout(function(){
                    $(target).trigger($.Event("initComplete"),$this);
                },200);

            } else {
                if (typeof f.onFallback === "function") {
                    f.onFallback.call($this);
                }
                return false;
            }
        }

        Html5Upload.prototype.clearQueue = function (target) {
            var self = this, c = target.data("uploadify"), e = c.settings;
            for (var d in c.inputs) {
                input = c.inputs[d];
                limit = input.files.length;
                for (i = 0; i < limit; i++) {
                    file = input.files[i];
                    self.cancel(target, file);
                }
            }
            if (typeof e.onClearQueue === "function") {
                e.onClearQueue.call(f, $("#" + c.settings.queueID));
            }
        };
        Html5Upload.prototype.cancel = function (target, d, c) {
            var self = this, e = target.data("uploadify"), f = e.settings;
            if (typeof d === "string") {
                if (!isNaN(d)) {
                    fileID = "uploadify-" + target.attr("id") + "-file-"
                        + d;
                }
                d = $("#" + fileID).data("file");
            }
            d.skip = true;
            e.filesCancelled++;
            if (d.uploading) {
                e.uploads.current--;
                d.uploading = false;
                d.xhr.abort();
                delete d.xhr;
                self.upload(target);
            }
            if ($.inArray("onCancel", f.overrideEvents) < 0) {
                e.removeQueueItem.call(target,d, c);
            }
            if (typeof f.onCancel === "function") {
                f.onCancel.call($this, d);
            }
        }
        Html5Upload.prototype.upload = function (target, c, d) {
            //if(!state)return;
            var state = $(this).data("uploadify"), settings = state.settings;
            target = target || this;
            if (c) {
                state.uploadFile.call(target, c);
            } else {
                if ((state.uploads.count + state.uploads.current) < settings.uploadLimit
                    || settings.uploadLimit == 0) {
                    if (!d) {
                        state.uploads.attempted = 0;
                        state.uploads.successsful = 0;
                        state.uploads.errors = 0;
                        var $this = state.filesToUpload();
                        if (typeof settings.onUpload === "function") {
                            settings.onUpload.call($this, $this);
                        }
                    }
                    $("#" + settings.queueID)
                        .find(".uploadify-queue-item")
                        .not(".error, .complete")
                        .each(function () {
                            _file = $(this).data("file");
                            if ((state.uploads.current >= settings.simUploadLimit && settings.simUploadLimit !== 0)
                                || (state.uploads.current >= settings.uploadLimit && settings.uploadLimit !== 0)
                                || (state.uploads.count >= settings.uploadLimit && settings.uploadLimit !== 0)) {
                                return false;
                            }

                            if (settings.checkScript) {
                                _file.checking = true;
                                skipFile = state.checkExists(_file);
                                _file.checking = false;
                                if (!skipFile) {
                                    state.uploadFile.call($(target),_file, true);
                                }
                            } else {
                                state.uploadFile.call($(target),_file, true);
                            }
                        });
                    if ($("#" + settings.queueID).find(
                        ".uploadify-queue-item").not(
                        ".error, .complete").size() == 0) {
                        state.queueComplete();
                    }
                } else {
                    if (state.uploads.current == 0) {
                        if ($.inArray("onError", settings.overrideEvents) < 0) {
                            if (state.filesToUpload() > 0
                                && settings.uploadLimit != 0) {
                                alert("The maximum upload limit has been reached.");
                            }
                        }
                        if (typeof settings.onError === "function") {
                            settings.onError.call($this,
                                "UPLOAD_LIMIT_EXCEEDED", state
                                    .filesToUpload());
                        }
                    }
                }
            }
        };
        Html5Upload.prototype.destroy = function (target) {
            var self = this, state = target.data("uploadify"), settings = state.settings;
            self.clearQueue(target);
            if (!settings.queueID) {
                $("#" + settings.queueID).remove();
            }
            target.siblings("input").remove();
            target.show().insertBefore(state.button);
            state.button.remove();
            if (typeof settings.onDestroy === "function") {
                settings.onDestroy.call(target);
            }
        };

        //启用、禁用控件
        Html5Upload.prototype.disable = function (isDisabled) {
            var state = $(this).data("uploadify");
            state.disable(isDisabled);

        };

        //清除上传队列
        Html5Upload.prototype.clear = function () {
            var state = $(this).data("uploadify"), settings = state.settings;
            return  $(this).each(function () {
                $("#" + settings.queueID).find('div.uploadify-queue-item').remove();
            });
        };

        Html5Upload.prototype.setButtonText = function(text){
            var state = $(this).data("uploadify");
            state.button.find("span.buttonText").text(text);
        };
        
        Html5Upload.prototype.addFormData = function(data){
            var state = $(this).data("uploadify"), 
            	settings = state.settings;
            if(settings.formData && data){
            	for(var key in  data){
            		settings.formData[key] = data[key];
            	}
            }
        };

        /** flash 上传对象及其功能**/
        //单例模式得到html5上传对象
        var FlashUpload = function () {
            // 缓存的实例    
            var instance = this;
            // 重写构造函数    
            FlashUpload = function () {
                return instance;
            };
        };

        FlashUpload.prototype.init = function (target, options, swfUploadOptions) {
            if (options.autoCheck && !methods.isFlashAvailable()) {
                var settings = this.settings;
                if (settings && settings.onFallback) {
                    settings.onFallback.call($this);
                }
                alert("您的浏览器不支持Flash运行！");
                return false;
            }
            var self = this;

            var $this = target;

            var uploader = $.data($this[0], "uploader");

            var domId = $this.attr('id');
            var handlers = this.getHandlers();
            if (!$this.is('input')) {
                alert(options.definedInput);
                return;
            }
            if (typeof(domId) == 'undefined') {
                alert(options.definedId);
                return;
            }
            if (typeof($this.attr('type')) == 'undefined' || $this.attr('type') != 'file') {
                alert(options.definedType);
                return;
            }
            //页面退出时,移除flash对象,免除_remove_callBack_的报错
            if ($.browser.msie || $.browser.webkit){
                $(window).unload(function () {
                    $("object[id*=SWFUpload_]", 'body').parent().remove(".swfupload")
                });
            }
            var dir = options.dir || '';
            var readfile = options.readfile;

            options.successTimeout = options.timeout;

            return $this.each(function () {
                // Clone the original DOM object
                var $clone = $this.clone();
                // Setup the default options
                //设置默认的uploadify参数
                var settings = $.extend({
                        // Required Settings
                        id: domId,
                        // The ID of the DOM object
                        swf: consts.WEB_BASE+'lib/uploadify/uploadify.swf',
                        // The path to the uploadify SWF file
                        //uploadUrl: './servlet/Upload?DIR=' + dir + '&READFILE='+readfile,
                        // The path to the server-side upload script
                        //          dir:dir,
                        // Options
                        auto: true,
                        // Automatically upload files when added to the queue
                        //buttonClass     : '',                 // A class name to add to the browse button DOM object
                        buttonCursor: 'hand',
                        // The cursor to use with the browse button
                        //buttonImage     : null,               // (String or null) The path to an image to use for the Flash browse button if not using CSS to style the button
                        //buttonText      : 'SELECT FILES',     // The text to use for the browse button
                        checkExisting: false,
                        // The path to a server-side script that checks for existing files on the server
                        debug: false,
                        // Turn on swfUpload debugging mode
                        fileObjName: 'Filedata',
                        // The name of the file object to use in your server-side script
                        fileSizeLimit: 0,
                        // The maximum size of an uploadable file in KB (Accepts units B KB MB GB if string, 0 for no limit)
                        //fileTypeDesc    : 'All Files',        // The description for file types in the browse dialog
                        //fileTypeExts    : '*.*',              // Allowed extensions in the browse dialog (server-side validation should also be used)
                        itemTemplate: false,
                        // The template for the file item in the queue
                        method: 'post',
                        // The method to use when sending files to the server-side upload script
                        //multi           : true,               // Allow multiple file selection in the browse dialog
                        formData: {},
                        // An object with additional data to send to the server-side upload script with every file upload
                        preventCaching: true,
                        // Adds a random value to the Flash URL to prevent caching of it (conflicts with existing parameters)
                        progressData: 'percentage',
                        // ('percentage' or 'speed') Data to show in the queue item during a file upload
                        queueID: false,
                        // The ID of the DOM object to use as a file queue (without the #)
                        fileNumLimit: 999,
                        // The maximum number of files that can be in the queue at one time
                        removeCompleted: true,
                        // Remove queue items from the queue when they are done uploading
                        removeTimeout: 3,
                        // The delay in seconds before removing a queue item if removeCompleted is set to true
                        requeueErrors: false,
                        // Keep errored files in the queue and keep trying to upload them
                        successTimeout: 30,
                        // The number of seconds to wait for Flash to detect the server's response after the file has finished uploading
                        uploadLimit: 0,
                        // The maximum number of files you can upload
                        //width           : 120,                // The width of the browse button
                        //height          : 30,                 // The height of the browse button
                        // Events
                        overrideEvents: [] // (Array) A list of default event handlers to skip
                        /*
                         onCancel         // Triggered when a file is cancelled from the queue
                         onClearQueue     // Triggered during the 'clear queue' method
                         onDestroy        // Triggered when the uploadify object is destroyed
                         onDialogClose    // Triggered when the browse dialog is closed
                         onDialogOpen     // Triggered when the browse dialog is opened
                         onDisable        // Triggered when the browse button gets disabled
                         onEnable         // Triggered when the browse button gets enabled
                         onFallback       // Triggered is Flash is not detected    
                         onInit           // Triggered when Uploadify is initialized
                         onQueueComplete  // Triggered when all files in the queue have been uploaded
                         onSelectError    // Triggered when an error occurs while selecting a file (file size, queue size limit, etc.)
                         onSelect         // Triggered for each file that is selected
                         onSWFReady       // Triggered when the SWF button is loaded
                         onUploadComplete // Triggered when a file upload completes (success or error)
                         onUploadError    // Triggered when a file upload returns an error
                         onUploadSuccess  // Triggered when a file is uploaded successfully
                         onUploadProgress // Triggered every time a file progress is updated
                         onUploadStart    // Triggered immediately before a file upload starts
                         */
                    },
                    options);
                // Prepare settings for SWFUpload
                var swfUploadSettings = {
                    assume_success_timeout: settings.successTimeout,
                    button_placeholder_id: settings.id,
                    button_width: settings.width,
                    button_height: settings.height,
                    button_text: null,
                    button_text_style: null,
                    button_text_top_padding: 0,
                    button_text_left_padding: 0,
                    button_action: (settings.multi ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE),
                    button_disabled: false,
                    button_cursor: (settings.buttonCursor == 'arrow' ? SWFUpload.CURSOR.ARROW : SWFUpload.CURSOR.HAND),
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    debug: settings.debug,
                    requeue_on_error: settings.requeueErrors,
                    file_post_name: settings.fileObjName,
                    file_size_limit: settings.fileSizeLimit,
                    file_types: settings.fileTypeExts,
                    file_types_description: settings.fileTypeDesc,
                    file_queue_limit: settings.fileNumLimit,
                    file_upload_limit: settings.uploadLimit,
                    flash_url: settings.swf,
                    prevent_swf_caching: settings.preventCaching,
                    post_params: settings.formData,
                    upload_url: settings.uploadUrl,
                    use_query_string: (settings.method == 'get'),

                    // Event Handlers 
                    file_dialog_complete_handler: handlers.onDialogClose,
                    file_dialog_start_handler: handlers.onDialogOpen,
                    file_queued_handler: handlers.onSelect,
                    file_queue_error_handler: handlers.onSelectError,
                    swfupload_loaded_handler: settings.onSWFReady,
                    upload_complete_handler: handlers.onUploadComplete,
                    upload_error_handler: handlers.onUploadError,
                    //upload_progress_handler: handlers.onUploadProgress,
                    //upload_start_handler: handlers.onUploadStart,
                    upload_success_handler: handlers.onUploadSuccess
                }
                // Merge the user-defined options with the defaults
                if (swfUploadOptions) {
                    swfUploadSettings = $.extend(swfUploadSettings, swfUploadOptions);
                }
                // Add the user-defined settings to the swfupload object
                swfUploadSettings = $.extend(swfUploadSettings, settings);
                // Create the swfUpload instance 创建上传对象实例
                window['uploadify_' + settings.id] = new SWFUpload(swfUploadSettings,$this);

                var swfuploadify = window['uploadify_' + settings.id];
                // Add the SWFUpload object to the elements data object
                $.data($(this)[0], 'uploadify', swfuploadify);
                // Wrap the instance
                var $wrapper = $('<div />', {
                    'id': settings.id,
                    'name': $this.attr('name'),
                    'class': 'uploadify',
                    'css': {
                        'position':'relative',
                        'height': settings.height + 'px',
                        'width': settings.width + 'px'
                    }
                });
                $('#' + swfuploadify.movieName).wrap($wrapper);
                // Recreate the reference to wrapper
                $wrapper = $('#' + settings.id);
                // Add the data object to the wrapper 
                $wrapper.data('uploadify', swfuploadify);
                // Create the button 创建显示上传文件按钮
                if (settings.showButton) {
                    var $button = $('<span/>', {
                        'id': settings.id + '-button',
                        'class': 'uploadify-button buttonText'
                    });
                    if (settings.buttonImage) {
                        $button.css({
                            'background-image': "url('" + settings.buttonImage + "')",
                            'text-indent': '-9999px'
                        });
                    }
                    $button.html(settings.buttonText).css({
                        width:settings.width+"px",
                        height:settings.height+"px",
                        'line-height':settings.height+"px"
                    });
                } else {
                    $button = $();
                }
                // Append the button to the wrapper
                $wrapper.append($button);
                var $hidden = $('<input type="hidden" name="' + $this.attr("name") + '">');
                $wrapper.append($hidden).addClass(settings.buttonClass);
                // Adjust the styles of the movie
                $('#' + swfuploadify.movieName).css({
                    'position': 'absolute',
                    'z-index': 1,
                    'top': 0,
                    'right': 0
                });
                if (settings.movieClass) {
                    $('#' + swfuploadify.movieName).addClass(settings.movieClass);
                }
                // Create the file queue
                if (!settings.queueID) {
                    var $queue = settings.showQueue ?
                        $('<div style="width:auto;"/>').attr("id", settings.id + '-queue').attr("class", "uploadify-queue")
                        : $();
                    $wrapper.after($queue);
                    swfuploadify.settings.queueID = settings.id + '-queue';
                    swfuploadify.settings.defaultQueue = true;
                }
                // Create some queue related objects and variables
                swfuploadify.queueData = {
                    files: {},
                    // The files in the queue
                    filesSelected: 0,
                    // The number of files selected in the last select operation
                    filesQueued: 0,
                    // The number of files added to the queue in the last select operation
                    filesReplaced: 0,
                    // The number of files replaced in the last select operation
                    filesCancelled: 0,
                    // The number of files that were cancelled instead of replaced
                    filesErrored: 0,
                    // The number of files that caused error in the last select operation
                    uploadsSuccessful: 0,
                    // The number of files that were successfully uploaded
                    uploadsErrored: 0,
                    // The number of files that returned errors during upload
                    averageSpeed: 0,
                    // The average speed of the uploads in KB
                    queueLength: 0,
                    // The number of files in the queue
                    queueSize: 0,
                    // The size in bytes of the entire queue
                    uploadSize: 0,
                    // The size in bytes of the upload queue
                    queueBytesUploaded: 0,
                    // The size in bytes that have been uploaded for the current upload queue
                    uploadQueue: [],
                    // The files currently to be uploaded
                    //errorMsg: 'Some files were not added to the queue:'
                    errorMsg: '文件没有添加到队列'
                };
                // Save references to all the objects
                swfuploadify.original = $clone;
                swfuploadify.wrapper = $wrapper;
                swfuploadify.button = $button;
                swfuploadify.queue = $queue;
                if (settings.onlyView) {
                    $wrapper.hide();
                    swfuploadify.queue.find('div.cancel').hide();
                }
                //如果仅是下载文件,则不展示browser按钮
                if (settings.fileData && settings.fileData.length) {
                    $hidden.val("" + settings.fileData);
                    return self.showFiles($this, settings.fileData);
                }
                //如果设置multi为false,则是上传一个文件
                // Call the user-defined init event handler
                if (settings.onInit) settings.onInit.call($this, swfuploadify);

                setTimeout(function(){
                    $this.trigger($.Event("initComplete"));
                },200);

                var leftW = Number($wrapper.css("padding-left").replace(/\D/g,""));
                var rightW = Number($wrapper.css("padding-right").replace(/\D/g,""));
                var top = Number($wrapper.css("padding-top").replace(/\D/g,""));
                var bottom = Number($wrapper.css("padding-bottom").replace(/\D/g,""));

                var h = $wrapper.height()-top-bottom-2;
                var css = {
                    width : ($wrapper.width()-leftW-rightW-2)+"px"
                    ,height : h+"px"
                    ,"line-height":h+"px"
                };
                $wrapper.css(css);
                $button.css(css);
            });


        }
        FlashUpload.prototype.getHandlers = function () {
            return {
                // Triggered when the file dialog is opened
                onDialogOpen: function () {
                    // Load the swfupload settings
                    var settings = this.settings;
                    this.currentFile = undefined;
                    // Reset some queue info
                    //this.queueData.errorMsg = 'Some files were not added to the queue:';
                    this.queueData.errorMsg = '文件没有添加到队列';
                    this.queueData.filesReplaced = 0;
                    this.queueData.filesCancelled = 0;
                    // Call the user-defined event handler
                    var e = $.Event("openDialog");
                    $(this.target).trigger(e);
                },
                // Triggered when the browse dialog is closed
                onDialogClose: function (filesSelected, filesQueued, queueLength) {
                    // Load the swfupload settings
                    var settings = this.settings;
                    // Update the queue information
                    this.queueData.filesErrored = filesSelected - filesQueued;
                    this.queueData.filesSelected = filesSelected;
                    this.queueData.filesQueued = filesQueued - this.queueData.filesCancelled;
                    this.queueData.queueLength = queueLength;

                    // Run the default event handler
                    if ($.inArray(' ', settings.overrideEvents) < 0) {
                        var e = $.Event("closeDialog");
                        $(this.target).trigger(e, this.currentFile);
                        if(e.isDefaultPrevented()){
                            return false;
                        }

                        if (this.queueData.filesErrored > 0) {
                            $(this.target).trigger($.Event("error"), this.queueData.errorMsg);
                        }
                    }

                    if (settings.auto) $('#' + settings.id).uploadify('upload', '*');
                },
                // Triggered once for each file added to the queue
                onSelect: function (file) {
                    // Load the swfupload settings
                    var settings = this.settings;
                    this.currentFile = file;
                    // Check if a file with the same name exists in the queue
                    var queuedFile = {};
                    for (var n in this.queueData.files) {
                        queuedFile = this.queueData.files[n];
                        if (queuedFile.uploaded != true && queuedFile.name == file.name) {
                            $('#' + queuedFile.id).remove();
                            this.cancelUpload(queuedFile.id);
                            this.queueData.filesReplaced++;
                        }
                    }

                    // Get the size of the file
                    var fileSize = Math.round(file.size / 1024);
                    var suffix = 'KB';
                    if (fileSize > 1000) {
                        fileSize = Math.round(fileSize / 1000);
                        suffix = 'MB';
                    }
                    var fileSizeParts = fileSize.toString().split('.');
                    fileSize = fileSizeParts[0];
                    if (fileSizeParts.length > 1) {
                        fileSize += '.' + fileSizeParts[1].substr(0, 2);
                    }
                    fileSize += suffix;

                    // Truncate the FILENAME if it's too long
                    var FILENAME = file.name;
                    if (FILENAME.length > 25) {
                        FILENAME = FILENAME.substr(0, 25) + '...';
                    }

                    // Create the file data object
                    itemData = {
                        'fileID': file.id,
                        'instanceID': settings.id,
                        'FILENAME': FILENAME,
                        'fileSize': fileSize
                    }

                    // Create the file item template
                    if (settings.itemTemplate == false) {
                        settings.itemTemplate = '<div id="${fileID}" class="uploadify-queue-item">\
    					<div class="cancel">\
    						<a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')"></a>\
    					</div>\
    					<span class="FILENAME">${FILENAME}</span><span class="data"></span>\
    					<div class="uploadify-progress">\
    						<div class="uploadify-progress-bar"><!--Progress Bar--></div>\
    					</div>\
    				</div>';
                    }

                    // Run the default event handler
                    if ($.inArray('onSelect', settings.overrideEvents) < 0) {

                        // Replace the item data in the template
                        itemHTML = settings.itemTemplate;
                        for (var d in itemData) {
                            itemHTML = itemHTML.replace(new RegExp('\\$\\{' + d + '\\}', 'g'), itemData[d]);
                        }

                        // Add the file item to the queue
                        $('#' + settings.queueID).append(itemHTML);
                    }

                    this.queueData.queueSize += file.size;
                    this.queueData.files[file.id] = file;

                    // Call the user-defined event handler
                    if (settings.onSelect) settings.onSelect.apply(this, arguments);
                },
                // Triggered when a file is not added to the queue
                onSelectError: function (file, errorCode, errorMsg) {
                    // Load the swfupload settings
                    var settings = this.settings;
                    this.currentFile = file;
                    // Run the default event handler
                    if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
                        switch (errorCode) {
                            case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                                if (settings.fileNumLimit > errorMsg) {
                                    //this.queueData.errorMsg += '\nThe number of files selected exceeds the remaining upload limit (' + errorMsg + ').';
                                    this.queueData.errorMsg += '\n选定的文件数量超过剩余的上传限制 (' + errorMsg + ').';
                                } else {
                                    //this.queueData.errorMsg += '\nThe number of files selected exceeds the queue size limit (' + settings.fileNumLimit + ').';
                                    this.queueData.errorMsg += '\n选定的文件数量超过该队列的大小限制 (' + settings.fileNumLimit + ').';
                                }
                                break;
                            case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                                //this.queueData.errorMsg += '\nThe file "' + file.name + '" exceeds the size limit (' + settings.fileSizeLimit + ').';
                                this.queueData.errorMsg += '\n这个文件"' + file.name + '" 大小不能超过 (' + settings.fileSizeLimit + ').';
                                break;
                            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                                //this.queueData.errorMsg += '\nThe file "' + file.name + '" is empty.';
                                this.queueData.errorMsg += '\n这个文件"' + file.name + '"的内容为空.';
                                break;
                            case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                                //this.queueData.errorMsg += '\nThe file "' + file.name + '" is not an accepted file type (' + settings.fileTypeDesc + ').';
                                this.queueData.errorMsg += '\n这个文件 "' + file.name + '" 文件类型不支持 (' + settings.fileTypeDesc + ').';
                                break;
                        }
                    }
                    if (errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                        delete this.queueData.files[file.id];
                    }

                    // Call the user-defined event handler
                    if (settings.onSelectError) settings.onSelectError.apply(this, arguments);
                },
                // Triggered when all the files in the queue have been processed
                onQueueComplete: function () {
                    if (this.settings.onQueueComplete) this.settings.onQueueComplete.call(this, this.settings.queueData);
                },
                // Triggered when a file upload successfully completes
                onUploadComplete: function (file) {
                    // Load the swfupload settings
                    var settings = this.settings,
                        swfuploadify = this;
                    // Check if all the files have completed uploading
                    var stats = this.getStats();
                    this.queueData.queueLength = stats.files_queued;
                    if (this.queueData.uploadQueue[0] == '*') {
                        if (this.queueData.queueLength > 0) {
                            this.startUpload();
                        } else {
                            this.queueData.uploadQueue = [];
                            // Call the user-defined event handler for queue complete
                            if (settings.onQueueComplete) settings.onQueueComplete.call(this, this.queueData);
                        }
                    } else {
                        if (this.queueData.uploadQueue.length > 0) {
                            this.startUpload(this.queueData.uploadQueue.shift());
                        } else {
                            this.queueData.uploadQueue = [];
                            // Call the user-defined event handler for queue complete
                            if (settings.onQueueComplete) settings.onQueueComplete.call(this, this.queueData);
                        }
                    }
                    // Call the default event handler
                    if ($.inArray('onUploadComplete', settings.overrideEvents) < 0) {
                        if (settings.removeCompleted) {
                            switch (file.filestatus) {
                                case SWFUpload.FILE_STATUS.COMPLETE:
                                    
                                    break;
                                case SWFUpload.FILE_STATUS.ERROR:
                                    if (!settings.requeueErrors) {
                                        setTimeout(function () {
                                                if ($('#' + file.id)) {
                                                    swfuploadify.queueData.queueSize -= file.size;
                                                    swfuploadify.queueData.queueLength -= 1;
                                                    delete swfuploadify.queueData.files[file.id];
                                                    $('#' + file.id).fadeOut(500,
                                                        function () {
                                                            $(this).remove();
                                                        });
                                                }
                                            },
                                                settings.removeTimeout * 100);
                                    }
                                    break;
                            }
                        } else {
                            file.uploaded = true;
                        }
                    }

                    // Call the user-defined event handler
                    if (settings.onUploadComplete) settings.onUploadComplete.call(this, file);
                },
                // Triggered when a file upload returns an error
                onUploadError: function (file, errorCode, errorMsg) {
                    // Load the swfupload settings
                    var settings = this.settings;

                    // Set the error string
                    var errorString = 'Error';
                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            errorString = 'HTTP Error (' + errorMsg + ')';
                            break;
                        case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
                            errorString = 'Missing Upload URL';
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            errorString = 'IO Error';
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            errorString = 'Security Error';
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            errorString = 'Exceeds Upload Limit';
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            errorString = 'Failed';
                            break;
                        case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            errorString = 'Validation Error';
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            errorString = 'Cancelled';
                            this.queueData.queueSize -= file.size;
                            this.queueData.queueLength -= 1;
                            if (file.status == SWFUpload.FILE_STATUS.IN_PROGRESS || $.inArray(file.id, this.queueData.uploadQueue) >= 0) {
                                this.queueData.uploadSize -= file.size;
                            }
                            // Trigger the onCancel event
                            if (settings.onCancel) settings.onCancel.call(this, file);
                            delete this.queueData.files[file.id];
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            errorString = 'Stopped';
                            break;
                    }

                    // Call the default event handler
                    if ($.inArray('onUploadError', settings.overrideEvents) < 0) {

                        if (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED && errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
                            $('#' + file.id).addClass('uploadify-error');
                        }

                        // Reset the progress bar
                        $('#' + file.id).find('.uploadify-progress-bar').css('width', '1px');

                        // Add the error message to the queue item
                        if (errorCode != SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND && file.status != SWFUpload.FILE_STATUS.COMPLETE) {
                            $('#' + file.id).find('.data').html(' - ' + errorString);
                        }
                    }

                    var stats = this.getStats();
                    this.queueData.uploadsErrored = stats.upload_errors;

                    var e = $.Event("error");
                    $(this.target).trigger(e,errorCode);

                    // Call the user-defined event handler
                    if (settings.onUploadError) settings.onUploadError.call(this, file, errorCode, errorMsg, errorString);
                },
                // Triggered periodically during a file upload
                onUploadProgress: function (file, fileBytesLoaded, fileTotalBytes) {
                    // Load the swfupload settings
                    var settings = this.settings;

                    // Setup all the variables
                    var timer = new Date();
                    var newTime = timer.getTime();
                    var lapsedTime = newTime - this.timer;
                    if (lapsedTime > 500) {
                        this.timer = newTime;
                    }
                    var lapsedBytes = fileBytesLoaded - this.bytesLoaded;
                    this.bytesLoaded = fileBytesLoaded;
                    var queueBytesLoaded = this.queueData.queueBytesUploaded + fileBytesLoaded;
                    var percentage = Math.round(fileBytesLoaded / fileTotalBytes * 100);

                    // Calculate the average speed
                    var suffix = 'KB/s';
                    var mbs = 0;
                    var kbs = (lapsedBytes / 1024) / (lapsedTime / 1000);
                    kbs = Math.floor(kbs * 10) / 10;
                    if (this.queueData.averageSpeed > 0) {
                        this.queueData.averageSpeed = Math.floor((this.queueData.averageSpeed + kbs) / 2);
                    } else {
                        this.queueData.averageSpeed = Math.floor(kbs);
                    }
                    if (kbs > 1000) {
                        mbs = (kbs * .001);
                        this.queueData.averageSpeed = Math.floor(mbs);
                        suffix = 'MB/s';
                    }
                    // Call the default event handler
                    if ($.inArray('onUploadProgress', settings.overrideEvents) < 0) {
                        if (settings.progressData == 'percentage') {
                            $('#' + file.id).find('.data').html(' - ' + percentage + '%');
                        } else if (settings.progressData == 'speed' && lapsedTime > 500) {
                            $('#' + file.id).find('.data').html(' - ' + this.queueData.averageSpeed + suffix);
                        }
                        $('#' + file.id).find('.uploadify-progress-bar').css('width', percentage + '%');
                    }
                    // Call the user-defined event handler
                    if (settings.onUploadProgress) settings.onUploadProgress.call(this, file, fileBytesLoaded, fileTotalBytes, queueBytesLoaded, this.queueData.uploadSize);
                },
                // Triggered right before a file is uploaded
                onUploadStart: function (file) {
                    // Load the swfupload settings
                    var settings = this.settings;
                    var timer = new Date();
                    this.timer = timer.getTime();
                    this.bytesLoaded = 0;
                    if (this.queueData.uploadQueue.length == 0) {
                        this.queueData.uploadSize = file.size;
                    }


                    // Call the user-defined event handler
                    if (settings.onUploadStart) settings.onUploadStart.call(this, file);
                },
                // Triggered when a file upload returns a successful code
                onUploadSuccess: function (file, data, response) {
                    // Load the swfupload settings
                    var settings = this.settings;
                    var stats = this.getStats();
                    if (settings.onUploadSuccess) settings.onUploadSuccess.call(this, file, data, response);
                }

            }

        }
        // Stop a file upload and remove it from the queue
        FlashUpload.prototype.cancel = function (fileID, supressEvent) {
            var args = arguments;
            this.each(function () {
                // Create a reference to the jQuery DOM object

                var $this = $(this),
                    swfuploadify = $.data($(this)[0], 'uploadify'),
                    settings = swfuploadify.settings,
                    delay = -1;

                if (args[0]) {
                    // Clear the queue
                    if (args[0] == '*') {
                        var queueItemCount = swfuploadify.queueData.queueLength;
                        $('#' + settings.queueID).find('.uploadify-queue-item').each(function () {
                            delay++;
                            if (args[1] === true) {
                                swfuploadify.cancelUpload($(this).attr('id'), false);
                            } else {
                                swfuploadify.cancelUpload($(this).attr('id'));
                            }
                            $(this).find('.data').removeClass('data').html(' - Cancelled');
                            $(this).find('.uploadify-progress-bar').remove();
                            $(this).delay(1000 + 100 * delay).fadeOut(500,
                                function () {
                                    $(this).remove();
                                });
                        });
                        swfuploadify.queueData.queueSize = 0;
                        swfuploadify.queueData.queueLength = 0;
                        // Trigger the onClearQueue event
                        if (settings.onClearQueue) settings.onClearQueue.call($this, queueItemCount);
                    } else {

                        for (var n = 0; n < args.length; n++) {
                            if (args[n]) {
                                swfuploadify.cancelUpload(args[n]);
                                $('#' + args[n]).find('.data').removeClass('data').html(' - Cancelled');
                                $('#' + args[n]).find('.uploadify-progress-bar').remove();
                                $('#' + args[n]).delay(1000 + 100 * n).fadeOut(500,
                                    function () {
                                        $(this).remove();
                                    });
                            }
                        }
                    }
                } else {
                    var item = $('#' + settings.queueID).find('.uploadify-queue-item').get(0);
                    $item = $(item);
                    swfuploadify.cancelUpload($item.attr('id'));
                    $item.find('.data').removeClass('data').html(' - Cancelled');
                    $item.find('.uploadify-progress-bar').remove();
                    $item.delay(1000).fadeOut(500,
                        function () {
                            $(this).remove();
                        });
                }
            });

        },
        // Revert the DOM object back to its original state
        FlashUpload.prototype.destroy = function (target) {
                target.each(function () {
                    // Create a reference to the jQuery DOM object
                    var $this = $(this),
                        swfuploadify = $.data($(this)[0], 'uploadify'),
                        settings = swfuploadify.settings;

                    // Destroy the SWF object and 
                    swfuploadify.destroy();

                    // Destroy the queue
                    if (settings.defaultQueue) {
                        $('#' + settings.queueID).remove();
                    }

                    // Reload the original DOM element
                    $('#' + settings.id).replaceWith(swfuploadify.original);

                    // Call the user-defined event handler
                    if (settings.onDestroy) settings.onDestroy.call(this);

                    delete swfuploadify;
                });
            }
        // Disable the select button
        FlashUpload.prototype.disable = function (isDisabled) {
            this.each(function () {
                // Create a reference to the jQuery DOM object
                var $this = $(this),
                    swfuploadify = $.data($(this)[0], 'uploadify'),
                    settings = swfuploadify.settings;
                // Call the user-defined event handlers
                var btn = swfuploadify.button.find(".uploadify-button");
                if (isDisabled) {
                    btn.attr("disabled",true);
                    swfuploadify.button.addClass('disabled').css("z-index", "100");
                    swfuploadify.wrapper.addClass('disabled');
                    swfuploadify.setButtonCursor(SWFUpload.CURSOR.ARROW);
                    if (settings.onDisable) settings.onDisable.call(this);
                } else {
                    swfuploadify.button.removeClass('disabled').css("z-index", "0");
                    btn.removeAttr("disabled");
                    swfuploadify.wrapper.removeClass('disabled');
                    swfuploadify.setButtonCursor(SWFUpload.CURSOR.HAND);
                    if (settings.onEnable) settings.onEnable.call(this);
                }

                // Enable/disable the browse button
                swfuploadify.setButtonDisabled(isDisabled);
            });
        }
        // Get or set the settings data
        FlashUpload.prototype.settings = function (target, name, value, resetObjects) {
            var args = arguments;
            var returnValue = value;

            target.each(function () {
                // Create a reference to the jQuery DOM object
                var $this = $(this),
                    swfuploadify = $.data($(this)[0], 'uploadify');
                settings = swfuploadify.settings;
                if (typeof(args[0]) == 'object') {
                    for (var n in value) {
                        setData(n, value[n]);
                    }
                }
                if (args.length === 1) {
                    returnValue = settings[name];
                } else {
                    switch (name) {
                        case 'uploadUrl':
                            swfuploadify.setUploadURL(value);
                            break;
                        case 'formData':
                            if (!resetObjects) {
                                value = $.extend(settings.formData, value);
                            }
                            swfuploadify.setPostParams(settings.formData);
                            break;
                        case 'method':
                            if (value == 'get') {
                                swfuploadify.setUseQueryString(true);
                            } else {
                                swfuploadify.setUseQueryString(false);
                            }
                            break;
                        case 'fileObjName':
                            swfuploadify.setFilePostName(value);
                            break;
                        case 'fileTypeExts':
                            swfuploadify.setFileTypes(value, settings.fileTypeDesc);
                            break;
                        case 'fileTypeDesc':
                            swfuploadify.setFileTypes(settings.fileTypeExts, value);
                            break;
                        case 'fileSizeLimit':
                            swfuploadify.setFileSizeLimit(value);
                            break;
                        case 'uploadLimit':
                            swfuploadify.setFileUploadLimit(value);
                            break;
                        case 'fileNumLimit':
                            swfuploadify.setFileQueueLimit(value);
                            break;
                        case 'buttonImage':
                            swfuploadify.button.css('background-image', settingValue);
                            break;
                        case 'buttonCursor':
                            if (value == 'arrow') {
                                swfuploadify.setButtonCursor(SWFUpload.CURSOR.ARROW);
                            } else {
                                swfuploadify.setButtonCursor(SWFUpload.CURSOR.HAND);
                            }
                            break;
                        case 'buttonText':
                            $('#' + settings.id + '-button').find('.uploadify-button').html(value);
                            break;
                        case 'width':
                            swfuploadify.setButtonDimensions(value, settings.height);
                            break;
                        case 'height':
                            swfuploadify.setButtonDimensions(settings.width, value);
                            break;
                        case 'multi':
                            if (value) {
                                swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES);
                            } else {
                                swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE);
                            }
                            break;
                    }
                    settings[name] = value;
                }
            });

            if (args.length === 1) {
                return returnValue;
            }

        };
        // Stop the current uploads and requeue what is in progress
        FlashUpload.prototype.stop = function (target) {
            target.each(function () {
                // Create a reference to the jQuery DOM object
                var $this = $(this),
                    swfuploadify = $.data($(this)[0], 'uploadify');
                ;
                // Reset the queue information
                swfuploadify.queueData.averageSpeed = 0;
                swfuploadify.queueData.uploadSize = 0;
                swfuploadify.queueData.bytesUploaded = 0;
                swfuploadify.queueData.uploadQueue = [];

                swfuploadify.stopUpload();
            });
        };
        FlashUpload.prototype.showFiles = function (target) {
            var args = arguments;
            this.each(function () {
                var $this = $(this),
                    swfuploadify = $.data($(this)[0], 'uploadify'),
                    settings = swfuploadify.settings;
                var target = $('#' + settings.id);
                var targetName = $(target).attr('name');
                var hiddenIpt = $(target).find('input[name][name=' + targetName + ']');
                //swfuploadify.queue.html('');
                //        alert(args[0] instanceof Array);
                if (args[0] && args[0] instanceof Array) {
                    var fileData = args[0];
                    for (var i = 0; i < fileData.length; i++) {
                        var file = fileData[i];
                        var fileLength = file.FILENAME.length;
                        if (fileLength > 24) {
                            file.FILENAME = file.FILENAME.substring(0, 8) + "..." + file.FILENAME.substring(file.FILENAME.lastIndexOf('.'), file.FILENAME.length);
                        }
                        var fileWrapper = $('<div class="uploadify-queue-item" FILENAME="' + file.FILENAME + '" FILECON="' + file.FILECON + '"/>');
                        var fileSpan = $('<span class="FILENAME"/>');
                        var cancel = $('<div class="cancel"><a href="javascript:void(0)" ATT_ID="' + file.ATT_ID + '" FILENAME="' + file.FILENAME + '" FILECON="' + file.FILECON + '"></a></div>');
                        fileSpan.append('<a href="javascript:void(0)" ATT_ID="' + file.ATT_ID + '" FILENAME="' + file.FILENAME + '" FILECON="' + file.FILECON + '">' + file.FILENAME + '    (' + file["FILESIZE"] + ')</a>');
                        fileWrapper.append(cancel).append(fileSpan);
                        if (settings.onlyView === true) {
                            swfuploadify.wrapper.hide();
                            cancel.hide();
                        }
                        swfuploadify.queue.append(fileWrapper);
                        if (hiddenIpt.val() != '' && file.ATT_ID != undefined) {
                            hiddenIpt.val(file.ATT_ID);
                        } else {
                            hiddenIpt.val(hiddenIpt.val() + ',' + file.ATT_ID);
                        }
                    }
                    swfuploadify.queue.find('span a').click(function () {
                        window.open("/kjdp_download?DIR=" + settings.dir + "&FILENAME=" + $(this).attr('FILENAME') + "&FILECON=" + $(this).attr('FILECON')
                            + "&IS_IMAGE_RESOURCE=" + settings.IS_IMAGE_RESOURCE + "&LOCAL_RESOURCE=" + settings.LOCAL_RESOURCE + "&UN_RENAME=" + settings.UN_RENAME);
                    });
                    swfuploadify.queue.find('div.cancel a').click(function (e) {
                        var FILECON = $(this).attr('FILECON'),
                            FILENAME = $(this).attr('FILENAME'),
                            ATT_ID = $(this).attr('ATT_ID');
                        $.get("/kjdp_delete?DIR=" + settings.dir + "&FILENAME=" + FILENAME + "&FILECON=" + FILECON + "&ATT_ID=" + ATT_ID +
                                "&IS_IMAGE_RESOURCE=" + settings.IS_IMAGE_RESOURCE + "&LOCAL_RESOURCE=" + settings.LOCAL_RESOURCE + "&UN_RENAME=" + settings.UN_RENAME + "&SERVICE=P0004014", {},
                            function (data, textStatus) {
                                var hiddenIptVal = hiddenIpt.val();
                                if (hiddenIptVal != '') {
                                    if (hiddenIptVal.indexOf(',') == -1) {
                                        hiddenIpt.val('');
                                    } else {
                                        var cons = hiddenIptVal.split(',');
                                        var newCons = $.grep(cons,
                                            function (n) {
                                                return n != ATT_ID;
                                            });
                                        hiddenIpt.val(newCons.join(','));
                                    }
                                } else {
                                    hiddenIpt.val('');
                                }
                            });
                        $(this).parent().parent().remove();
                        //如果提供了事件对象，则这是一个非IE浏览器
                        if (e && e.preventDefault)
                        //阻止默认浏览器动作(W3C)
                            e.preventDefault();
                        else
                        //IE中阻止函数器默认动作的方式
                            window.event.returnValue = false;


                        if (settings.onDeleteSuccess) settings.onDeleteSuccess.call(this, file, data, response);
                        return false;
                    });
                }
            });
        };
        // Start uploading files in the queue
        FlashUpload.prototype.upload = function () {
            var args = arguments;
            this.each(function () {
                // Create a reference to the jQuery DOM object
                var $this = $(this),
                    swfuploadify = $.data($(this)[0], 'uploadify');
                var settings = swfuploadify.settings;
                // Reset the queue information
                swfuploadify.queueData.averageSpeed = 0;
                swfuploadify.queueData.uploadSize = 0;
                swfuploadify.queueData.bytesUploaded = 0;
                swfuploadify.queueData.uploadQueue = [];

                // Upload the files
                if (args[0]) {
                    if (args[0] == '*') {
                        swfuploadify.queueData.uploadSize = swfuploadify.queueData.queueSize;
                        swfuploadify.queueData.uploadQueue.push('*');
                        swfuploadify.startUpload();
                    } else {
                        for (var n = 0; n < args.length; n++) {
                            swfuploadify.queueData.uploadSize += swfuploadify.queueData.files[args[n]].size;
                            swfuploadify.queueData.uploadQueue.push(args[n]);
                        }
                        swfuploadify.startUpload(swfuploadify.queueData.uploadQueue.shift());
                    }
                } else {
                    swfuploadify.startUpload();
                }

            });
        };
        FlashUpload.prototype.onlyView = function (target, flag) {
            var swfuploadify = $.data($(target)[0], 'uploadify');
            return target.each(function () {
                if (flag == true) {
                    swfuploadify.wrapper.hide();
                    swfuploadify.queue.find('div.cancel').hide();
                } else {
                    swfuploadify.wrapper.show();
                    swfuploadify.queue.find('div.cancel').show();
                }
            });
        };
        FlashUpload.prototype.clear = function () {
            var swfuploadify = $.data($(this)[0], 'uploadify');
            return $(this).each(function () {
                swfuploadify.queue.find('div.uploadify-queue-item').remove();
            });
        };

        FlashUpload.prototype.setButtonText = function(text){
            var state = $(this).data("uploadify");
            state.button.text(text);
        }

    })(jQuery);

    /**
     * SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com
     *
     * mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/
     *
     * SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilz閚 and Mammon Media and is released under the MIT License:
     * http://www.opensource.org/licenses/mit-license.php
     *
     * SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
     * http://www.opensource.org/licenses/mit-license.php
     *
     */

    /* ******************* */
    /* Constructor & Init  */
    /* ******************* */
    (function(){
        var SWFUpload;

        if (typeof(SWFUpload) == 'undefined') {
            SWFUpload = function (settings,target) {
                this.target =target
                this.initSWFUpload(settings);
            };
        }

        SWFUpload.prototype.initSWFUpload = function (settings) {
            try {
                this.customSettings = {};	// A container where developers can place their own settings associated with this instance.
                this.settings = settings;
                this.eventQueue = [];
                this.movieName = "SWFUpload_" + SWFUpload.movieCount++;
                this.movieElement = null;

                // Setup global control tracking
                SWFUpload.instances[this.movieName] = this;
                // Load the settings.  Load the Flash movie.
                this.initSettings();
                this.loadFlash();
                this.displayDebugInfo();
            } catch (ex) {
                delete SWFUpload.instances[this.movieName];
                throw ex;
            }
        };

        /* *************** */
        /* Static Members  */
        /* *************** */
        SWFUpload.instances = {};
        SWFUpload.movieCount = 0;
        SWFUpload.version = "2.2.0 2009-03-25";
        SWFUpload.QUEUE_ERROR = {
            QUEUE_LIMIT_EXCEEDED: -100,
            FILE_EXCEEDS_SIZE_LIMIT: -110,
            ZERO_BYTE_FILE: -120,
            INVALID_FILETYPE: -130
        };
        SWFUpload.UPLOAD_ERROR = {
            HTTP_ERROR: -200,
            MISSING_UPLOAD_URL: -210,
            IO_ERROR: -220,
            SECURITY_ERROR: -230,
            UPLOAD_LIMIT_EXCEEDED: -240,
            UPLOAD_FAILED: -250,
            SPECIFIED_FILE_ID_NOT_FOUND: -260,
            FILE_VALIDATION_FAILED: -270,
            FILE_CANCELLED: -280,
            UPLOAD_STOPPED: -290
        };
        SWFUpload.FILE_STATUS = {
            QUEUED: -1,
            IN_PROGRESS: -2,
            ERROR: -3,
            COMPLETE: -4,
            CANCELLED: -5
        };
        SWFUpload.BUTTON_ACTION = {
            SELECT_FILE: -100,
            SELECT_FILES: -110,
            START_UPLOAD: -120
        };
        SWFUpload.CURSOR = {
            ARROW: -1,
            HAND: -2
        };
        SWFUpload.WINDOW_MODE = {
            WINDOW: "window",
            TRANSPARENT: "transparent",
            OPAQUE: "opaque"
        };

// Private: takes a URL, determines if it is relative and converts to an absolute URL
// using the current site. Only processes the URL if it can, otherwise returns the URL untouched
        SWFUpload.completeURL = function (url) {
            if (typeof(url) !== "string" || url.match(/^https?:\/\//i) || url.match(/^\//)) {
                return url;
            }

            var currentURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");

            var indexSlash = window.location.pathname.lastIndexOf("/");
            if (indexSlash <= 0) {
                path = "/";
            } else {
                path = window.location.pathname.substr(0, indexSlash) + "/";
            }

            return /*currentURL +*/ path + url;

        };


        /* ******************** */
        /* Instance Members  */
        /* ******************** */

        // Private: initSettings ensures that all the
        // settings are set, getting a default value if one was not assigned.
        SWFUpload.prototype.initSettings = function () {
            this.ensureDefault = function (settingName, defaultValue) {
                this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
            };

            // Upload backend settings
            this.ensureDefault("upload_url", "");
            this.ensureDefault("preserve_relative_urls", false);
            this.ensureDefault("file_post_name", "Filedata");
            this.ensureDefault("post_params", {});
            this.ensureDefault("use_query_string", false);
            this.ensureDefault("requeue_on_error", false);
            this.ensureDefault("http_success", []);
            this.ensureDefault("assume_success_timeout", 0);

            // File Settings
            this.ensureDefault("file_types", "*.*");
            this.ensureDefault("file_types_description", "All Files");
            this.ensureDefault("file_size_limit", 0);	// Default zero means "unlimited"
            this.ensureDefault("file_upload_limit", 0);
            this.ensureDefault("file_queue_limit", 0);

            // Flash Settings
            this.ensureDefault("flash_url", "swfupload.swf");
            this.ensureDefault("prevent_swf_caching", true);

            // Button Settings
            this.ensureDefault("button_image_url", "");
            this.ensureDefault("button_width", 1);
            this.ensureDefault("button_height", 1);
            this.ensureDefault("button_text", "");
            this.ensureDefault("button_text_style", "color: #000000; font-size: 16pt;");
            this.ensureDefault("button_text_top_padding", 0);
            this.ensureDefault("button_text_left_padding", 0);
            this.ensureDefault("button_action", SWFUpload.BUTTON_ACTION.SELECT_FILES);
            this.ensureDefault("button_disabled", false);
            this.ensureDefault("button_placeholder_id", "");
            this.ensureDefault("button_placeholder", null);
            this.ensureDefault("button_cursor", SWFUpload.CURSOR.ARROW);
            this.ensureDefault("button_window_mode", SWFUpload.WINDOW_MODE.WINDOW);

            // Debug Settings
            this.ensureDefault("debug", false);
            this.settings.debug_enabled = this.settings.debug;	// Here to maintain v2 API

            // Event Handlers
            this.settings.return_upload_start_handler = this.returnUploadStart;
            this.ensureDefault("swfupload_loaded_handler", null);
            this.ensureDefault("file_dialog_start_handler", null);
            this.ensureDefault("file_queued_handler", null);
            this.ensureDefault("file_queue_error_handler", null);
            this.ensureDefault("file_dialog_complete_handler", null);

            this.ensureDefault("upload_start_handler", null);
            this.ensureDefault("upload_progress_handler", null);
            this.ensureDefault("upload_error_handler", null);
            this.ensureDefault("upload_success_handler", null);
            this.ensureDefault("upload_complete_handler", null);

            this.ensureDefault("debug_handler", this.debugMessage);

            this.ensureDefault("custom_settings", {});

            // Other settings
            this.customSettings = this.settings.custom_settings;

            // Update the flash url if needed
            if (!!this.settings.prevent_swf_caching) {
                this.settings.flash_url = this.settings.flash_url + (this.settings.flash_url.indexOf("?") < 0 ? "?" : "&") + "preventswfcaching=" + new Date().getTime();
            }

            if (!this.settings.preserve_relative_urls) {
                //this.settings.flash_url = SWFUpload.completeURL(this.settings.flash_url);	// Don't need to do this one since flash doesn't look at it
                this.settings.upload_url = SWFUpload.completeURL(this.settings.upload_url);
                this.settings.button_image_url = this.settings.button_image_url ? SWFUpload.completeURL(this.settings.button_image_url) : '';
            }

            delete this.ensureDefault;
        };

        // Private: loadFlash replaces the button_placeholder element with the flash movie.
        SWFUpload.prototype.loadFlash = function () {
            var targetElement, tempParent;

            // Make sure an element with the ID we are going to use doesn't already exist
            if (document.getElementById(this.movieName) !== null) {
                throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
            }

            // Get the element where we will be placing the flash movie
            targetElement = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;

            if (targetElement == undefined) {
                throw "Could not find the placeholder element: " + this.settings.button_placeholder_id;
            }

            // Append the container and load the flash
            tempParent = document.createElement("div");
            tempParent.innerHTML = this.getFlashHTML();	// Using innerHTML is non-standard but the only sensible way to dynamically add Flash in IE (and maybe other browsers)
            targetElement.parentNode.replaceChild(tempParent.firstChild, targetElement);

            // Fix IE Flash/Form bug
            //alert(window[this.movieName]);
            if (window[this.movieName] == undefined) {
                window[this.movieName] = this.getMovieElement();
            }

        };

        var nav = navigator.userAgent.toLowerCase();
        $.browser = {
            mozilla : /firefox/.test(nav),
            webkit: /webkit/.test(nav),
            opera: /opera/.test(nav),
            msie: /msie/.test(nav)
        }

        // Private: getFlashHTML generates the object tag needed to embed the flash in to the document
        SWFUpload.prototype.getFlashHTML = function () {
            var ab = $.extend({},this);
            // Flash Satay object syntax: http://www.alistapart.com/articles/flashsatay  data="', this.settings.flash_url, '"
            var flashHtml = ['<object id="', this.movieName, '"'];
            if (!$.browser.msie) flashHtml.push('data="', this.settings.flash_url, '"');
            flashHtml.push(' type="application/x-shockwave-flash" width="', this.settings.button_width, '" height="', this.settings.button_height, '" class="swfupload">');
            flashHtml.push('<param name="wmode" value="', this.settings.button_window_mode, '" />');
            if ($.browser.msie) flashHtml.push('<param name="movie" value="', this.settings.flash_url, '" />');
            flashHtml.push('<param name="quality" value="high" />');
            flashHtml.push('<param name="menu" value="false" />');
            flashHtml.push('<param name="allowScriptAccess" value="always" />');
            flashHtml.push('<param name="flashvars" value="' + this.getFlashVars() + '" />');
            flashHtml.push('</object>');
            return flashHtml.join("");
        };

        // Private: getFlashVars builds the parameter string that will be passed
        // to flash in the flashvars param.
        SWFUpload.prototype.getFlashVars = function () {
            // Build a string from the post param object
            var paramString = this.buildParamString();
            var httpSuccessString = this.settings.http_success.join(",");

            // Build the parameter string
            return ["movieName=", encodeURIComponent(this.movieName),
                "&amp;uploadURL=", encodeURIComponent(this.settings.upload_url),
                "&amp;useQueryString=", encodeURIComponent(this.settings.use_query_string),
                "&amp;requeueOnError=", encodeURIComponent(this.settings.requeue_on_error),
                "&amp;httpSuccess=", encodeURIComponent(httpSuccessString),
                "&amp;assumeSuccessTimeout=", encodeURIComponent(this.settings.assume_success_timeout),
                "&amp;params=", encodeURIComponent(paramString),
                "&amp;filePostName=", encodeURIComponent(this.settings.file_post_name),
                "&amp;fileTypes=", encodeURIComponent(this.settings.file_types),
                "&amp;fileTypesDescription=", encodeURIComponent(this.settings.file_types_description),
                "&amp;fileSizeLimit=", encodeURIComponent(this.settings.file_size_limit),
                "&amp;fileUploadLimit=", encodeURIComponent(this.settings.file_upload_limit),
                "&amp;fileQueueLimit=", encodeURIComponent(this.settings.file_queue_limit),
                "&amp;debugEnabled=", encodeURIComponent(this.settings.debug_enabled),
                "&amp;buttonImageURL=", encodeURIComponent(this.settings.button_image_url),
                "&amp;buttonWidth=", encodeURIComponent(this.settings.button_width),
                "&amp;buttonHeight=", encodeURIComponent(this.settings.button_height),
                "&amp;buttonText=", encodeURIComponent(this.settings.button_text),
                "&amp;buttonTextTopPadding=", encodeURIComponent(this.settings.button_text_top_padding),
                "&amp;buttonTextLeftPadding=", encodeURIComponent(this.settings.button_text_left_padding),
                "&amp;buttonTextStyle=", encodeURIComponent(this.settings.button_text_style),
                "&amp;buttonAction=", encodeURIComponent(this.settings.button_action),
                "&amp;buttonDisabled=", encodeURIComponent(this.settings.button_disabled),
                "&amp;buttonCursor=", encodeURIComponent(this.settings.button_cursor)
            ].join("");
        };

        // Public: getMovieElement retrieves the DOM reference to the Flash element added by SWFUpload
        // The element is cached after the first lookup
        SWFUpload.prototype.getMovieElement = function () {
            if (this.movieElement == undefined) {
                this.movieElement = document.getElementById(this.movieName);
            }

            if (this.movieElement === null) {
                throw "Could not find Flash element";
            }
            return this.movieElement;
        };

        // Private: buildParamString takes the name/value pairs in the post_params setting object
        // and joins them up in to a string formatted "name=value&amp;name=value"
        SWFUpload.prototype.buildParamString = function () {
            var postParams = this.settings.post_params;
            var paramStringPairs = [];

            if (typeof(postParams) === "object") {
                for (var name in postParams) {
                    if (postParams.hasOwnProperty(name)) {
                        paramStringPairs.push(encodeURIComponent(name.toString()) + "=" + encodeURIComponent(postParams[name].toString()));
                    }
                }
            }

            return paramStringPairs.join("&amp;");
        };

        // Public: Used to remove a SWFUpload instance from the page. This method strives to remove
        // all references to the SWF, and other objects so memory is properly freed.
        // Returns true if everything was destroyed. Returns a false if a failure occurs leaving SWFUpload in an inconsistant state.
        // Credits: Major improvements provided by steffen
        SWFUpload.prototype.destroy = function () {
            try {
                // Make sure Flash is done before we try to remove it
                this.cancelUpload(null, false);


                // Remove the SWFUpload DOM nodes
                var movieElement = null;
                movieElement = this.getMovieElement();

                if (movieElement && typeof(movieElement.CallFunction) === "unknown") { // We only want to do this in IE
                    // Loop through all the movie's properties and remove all function references (DOM/JS IE 6/7 memory leak workaround)
                    for (var i in movieElement) {
                        try {
                            if (typeof(movieElement[i]) === "function") {
                                movieElement[i] = null;
                            }
                        } catch (ex1) {
                        }
                    }

                    // Remove the Movie Element from the page
                    try {
                        movieElement.parentNode.removeChild(movieElement);
                    } catch (ex) {
                    }
                }

                // Remove IE form fix reference
                window[this.movieName] = null;

                // Destroy other references
                SWFUpload.instances[this.movieName] = null;
                delete SWFUpload.instances[this.movieName];

                this.movieElement = null;
                this.settings = null;
                this.customSettings = null;
                this.eventQueue = null;
                this.movieName = null;


                return true;
            } catch (ex2) {
                return false;
            }
        };


        // Public: displayDebugInfo prints out settings and configuration
        // information about this SWFUpload instance.
        // This function (and any references to it) can be deleted when placing
        // SWFUpload in production.
        SWFUpload.prototype.displayDebugInfo = function () {
            this.debug(
                [
                    "---SWFUpload Instance Info---\n",
                    "Version: ", SWFUpload.version, "\n",
                    "Movie Name: ", this.movieName, "\n",
                    "Settings:\n",
                    "\t", "upload_url:               ", this.settings.upload_url, "\n",
                    "\t", "flash_url:                ", this.settings.flash_url, "\n",
                    "\t", "use_query_string:         ", this.settings.use_query_string.toString(), "\n",
                    "\t", "requeue_on_error:         ", this.settings.requeue_on_error.toString(), "\n",
                    "\t", "http_success:             ", this.settings.http_success.join(", "), "\n",
                    "\t", "assume_success_timeout:   ", this.settings.assume_success_timeout, "\n",
                    "\t", "file_post_name:           ", this.settings.file_post_name, "\n",
                    "\t", "post_params:              ", this.settings.post_params.toString(), "\n",
                    "\t", "file_types:               ", this.settings.file_types, "\n",
                    "\t", "file_types_description:   ", this.settings.file_types_description, "\n",
                    "\t", "file_size_limit:          ", this.settings.file_size_limit, "\n",
                    "\t", "file_upload_limit:        ", this.settings.file_upload_limit, "\n",
                    "\t", "file_queue_limit:         ", this.settings.file_queue_limit, "\n",
                    "\t", "debug:                    ", this.settings.debug.toString(), "\n",

                    "\t", "prevent_swf_caching:      ", this.settings.prevent_swf_caching.toString(), "\n",

                    "\t", "button_placeholder_id:    ", this.settings.button_placeholder_id.toString(), "\n",
                    "\t", "button_placeholder:       ", (this.settings.button_placeholder ? "Set" : "Not Set"), "\n",
                    "\t", "button_image_url:         ", this.settings.button_image_url.toString(), "\n",
                    "\t", "button_width:             ", this.settings.button_width.toString(), "\n",
                    "\t", "button_height:            ", this.settings.button_height.toString(), "\n",
                    "\t", "button_text:              ", this.settings.button_text.toString(), "\n",
                    "\t", "button_text_style:        ", this.settings.button_text_style.toString(), "\n",
                    "\t", "button_text_top_padding:  ", this.settings.button_text_top_padding.toString(), "\n",
                    "\t", "button_text_left_padding: ", this.settings.button_text_left_padding.toString(), "\n",
                    "\t", "button_action:            ", this.settings.button_action.toString(), "\n",
                    "\t", "button_disabled:          ", this.settings.button_disabled.toString(), "\n",

                    "\t", "custom_settings:          ", this.settings.custom_settings.toString(), "\n",
                    "Event Handlers:\n",
                    "\t", "swfupload_loaded_handler assigned:  ", (typeof this.settings.swfupload_loaded_handler === "function").toString(), "\n",
                    "\t", "file_dialog_start_handler assigned: ", (typeof this.settings.file_dialog_start_handler === "function").toString(), "\n",
                    "\t", "file_queued_handler assigned:       ", (typeof this.settings.file_queued_handler === "function").toString(), "\n",
                    "\t", "file_queue_error_handler assigned:  ", (typeof this.settings.file_queue_error_handler === "function").toString(), "\n",
                    "\t", "upload_start_handler assigned:      ", (typeof this.settings.upload_start_handler === "function").toString(), "\n",
                    "\t", "upload_progress_handler assigned:   ", (typeof this.settings.upload_progress_handler === "function").toString(), "\n",
                    "\t", "upload_error_handler assigned:      ", (typeof this.settings.upload_error_handler === "function").toString(), "\n",
                    "\t", "upload_success_handler assigned:    ", (typeof this.settings.upload_success_handler === "function").toString(), "\n",
                    "\t", "upload_complete_handler assigned:   ", (typeof this.settings.upload_complete_handler === "function").toString(), "\n",
                    "\t", "debug_handler assigned:             ", (typeof this.settings.debug_handler === "function").toString(), "\n"
                ].join("")
            );
        };

        /* Note: addSetting and getSetting are no longer used by SWFUpload but are included
         the maintain v2 API compatibility
         */
        // Public: (Deprecated) addSetting adds a setting value. If the value given is undefined or null then the default_value is used.
        SWFUpload.prototype.addSetting = function (name, value, default_value) {
            if (value == undefined) {
                return (this.settings[name] = default_value);
            } else {
                return (this.settings[name] = value);
            }
        };

        // Public: (Deprecated) getSetting gets a setting. Returns an empty string if the setting was not found.
        SWFUpload.prototype.getSetting = function (name) {
            if (this.settings[name] != undefined) {
                return this.settings[name];
            }

            return "";
        };


        // Private: callFlash handles function calls made to the Flash element.
        // Calls are made with a setTimeout for some functions to work around
        // bugs in the ExternalInterface library.
        SWFUpload.prototype.callFlash = function (functionName, argumentArray) {
            argumentArray = argumentArray || [];

            var movieElement = this.getMovieElement();
            var returnValue, returnString;

            // Flash's method if calling ExternalInterface methods (code adapted from MooTools).
            try {
                returnString = movieElement.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray, 0) + '</invoke>');
                returnValue = eval(returnString);
            } catch (ex) {
                throw "Call to " + functionName + " failed" + ex;
            }

            // Unescape file post param values
            if (returnValue != undefined && typeof returnValue.post === "object") {
                returnValue = this.unescapeFilePostParams(returnValue);
            }

            return returnValue;
        };

        /* *****************************
         -- Flash control methods --
         Your UI should use these
         to operate SWFUpload
         ***************************** */

        // WARNING: this function does not work in Flash Player 10
        // Public: selectFile causes a File Selection Dialog window to appear.  This
        // dialog only allows 1 file to be selected.
        SWFUpload.prototype.selectFile = function () {
            this.callFlash("SelectFile");
        };

        // WARNING: this function does not work in Flash Player 10
        // Public: selectFiles causes a File Selection Dialog window to appear/ This
        // dialog allows the user to select any number of files
        // Flash Bug Warning: Flash limits the number of selectable files based on the combined length of the file names.
        // If the selection name length is too long the dialog will fail in an unpredictable manner.  There is no work-around
        // for this bug.
        SWFUpload.prototype.selectFiles = function () {
            this.callFlash("SelectFiles");
        };


        // Public: startUpload starts uploading the first file in the queue unless
        // the optional parameter 'fileID' specifies the ID
        SWFUpload.prototype.startUpload = function (fileID) {
            this.callFlash("StartUpload", [fileID]);
        };

        // Public: cancelUpload cancels any queued file.  The fileID parameter may be the file ID or index.
        // If you do not specify a fileID the current uploading file or first file in the queue is cancelled.
        // If you do not want the uploadError event to trigger you can specify false for the triggerErrorEvent parameter.
        SWFUpload.prototype.cancelUpload = function (fileID, triggerErrorEvent) {
            if (triggerErrorEvent !== false) {
                triggerErrorEvent = true;
            }
            this.callFlash("CancelUpload", [fileID, triggerErrorEvent]);
        };

        // Public: stopUpload stops the current upload and requeues the file at the beginning of the queue.
        // If nothing is currently uploading then nothing happens.
        SWFUpload.prototype.stopUpload = function () {
            this.callFlash("StopUpload");
        };

        /* ************************
         * Settings methods
         *   These methods change the SWFUpload settings.
         *   SWFUpload settings should not be changed directly on the settings object
         *   since many of the settings need to be passed to Flash in order to take
         *   effect.
         * *********************** */

        // Public: getStats gets the file statistics object.
        SWFUpload.prototype.getStats = function () {
            return this.callFlash("GetStats");
        };

        // Public: setStats changes the SWFUpload statistics.  You shouldn't need to
        // change the statistics but you can.  Changing the statistics does not
        // affect SWFUpload accept for the successful_uploads count which is used
        // by the upload_limit setting to determine how many files the user may upload.
        SWFUpload.prototype.setStats = function (statsObject) {
            this.callFlash("SetStats", [statsObject]);
        };

        // Public: getFile retrieves a File object by ID or Index.  If the file is
        // not found then 'null' is returned.
        SWFUpload.prototype.getFile = function (fileID) {
            if (typeof(fileID) === "number") {
                return this.callFlash("GetFileByIndex", [fileID]);
            } else {
                return this.callFlash("GetFile", [fileID]);
            }
        };

        // Public: addFileParam sets a name/value pair that will be posted with the
        // file specified by the Files ID.  If the name already exists then the
        // exiting value will be overwritten.
        SWFUpload.prototype.addFileParam = function (fileID, name, value) {
            return this.callFlash("AddFileParam", [fileID, name, value]);
        };

        // Public: removeFileParam removes a previously set (by addFileParam) name/value
        // pair from the specified file.
        SWFUpload.prototype.removeFileParam = function (fileID, name) {
            this.callFlash("RemoveFileParam", [fileID, name]);
        };

        // Public: setUploadUrl changes the upload_url setting.
        SWFUpload.prototype.setUploadURL = function (url) {
            this.settings.upload_url = url.toString();
            this.callFlash("SetUploadURL", [url]);
        };

        // Public: setPostParams changes the post_params setting
        SWFUpload.prototype.setPostParams = function (paramsObject) {
            this.settings.post_params = paramsObject;
            this.callFlash("SetPostParams", [paramsObject]);
        };

        // Public: addPostParam adds post name/value pair.  Each name can have only one value.
        SWFUpload.prototype.addPostParam = function (name, value) {
            this.settings.post_params[name] = value;
            this.callFlash("SetPostParams", [this.settings.post_params]);
        };

        // Public: removePostParam deletes post name/value pair.
        SWFUpload.prototype.removePostParam = function (name) {
            delete this.settings.post_params[name];
            this.callFlash("SetPostParams", [this.settings.post_params]);
        };

        // Public: setFileTypes changes the file_types setting and the file_types_description setting
        SWFUpload.prototype.setFileTypes = function (types, description) {
            this.settings.file_types = types;
            this.settings.file_types_description = description;
            this.callFlash("SetFileTypes", [types, description]);
        };

        // Public: setFileSizeLimit changes the file_size_limit setting
        SWFUpload.prototype.setFileSizeLimit = function (fileSizeLimit) {
            this.settings.file_size_limit = fileSizeLimit;
            this.callFlash("SetFileSizeLimit", [fileSizeLimit]);
        };

        // Public: setFileUploadLimit changes the file_upload_limit setting
        SWFUpload.prototype.setFileUploadLimit = function (fileUploadLimit) {
            this.settings.file_upload_limit = fileUploadLimit;
            this.callFlash("SetFileUploadLimit", [fileUploadLimit]);
        };

        // Public: setFileUploadLimit changes the file_upload_limit setting
        SWFUpload.prototype.getFileUploadLimit = function (fileUploadLimit) {
            return this.callFlash("GetFileUploadLimit");
        };

        // Public: setFileQueueLimit changes the file_queue_limit setting
        SWFUpload.prototype.setFileQueueLimit = function (fileQueueLimit) {
            this.settings.file_queue_limit = fileQueueLimit;
            this.callFlash("SetFileQueueLimit", [fileQueueLimit]);
        };

        // Public: setFilePostName changes the file_post_name setting
        SWFUpload.prototype.setFilePostName = function (filePostName) {
            this.settings.file_post_name = filePostName;
            this.callFlash("SetFilePostName", [filePostName]);
        };

        // Public: setUseQueryString changes the use_query_string setting
        SWFUpload.prototype.setUseQueryString = function (useQueryString) {
            this.settings.use_query_string = useQueryString;
            this.callFlash("SetUseQueryString", [useQueryString]);
        };

        // Public: setRequeueOnError changes the requeue_on_error setting
        SWFUpload.prototype.setRequeueOnError = function (requeueOnError) {
            this.settings.requeue_on_error = requeueOnError;
            this.callFlash("SetRequeueOnError", [requeueOnError]);
        };

        // Public: setHTTPSuccess changes the http_success setting
        SWFUpload.prototype.setHTTPSuccess = function (http_status_codes) {
            if (typeof http_status_codes === "string") {
                http_status_codes = http_status_codes.replace(" ", "").split(",");
            }

            this.settings.http_success = http_status_codes;
            this.callFlash("SetHTTPSuccess", [http_status_codes]);
        };

        // Public: setHTTPSuccess changes the http_success setting
        SWFUpload.prototype.setAssumeSuccessTimeout = function (timeout_seconds) {
            this.settings.assume_success_timeout = timeout_seconds;
            this.callFlash("SetAssumeSuccessTimeout", [timeout_seconds]);
        };

        // Public: setDebugEnabled changes the debug_enabled setting
        SWFUpload.prototype.setDebugEnabled = function (debugEnabled) {
            this.settings.debug_enabled = debugEnabled;
            this.callFlash("SetDebugEnabled", [debugEnabled]);
        };

        // Public: setButtonImageURL loads a button image sprite
        SWFUpload.prototype.setButtonImageURL = function (buttonImageURL) {
            if (buttonImageURL == undefined) {
                buttonImageURL = "";
            }

            this.settings.button_image_url = buttonImageURL;
            this.callFlash("SetButtonImageURL", [buttonImageURL]);
        };

        // Public: setButtonDimensions resizes the Flash Movie and button
        SWFUpload.prototype.setButtonDimensions = function (width, height) {
            this.settings.button_width = width;
            this.settings.button_height = height;

            var movie = this.getMovieElement();
            if (movie != undefined) {
                movie.style.width = width + "px";
                movie.style.height = height + "px";
            }

            this.callFlash("SetButtonDimensions", [width, height]);
        };
        // Public: setButtonText Changes the text overlaid on the button
        SWFUpload.prototype.setButtonText = function (html) {
            this.settings.button_text = html;
            this.callFlash("SetButtonText", [html]);
        };
        // Public: setButtonTextPadding changes the top and left padding of the text overlay
        SWFUpload.prototype.setButtonTextPadding = function (left, top) {
            this.settings.button_text_top_padding = top;
            this.settings.button_text_left_padding = left;
            this.callFlash("SetButtonTextPadding", [left, top]);
        };

        // Public: setButtonTextStyle changes the CSS used to style the HTML/Text overlaid on the button
        SWFUpload.prototype.setButtonTextStyle = function (css) {
            this.settings.button_text_style = css;
            this.callFlash("SetButtonTextStyle", [css]);
        };
        // Public: setButtonDisabled disables/enables the button
        SWFUpload.prototype.setButtonDisabled = function (isDisabled) {
            this.settings.button_disabled = isDisabled;
            this.callFlash("SetButtonDisabled", [isDisabled]);
        };
        // Public: setButtonAction sets the action that occurs when the button is clicked
        SWFUpload.prototype.setButtonAction = function (buttonAction) {
            this.settings.button_action = buttonAction;
            this.callFlash("SetButtonAction", [buttonAction]);
        };

        // Public: setButtonCursor changes the mouse cursor displayed when hovering over the button
        SWFUpload.prototype.setButtonCursor = function (cursor) {
            this.settings.button_cursor = cursor;
            this.callFlash("SetButtonCursor", [cursor]);
        };

        /* *******************************
         Flash Event Interfaces
         These functions are used by Flash to trigger the various
         events.

         All these functions a Private.

         Because the ExternalInterface library is buggy the event calls
         are added to a queue and the queue then executed by a setTimeout.
         This ensures that events are executed in a determinate order and that
         the ExternalInterface bugs are avoided.
         ******************************* */

        SWFUpload.prototype.queueEvent = function (handlerName, argumentArray) {
            // Warning: Don't call this.debug inside here or you'll create an infinite loop

            if (argumentArray == undefined) {
                argumentArray = [];
            } else if (!(argumentArray instanceof Array)) {
                argumentArray = [argumentArray];
            }

            var self = this;
            if (typeof this.settings[handlerName] === "function") {
                // Queue the event
                this.eventQueue.push(function () {
                    this.settings[handlerName].apply(this, argumentArray);
                });

                // Execute the next queued event
                setTimeout(function () {
                    self.executeNextEvent();
                }, 0);

            } else if (this.settings[handlerName] !== null) {
                throw "Event handler " + handlerName + " is unknown or is not a function";
            }
        };

        // Private: Causes the next event in the queue to be executed.  Since events are queued using a setTimeout
        // we must queue them in order to garentee that they are executed in order.
        SWFUpload.prototype.executeNextEvent = function () {
            // Warning: Don't call this.debug inside here or you'll create an infinite loop

            var f = this.eventQueue ? this.eventQueue.shift() : null;
            if (typeof(f) === "function") {
                f.apply(this);
            }
        };

        // Private: unescapeFileParams is part of a workaround for a flash bug where objects passed through ExternalInterface cannot have
        // properties that contain characters that are not valid for JavaScript identifiers. To work around this
        // the Flash Component escapes the parameter names and we must unescape again before passing them along.
        SWFUpload.prototype.unescapeFilePostParams = function (file) {
            var reg = /[$]([0-9a-f]{4})/i;
            var unescapedPost = {};
            var uk;

            if (file != undefined) {
                for (var k in file.post) {
                    if (file.post.hasOwnProperty(k)) {
                        uk = k;
                        var match;
                        while ((match = reg.exec(uk)) !== null) {
                            uk = uk.replace(match[0], String.fromCharCode(parseInt("0x" + match[1], 16)));
                        }
                        unescapedPost[uk] = file.post[k];
                    }
                }

                file.post = unescapedPost;
            }

            return file;
        };

        // Private: Called by Flash to see if JS can call in to Flash (test if External Interface is working)
        SWFUpload.prototype.testExternalInterface = function () {
            try {
                return this.callFlash("TestExternalInterface");
            } catch (ex) {
                return false;
            }
        };

        // Private: This event is called by Flash when it has finished loading. Don't modify this.
        // Use the swfupload_loaded_handler event setting to execute custom code when SWFUpload has loaded.
        SWFUpload.prototype.flashReady = function () {
            // Check that the movie element is loaded correctly with its ExternalInterface methods defined
            var movieElement = this.getMovieElement();

            if (!movieElement) {
                this.debug("Flash called back ready but the flash movie can't be found.");
                return;
            }

            this.cleanUp(movieElement);

            this.queueEvent("swfupload_loaded_handler");
        };

        // Private: removes Flash added fuctions to the DOM node to prevent memory leaks in IE.
        // This function is called by Flash each time the ExternalInterface functions are created.
        SWFUpload.prototype.cleanUp = function (movieElement) {
            // Pro-actively unhook all the Flash functions
            try {
                if (this.movieElement && typeof(movieElement.CallFunction) === "unknown") { // We only want to do this in IE
                    this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");
                    for (var key in movieElement) {
                        try {
                            if (typeof (movieElement[key]) === "function" && key[0] <= 'Z'){
                                movieElement[key] = null;
                            }
                        } catch (ex) {
                        }
                    }
                }
            } catch (ex1) {

            }

            // Fix Flashes own cleanup code so if the SWFMovie was removed from the page
            // it doesn't display errors.
            window["__flash__removeCallback"] = function (instance, name) {
                try {
                    if (instance) {
                        instance[name] = null;
                    }
                } catch (flashEx) {

                }
            };

        };


        /* This is a chance to do something before the browse window opens */
        SWFUpload.prototype.fileDialogStart = function () {
            this.queueEvent("file_dialog_start_handler");
        };


        /* Called when a file is successfully added to the queue. */
        SWFUpload.prototype.fileQueued = function (file) {
            file = this.unescapeFilePostParams(file);
            this.queueEvent("file_queued_handler", file);
        };


        /* Handle errors that occur when an attempt to queue a file fails. */
        SWFUpload.prototype.fileQueueError = function (file, errorCode, message) {
            file = this.unescapeFilePostParams(file);
            this.queueEvent("file_queue_error_handler", [file, errorCode, message]);
        };

        /* Called after the file dialog has closed and the selected files have been queued.
         You could call startUpload here if you want the queued files to begin uploading immediately. */
        SWFUpload.prototype.fileDialogComplete = function (numFilesSelected, numFilesQueued, numFilesInQueue) {
            this.queueEvent("file_dialog_complete_handler", [numFilesSelected, numFilesQueued, numFilesInQueue]);
        };

        SWFUpload.prototype.uploadStart = function (file) {
            file = this.unescapeFilePostParams(file);
            this.queueEvent("return_upload_start_handler", file);
        };

        SWFUpload.prototype.returnUploadStart = function (file) {
            var returnValue;
            if (typeof this.settings.upload_start_handler === "function") {
                file = this.unescapeFilePostParams(file);
                returnValue = this.settings.upload_start_handler.call(this, file);
            } else if (this.settings.upload_start_handler != undefined) {
                throw "upload_start_handler must be a function";
            }

            // Convert undefined to true so if nothing is returned from the upload_start_handler it is
            // interpretted as 'true'.
            if (returnValue === undefined) {
                returnValue = true;
            }

            returnValue = !!returnValue;

            this.callFlash("ReturnUploadStart", [returnValue]);
        };


        SWFUpload.prototype.uploadProgress = function (file, bytesComplete, bytesTotal) {
            var value = bytesComplete/bytesTotal * 100;
            file = this.unescapeFilePostParams(file);
            $(this.target).trigger($.Event("progress"), value);
            this.queueEvent("upload_progress_handler", [file, bytesComplete, bytesTotal]);
        };

        SWFUpload.prototype.uploadError = function (file, errorCode, message) {
            file = this.unescapeFilePostParams(file);
            this.queueEvent("upload_error_handler", [file, errorCode, message]);
        };

        SWFUpload.prototype.uploadSuccess = function (file, serverData, responseReceived) {
            file = this.unescapeFilePostParams(file);
            if(responseReceived){
                var e = $.Event("uploadSuccess");
                $(this.target).trigger(e, [file,serverData]);
                this.queueEvent("upload_success_handler", [file, serverData, responseReceived]);
            }else{
                var e = $.Event("timeout");
                $(this.target).trigger(e, this.settings.assume_success_timeout);
            }

        };

        SWFUpload.prototype.uploadComplete = function (file) {
            file = this.unescapeFilePostParams(file);
            this.queueEvent("upload_complete_handler", file);
        };

        /* Called by SWFUpload JavaScript and Flash functions when debug is enabled. By default it writes messages to the
         internal debug console.  You can override this event and have messages written where you want. */
        SWFUpload.prototype.debug = function (message) {
            this.queueEvent("debug_handler", message);
        };


        /* **********************************
         Debug Console
         The debug console is a self contained, in page location
         for debug message to be sent.  The Debug Console adds
         itself to the body if necessary.

         The console is automatically scrolled as messages appear.

         If you are using your own debug handler or when you deploy to production and
         have debug disabled you can remove these functions to reduce the file size
         and complexity.
         ********************************** */

        // Private: debugMessage is the default debug_handler.  If you want to print debug messages
        // call the debug() function.  When overriding the function your own function should
        // check to see if the debug setting is true before outputting debug information.
        SWFUpload.prototype.debugMessage = function (message) {
        };


        /*
         SWFObject v2.2 <http://code.google.com/p/swfobject/>
         is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
         */
        var swfobject = function () {
            var UNDEF = "undefined",
                OBJECT = "object",
                SHOCKWAVE_FLASH = "Shockwave Flash",
                SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
                FLASH_MIME_TYPE = "application/x-shockwave-flash",
                EXPRESS_INSTALL_ID = "SWFObjectExprInst",
                ON_READY_STATE_CHANGE = "onreadystatechange",

                win = window,
                doc = document,
                nav = navigator,

                plugin = false,
                domLoadFnArr = [main],
                regObjArr = [],
                objIdArr = [],
                listenersArr = [],
                storedAltContent,
                storedAltContentId,
                storedCallbackFn,
                storedCallbackObj,
                isDomLoaded = false,
                isExpressInstallActive = false,
                dynamicStylesheet,
                dynamicStylesheetMedia,
                autoHideShow = true,

            /* Centralized function for browser feature detection
             - User agent string detection is only used when no good alternative is possible
             - Is executed directly for optimal performance
             */
                ua = function () {
                    var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
                        u = nav.userAgent.toLowerCase(),
                        p = nav.platform.toLowerCase(),
                        windows = p ? /win/.test(p) : /win/.test(u),
                        mac = p ? /mac/.test(p) : /mac/.test(u),
                        webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
                        ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
                        playerVersion = [0, 0, 0],
                        d = null;
                    if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
                        d = nav.plugins[SHOCKWAVE_FLASH].description;
                        if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
                            plugin = true;
                            ie = false; // cascaded feature detection for Internet Explorer
                            d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                            playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                            playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                            playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
                        }
                    }
                    else if (typeof win.ActiveXObject != UNDEF) {
                        try {
                            var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                            if (a) { // a will return null when ActiveX is disabled
                                d = a.GetVariable("$version");
                                if (d) {
                                    ie = true; // cascaded feature detection for Internet Explorer
                                    d = d.split(" ")[1].split(",");
                                    playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                    return { w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac };
                }(),

            /* Cross-browser onDomLoad
             - Will fire an event as soon as the DOM of a web page is loaded
             - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
             - Regular onload serves as fallback
             */
                onDomLoad = function () {
                    if (!ua.w3) {
                        return;
                    }
                    if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
                        callDomLoadFunctions();
                    }
                    if (!isDomLoaded) {
                        if (typeof doc.addEventListener != UNDEF) {
                            doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
                        }
                        if (ua.ie && ua.win) {
                            doc.attachEvent(ON_READY_STATE_CHANGE, function () {
                                if (doc.readyState == "complete") {
                                    doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
                                    callDomLoadFunctions();
                                }
                            });
                            if (win == top) { // if not inside an iframe
                                (function () {
                                    if (isDomLoaded) {
                                        return;
                                    }
                                    try {
                                        doc.documentElement.doScroll("left");
                                    }
                                    catch (e) {
                                        setTimeout(arguments.callee, 0);
                                        return;
                                    }
                                    callDomLoadFunctions();
                                })();
                            }
                        }
                        if (ua.wk) {
                            (function () {
                                if (isDomLoaded) {
                                    return;
                                }
                                if (!/loaded|complete/.test(doc.readyState)) {
                                    setTimeout(arguments.callee, 0);
                                    return;
                                }
                                callDomLoadFunctions();
                            })();
                        }
                        addLoadEvent(callDomLoadFunctions);
                    }
                }();

            function callDomLoadFunctions() {
                if (isDomLoaded) {
                    return;
                }
                try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
                    var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
                    t.parentNode.removeChild(t);
                }
                catch (e) {
                    return;
                }
                isDomLoaded = true;
                var dl = domLoadFnArr.length;
                for (var i = 0; i < dl; i++) {
                    domLoadFnArr[i]();
                }
            }

            function addDomLoadEvent(fn) {
                if (isDomLoaded) {
                    fn();
                }
                else {
                    domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
                }
            }

            /* Cross-browser onload
             - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
             - Will fire an event as soon as a web page including all of its assets are loaded
             */
            function addLoadEvent(fn) {
                if (typeof win.addEventListener != UNDEF) {
                    win.addEventListener("load", fn, false);
                }
                else if (typeof doc.addEventListener != UNDEF) {
                    doc.addEventListener("load", fn, false);
                }
                else if (typeof win.attachEvent != UNDEF) {
                    addListener(win, "onload", fn);
                }
                else if (typeof win.onload == "function") {
                    var fnOld = win.onload;
                    win.onload = function () {
                        fnOld();
                        fn();
                    };
                }
                else {
                    win.onload = fn;
                }
            }

            /* Main function
             - Will preferably execute onDomLoad, otherwise onload (as a fallback)
             */
            function main() {
                if (plugin) {
                    testPlayerVersion();
                }
                else {
                    matchVersions();
                }
            }

            /* Detect the Flash Player version for non-Internet Explorer browsers
             - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
             a. Both release and build numbers can be detected
             b. Avoid wrong descriptions by corrupt installers provided by Adobe
             c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
             - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
             */
            function testPlayerVersion() {
                var b = doc.getElementsByTagName("body")[0];
                var o = createElement(OBJECT);
                o.setAttribute("type", FLASH_MIME_TYPE);
                var t = b.appendChild(o);
                if (t) {
                    var counter = 0;
                    (function () {
                        if (typeof t.GetVariable != UNDEF) {
                            var d = t.GetVariable("$version");
                            if (d) {
                                d = d.split(" ")[1].split(",");
                                ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                            }
                        }
                        else if (counter < 10) {
                            counter++;
                            setTimeout(arguments.callee, 10);
                            return;
                        }
                        b.removeChild(o);
                        t = null;
                        matchVersions();
                    })();
                }
                else {
                    matchVersions();
                }
            }

            /* Perform Flash Player and SWF version matching; static publishing only
             */
            function matchVersions() {
                var rl = regObjArr.length;
                if (rl > 0) {
                    for (var i = 0; i < rl; i++) { // for each registered object element
                        var id = regObjArr[i].id;
                        var cb = regObjArr[i].callbackFn;
                        var cbObj = {success: false, id: id};
                        if (ua.pv[0] > 0) {
                            var obj = getElementById(id);
                            if (obj) {
                                if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                                    setVisibility(id, true);
                                    if (cb) {
                                        cbObj.success = true;
                                        cbObj.ref = getObjectById(id);
                                        cb(cbObj);
                                    }
                                }
                                else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                                    var att = {};
                                    att.data = regObjArr[i].expressInstall;
                                    att.width = obj.getAttribute("width") || "0";
                                    att.height = obj.getAttribute("height") || "0";
                                    if (obj.getAttribute("class")) {
                                        att.styleclass = obj.getAttribute("class");
                                    }
                                    if (obj.getAttribute("align")) {
                                        att.align = obj.getAttribute("align");
                                    }
                                    // parse HTML object param element's name-value pairs
                                    var par = {};
                                    var p = obj.getElementsByTagName("param");
                                    var pl = p.length;
                                    for (var j = 0; j < pl; j++) {
                                        if (p[j].getAttribute("name").toLowerCase() != "movie") {
                                            par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                                        }
                                    }
                                    showExpressInstall(att, par, id, cb);
                                }
                                else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
                                    displayAltContent(obj);
                                    if (cb) {
                                        cb(cbObj);
                                    }
                                }
                            }
                        }
                        else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
                            setVisibility(id, true);
                            if (cb) {
                                var o = getObjectById(id); // test whether there is an HTML object element or not
                                if (o && typeof o.SetVariable != UNDEF) {
                                    cbObj.success = true;
                                    cbObj.ref = o;
                                }
                                cb(cbObj);
                            }
                        }
                    }
                }
            }

            function getObjectById(objectIdStr) {
                var r = null;
                var o = getElementById(objectIdStr);
                if (o && o.nodeName == "OBJECT") {
                    if (typeof o.SetVariable != UNDEF) {
                        r = o;
                    }
                    else {
                        var n = o.getElementsByTagName(OBJECT)[0];
                        if (n) {
                            r = n;
                        }
                    }
                }
                return r;
            }

            /* Requirements for Adobe Express Install
             - only one instance can be active at a time
             - fp 6.0.65 or higher
             - Win/Mac OS only
             - no Webkit engines older than version 312
             */
            function canExpressInstall() {
                return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
            }

            /* Show the Adobe Express Install dialog
             - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
             */
            function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
                isExpressInstallActive = true;
                storedCallbackFn = callbackFn || null;
                storedCallbackObj = {success: false, id: replaceElemIdStr};
                var obj = getElementById(replaceElemIdStr);
                if (obj) {
                    if (obj.nodeName == "OBJECT") { // static publishing
                        storedAltContent = abstractAltContent(obj);
                        storedAltContentId = null;
                    }
                    else { // dynamic publishing
                        storedAltContent = obj;
                        storedAltContentId = replaceElemIdStr;
                    }
                    att.id = EXPRESS_INSTALL_ID;
                    if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) {
                        att.width = "310";
                    }
                    if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) {
                        att.height = "137";
                    }
                    doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
                    var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
                        fv = "MMredirectURL=" + win.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
                    if (typeof par.flashvars != UNDEF) {
                        par.flashvars += "&" + fv;
                    }
                    else {
                        par.flashvars = fv;
                    }
                    // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
                    // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
                    if (ua.ie && ua.win && obj.readyState != 4) {
                        var newObj = createElement("div");
                        replaceElemIdStr += "SWFObjectNew";
                        newObj.setAttribute("id", replaceElemIdStr);
                        obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
                        obj.style.display = "none";
                        (function () {
                            if (obj.readyState == 4) {
                                obj.parentNode.removeChild(obj);
                            }
                            else {
                                setTimeout(arguments.callee, 10);
                            }
                        })();
                    }
                    createSWF(att, par, replaceElemIdStr);
                }
            }

            /* Functions to abstract and display alternative content
             */
            function displayAltContent(obj) {
                if (ua.ie && ua.win && obj.readyState != 4) {
                    // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
                    // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
                    var el = createElement("div");
                    obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
                    el.parentNode.replaceChild(abstractAltContent(obj), el);
                    obj.style.display = "none";
                    (function () {
                        if (obj.readyState == 4) {
                            obj.parentNode.removeChild(obj);
                        }
                        else {
                            setTimeout(arguments.callee, 10);
                        }
                    })();
                }
                else {
                    obj.parentNode.replaceChild(abstractAltContent(obj), obj);
                }
            }

            function abstractAltContent(obj) {
                var ac = createElement("div");
                if (ua.win && ua.ie) {
                    ac.innerHTML = obj.innerHTML;
                }
                else {
                    var nestedObj = obj.getElementsByTagName(OBJECT)[0];
                    if (nestedObj) {
                        var c = nestedObj.childNodes;
                        if (c) {
                            var cl = c.length;
                            for (var i = 0; i < cl; i++) {
                                if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
                                    ac.appendChild(c[i].cloneNode(true));
                                }
                            }
                        }
                    }
                }
                return ac;
            }

            /* Cross-browser dynamic SWF creation
             */
            function createSWF(attObj, parObj, id) {
                var r, el = getElementById(id);
                if (ua.wk && ua.wk < 312) {
                    return r;
                }
                if (el) {
                    if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
                        attObj.id = id;
                    }
                    if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
                        var att = "";
                        for (var i in attObj) {
                            if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
                                if (i.toLowerCase() == "data") {
                                    parObj.movie = attObj[i];
                                }
                                else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                                    att += ' class="' + attObj[i] + '"';
                                }
                                else if (i.toLowerCase() != "classid") {
                                    att += ' ' + i + '="' + attObj[i] + '"';
                                }
                            }
                        }
                        var par = "";
                        for (var j in parObj) {
                            if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
                                par += '<param name="' + j + '" value="' + parObj[j] + '" />';
                            }
                        }
                        el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
                        objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
                        r = getElementById(attObj.id);
                    }
                    else { // well-behaving browsers
                        var o = createElement(OBJECT);
                        o.setAttribute("type", FLASH_MIME_TYPE);
                        for (var m in attObj) {
                            if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
                                if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                                    o.setAttribute("class", attObj[m]);
                                }
                                else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
                                    o.setAttribute(m, attObj[m]);
                                }
                            }
                        }
                        for (var n in parObj) {
                            if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
                                createObjParam(o, n, parObj[n]);
                            }
                        }
                        el.parentNode.replaceChild(o, el);
                        r = o;
                    }
                }
                return r;
            }

            function createObjParam(el, pName, pValue) {
                var p = createElement("param");
                p.setAttribute("name", pName);
                p.setAttribute("value", pValue);
                el.appendChild(p);
            }

            /* Cross-browser SWF removal
             - Especially needed to safely and completely remove a SWF in Internet Explorer
             */
            function removeSWF(id) {
                var obj = getElementById(id);
                if (obj && obj.nodeName == "OBJECT") {
                    if (ua.ie && ua.win) {
                        obj.style.display = "none";
                        (function () {
                            if (obj.readyState == 4) {
                                removeObjectInIE(id);
                            }
                            else {
                                setTimeout(arguments.callee, 10);
                            }
                        })();
                    }
                    else {
                        obj.parentNode.removeChild(obj);
                    }
                }
            }

            function removeObjectInIE(id) {
                var obj = getElementById(id);
                if (obj) {
                    for (var i in obj) {
                        if (typeof obj[i] == "function") {
                            obj[i] = null;
                        }
                    }
                    obj.parentNode.removeChild(obj);
                }
            }

            /* Functions to optimize JavaScript compression
             */
            function getElementById(id) {
                var el = null;
                try {
                    el = doc.getElementById(id);
                }
                catch (e) {
                }
                return el;
            }

            function createElement(el) {
                return doc.createElement(el);
            }

            /* Updated attachEvent function for Internet Explorer
             - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
             */
            function addListener(target, eventType, fn) {
                target.attachEvent(eventType, fn);
                listenersArr[listenersArr.length] = [target, eventType, fn];
            }

            /* Flash Player and SWF content version matching
             */
            function hasPlayerVersion(rv) {
                var pv = ua.pv, v = rv.split(".");
                v[0] = parseInt(v[0], 10);
                v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
                v[2] = parseInt(v[2], 10) || 0;
                return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
            }

            /* Cross-browser dynamic CSS creation
             - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
             */
            function createCSS(sel, decl, media, newStyle) {
                if (ua.ie && ua.mac) {
                    return;
                }
                var h = doc.getElementsByTagName("head")[0];
                if (!h) {
                    return;
                } // to also support badly authored HTML pages that lack a head element
                var m = (media && typeof media == "string") ? media : "screen";
                if (newStyle) {
                    dynamicStylesheet = null;
                    dynamicStylesheetMedia = null;
                }
                if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
                    // create dynamic stylesheet + get a global reference to it
                    var s = createElement("style");
                    s.setAttribute("type", "text/css");
                    s.setAttribute("media", m);
                    dynamicStylesheet = h.appendChild(s);
                    if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
                        dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
                    }
                    dynamicStylesheetMedia = m;
                }
                // add style rule
                if (ua.ie && ua.win) {
                    if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
                        dynamicStylesheet.addRule(sel, decl);
                    }
                }
                else {
                    if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
                        dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
                    }
                }
            }

            function setVisibility(id, isVisible) {
                if (!autoHideShow) {
                    return;
                }
                var v = isVisible ? "visible" : "hidden";
                if (isDomLoaded && getElementById(id)) {
                    getElementById(id).style.visibility = v;
                }
                else {
                    createCSS("#" + id, "visibility:" + v);
                }
            }

            /* Filter to avoid XSS attacks
             */
            function urlEncodeIfNecessary(s) {
                var regex = /[\\\"<>\.;]/;
                var hasBadChars = regex.exec(s) != null;
                return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
            }

            /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
             */
            var cleanup = function () {
                if (ua.ie && ua.win) {
                    window.attachEvent("onunload", function () {
                        // remove listeners to avoid memory leaks
                        var ll = listenersArr.length;
                        for (var i = 0; i < ll; i++) {
                            listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
                        }
                        // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
                        var il = objIdArr.length;
                        for (var j = 0; j < il; j++) {
                            removeSWF(objIdArr[j]);
                        }
                        // cleanup library's main closures to avoid memory leaks
                        for (var k in ua) {
                            ua[k] = null;
                        }
                        ua = null;
                        for (var l in swfobject) {
                            swfobject[l] = null;
                        }
                        swfobject = null;
                    });
                }
            }();

            return {
                /* Public API
                 - Reference: http://code.google.com/p/swfobject/wiki/documentation
                 */
                registerObject: function (objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
                    if (ua.w3 && objectIdStr && swfVersionStr) {
                        var regObj = {};
                        regObj.id = objectIdStr;
                        regObj.swfVersion = swfVersionStr;
                        regObj.expressInstall = xiSwfUrlStr;
                        regObj.callbackFn = callbackFn;
                        regObjArr[regObjArr.length] = regObj;
                        setVisibility(objectIdStr, false);
                    }
                    else if (callbackFn) {
                        callbackFn({success: false, id: objectIdStr});
                    }
                },

                getObjectById: function (objectIdStr) {
                    if (ua.w3) {
                        return getObjectById(objectIdStr);
                    }
                },

                embedSWF: function (swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
                    var callbackObj = {success: false, id: replaceElemIdStr};
                    if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                        setVisibility(replaceElemIdStr, false);
                        addDomLoadEvent(function () {
                            widthStr += ""; // auto-convert to string
                            heightStr += "";
                            var att = {};
                            if (attObj && typeof attObj === OBJECT) {
                                for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                                    att[i] = attObj[i];
                                }
                            }
                            att.data = swfUrlStr;
                            att.width = widthStr;
                            att.height = heightStr;
                            var par = {};
                            if (parObj && typeof parObj === OBJECT) {
                                for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                                    par[j] = parObj[j];
                                }
                            }
                            if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                                for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                                    if (typeof par.flashvars != UNDEF) {
                                        par.flashvars += "&" + k + "=" + flashvarsObj[k];
                                    }
                                    else {
                                        par.flashvars = k + "=" + flashvarsObj[k];
                                    }
                                }
                            }
                            if (hasPlayerVersion(swfVersionStr)) { // create SWF
                                var obj = createSWF(att, par, replaceElemIdStr);
                                if (att.id == replaceElemIdStr) {
                                    setVisibility(replaceElemIdStr, true);
                                }
                                callbackObj.success = true;
                                callbackObj.ref = obj;
                            }
                            else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
                                att.data = xiSwfUrlStr;
                                showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                                return;
                            }
                            else { // show alternative content
                                setVisibility(replaceElemIdStr, true);
                            }
                            if (callbackFn) {
                                callbackFn(callbackObj);
                            }
                        });
                    }
                    else if (callbackFn) {
                        callbackFn(callbackObj);
                    }
                },

                switchOffAutoHideShow: function () {
                    autoHideShow = false;
                },

                ua: ua,

                getFlashPlayerVersion: function () {
                    return { major: ua.pv[0], minor: ua.pv[1], release: ua.pv[2] };
                },

                hasFlashPlayerVersion: hasPlayerVersion,

                createSWF: function (attObj, parObj, replaceElemIdStr) {
                    if (ua.w3) {
                        return createSWF(attObj, parObj, replaceElemIdStr);
                    }
                    else {
                        return undefined;
                    }
                },

                showExpressInstall: function (att, par, replaceElemIdStr, callbackFn) {
                    if (ua.w3 && canExpressInstall()) {
                        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                    }
                },

                removeSWF: function (objElemIdStr) {
                    if (ua.w3) {
                        removeSWF(objElemIdStr);
                    }
                },

                createCSS: function (selStr, declStr, mediaStr, newStyleBoolean) {
                    if (ua.w3) {
                        createCSS(selStr, declStr, mediaStr, newStyleBoolean);
                    }
                },

                addDomLoadEvent: addDomLoadEvent,

                addLoadEvent: addLoadEvent,

                getQueryParamValue: function (param) {
                    var q = doc.location.search || doc.location.hash;
                    if (q) {
                        if (/\?/.test(q)) {
                            q = q.split("?")[1];
                        } // strip question mark
                        if (param == null) {
                            return urlEncodeIfNecessary(q);
                        }
                        var pairs = q.split("&");
                        for (var i = 0; i < pairs.length; i++) {
                            if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                                return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                            }
                        }
                    }
                    return "";
                },

                // For internal usage only
                expressInstallCallback: function () {
                    if (isExpressInstallActive) {
                        var obj = getElementById(EXPRESS_INSTALL_ID);
                        if (obj && storedAltContent) {
                            obj.parentNode.replaceChild(storedAltContent, obj);
                            if (storedAltContentId) {
                                setVisibility(storedAltContentId, true);
                                if (ua.ie && ua.win) {
                                    storedAltContent.style.display = "block";
                                }
                            }
                            if (storedCallbackFn) {
                                storedCallbackFn(storedCallbackObj);
                            }
                        }
                        isExpressInstallActive = false;
                    }
                }
            };
        }();
        window.swfobject = swfobject;
        window.SWFUpload = SWFUpload;
    })();
});
