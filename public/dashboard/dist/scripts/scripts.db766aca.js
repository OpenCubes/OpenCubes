(function(){"use strict";String.prototype.hashCode=function(){var a,b,c,d;if(b=0,c=void 0,a=void 0,d=void 0,0===this.length)return b;for(c=0,d=this.length;d>c;)a=this.charCodeAt(c),b=(b<<5)-b+a,b|=0,c++;return b},window.config={host:"opencubes.io"},angular.module("opencubesDashboardApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider",function(a){return a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).when("/:slug/edit/body",{templateUrl:"views/editdescription.html",controller:"EditdescriptionCtrl"}).when("/:slug",{templateUrl:"views/mod.html",controller:"ModCtrl"}).when("/add",{templateUrl:"views/addmod.html",controller:"AddmodCtrl"}).when("/:slug/edit/meta",{templateUrl:"views/editmeta.html",controller:"EditmetaCtrl"}).when("/:slug/edit/versions",{templateUrl:"views/editversion.html",controller:"EditversionCtrl"}).when("/:slug/stats",{templateUrl:"views/stats.html",controller:"StatsCtrl"})}]),window.menu=!0,$(function(){})}).call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("MainCtrl",["$scope",function(){}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("AboutCtrl",["$scope",function(a){return a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("EditdescriptionCtrl",["$scope","$routeParams","$rootScope",function(a,b,c){return c.navbarSection="mod",c.navbarHrefPre=""+b.slug+"/",a.save=function(){return $.ajax({url:"//"+window.config.host+"/api/v1/mods/"+b.slug,dataType:"json",type:"PUT",data:{body:$("textarea#wmd-input").val()},success:function(a){return console.log(a)}})},$.ajax({url:"//"+window.config.host+"/api/v1/mods/"+b.slug,dataType:"jsonp",success:function(b){var c;return a.mod=b.result,a.$digest(),c=!1,$("#editor").setupEditor(b.result.body,!1),$("#editor .menu").removeClass("inverted"),$("textarea#wmd-input").on("input",function(){return c?void 0:$(".ui.top.sidebar").sidebar({overlay:!0}).sidebar("show")})}})}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("SidebarCtrl",["$scope",function(a){return a.mods=[{name:"Loading mods..."}],Mod.list({author:"53e88edbedcfe99201772373"},function(b){return a.mods=b,a.$digest()})}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("ModCtrl",["$scope","$routeParams","$rootScope",function(a,b,c){return c.navbarSection="mod",c.navbarHrefPre=""+b.slug+"/",a.slug=b.slug,Mod.find(b.slug,function(b,c){return a.mod=c,a.$digest()}),$(".ui.sidebar").sidebar("hide")}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").service("Navbar",function(){var a;return a={"default":{left:[{text:"Upload a new mod",icon:"upload icon",href:"upload"}]},mod:{left:[{text:"Overview",href:"",icon:"browser icon"},{text:"Statitics",href:"stats",icon:"signal icon"},{text:"Edit meta",href:"edit/meta",icon:"info letter icon"},{text:"Edit description",href:"edit/body",icon:"edit sign icon"},{text:"Manage files & versions",href:"edit/versions",icon:"archive icon"}],right:[{text:"Actions",href:"edit/do",icon:"ellipsis vertical icon"}]}}})}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("NavbarCtrl",["$scope","Navbar",function(a,b){return a.items=b,a.getClass=function(a){return window.location.href.endsWith(a)&&""!==a?"active":""}}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").filter("makeUrl",function(){return function(){return""}})}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("AddmodCtrl",["$scope",function(a){return a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("EditmetaCtrl",["$scope","$routeParams","$rootScope",function(a,b,c){return c.navbarSection="mod",c.navbarHrefPre=""+b.slug+"/",a.save=function(){return a.mod.isDirty()?a.mod.save(function(){return $(".ui.submit.button").addClass("green").removeClass("blue").addClass("disabled").html("Saved")}):void 0},Mod.find(b.slug,function(b,c){var d,e,f;return a.mod=c,a.$digest(),f=!1,$(".ui.dropdown").dropdown().dropdown("set selected",c.category),e=$("textarea[name=summary]"),d=$("input[name=category]"),d.on("change",function(){return a.mod.set("category",d.val()),$(".ui.blue.submit.button.disabled").removeClass("disabled")}),e.on("input",function(){return a.mod.set("summary",e.val()),$(".ui.blue.submit.button.disabled").removeClass("disabled")})})}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp").controller("EditversionCtrl",["$scope","$routeParams","$rootScope",function(a,b,c){var d,e;return a.versions={},c.navbarSection="mod",$(".ui.sidebar").sidebar("hide"),c.navbarHrefPre=""+b.slug+"/",e={},a["delete"]=function(a){var b;return b="[data-uid="+a+"]",$(""+b+" .shape").shape("flip over"),e[a]?($(b).stop(),void $(b).animate({opacity:1},7500)):(e[a]=!0,void $(b).animate({opacity:0},5e3,"linear",function(){return $(""+b+" td").animate({"font-size":"0px"},500),$(""+b+" .button").remove()}))},d=function(){return $.ajax({url:"//"+window.config.host+"/api/v1/versions/"+b.slug,dataType:"jsonp",success:function(b){var c,d,e,f;for(a.versions=b,c={},e=0,f=b.length;f>e;e++)d=b[e],c[d.name]={};return console.log(c,b),a.forms=c,a.$digest()}})},d(),$(".add-version").on("click",function(){var a;return a=$("input#new-version-name"),$(".ui.modal").modal({onApprove:function(){var c;return c=a.val(),$.ajax({url:"//"+window.config.host+"/api/v1/versions/"+b.slug,type:"POST",data:{name:c},success:function(){return d(),a.val("")}})},onDeny:function(){return a.val("")}}).modal("show")}),a.upload=function(c,d){var e,f,g,h,i;return e=$(d.target),e.html('<i class="loading icon"></i> Please wait...'),i=c.replace("#","_"),h="#file-"+i.replace(/\./g,"\\."),e=$(h),g=e.get(0),f=new FormData,f.append("file",g.files[0]),f.append("path",a.forms[c].path),$.ajax({url:"//"+window.config.host+"/api/v1/versions/"+b.slug+"/"+i,type:"POST",cache:!1,data:f,dataType:"json",contentType:!1,processData:!1,error:function(a){return e.addClass("red"),e.removeClass("basic"),e.html('<i class="frown icon"></i> '+a.statusText)},success:function(a){return console.log(a)}})}}])}.call(this),function(){"use strict";angular.module("opencubesDashboardApp")}.call(this),function(){"use strict";var a,b,c;b=function(a,b){var c,d;d=a?a.getFullYear()+"-"+a.getMonth()+"-"+a.getDate():"daily",c=0,$.ajax({url:"//"+config.host+"/api/v1/stats/"+b+"/stars/day",dataType:"jsonp"}).done(function(a){return $("#chart-stars").highcharts({chart:{type:"column"},title:{text:"Monthly stars"},xAxis:{categories:a.result.labels,labels:{formatter:function(){var a;return a=/(\d+)-(\d+)-(\d+)/.exec(this.value)[3],a%2===0?a:""}}},yAxis:{title:{text:"Stars earned"}},series:[{name:"Your mod",data:a.result.data}],credits:{enabled:!1}})})},a=function(a){var b,c,d,e,f,g;return g="//"+config.host+"/api/v1/stats/"+a+"/views/daily",d="//"+config.host+"/api/v1/stats/"+a+"/stars/all",f={},c={},e=[],b=[],$.when($.ajax({url:g,dataType:"jsonp",success:function(a){return f=a}}),$.ajax({url:d,dataType:"jsonp",success:function(a){return c=a}})).then(function(){var a,d,g,h,i,j,k,l,m,n;if(h=_.object(f.result.labels,f.result.data),g=_.object(c.result.labels,c.result.data),d=[],f.result.labels.length>c.result.labels.length)for(d=f.result.labels,m=f.result.labels,i=0,k=m.length;k>i;i++)a=m[i],e.push(h[a]||0),b.push(g[a]||0);else for(d=c.result.labels,n=c.result.labels,j=0,l=n.length;l>j;j++)a=n[j],e.push(h[a]||0),b.push(g[a]||0);return $("#chart-big").highcharts({chart:{type:"line",zoomType:"xy"},tooltip:{shared:!0},title:{text:"Views and stars all time"},xAxis:{categories:d,labels:{formatter:function(){var a;return a=/(\d+)-(\d+)-(\d+)/.exec(this.value)[3]-0,1===a?this.value:" "}}},yAxis:{title:{text:"Hits"}},series:[{name:"Views",data:e},{name:"Stars",data:b,type:"column"}]})})},c=function(a,b){var c;c=a?a.getFullYear()+"-"+a.getMonth()+"-"+a.getDate():"daily",$.ajax({url:"//"+config.host+"/api/v1/stats/"+b+"/views/"+c,dataType:"jsonp"}).done(function(a){return $("#chart-views").highcharts({chart:{type:"line"},title:{text:"Views today"},xAxis:{categories:a.result.labels.map(function(a){return a+":00"}),formatter:function(){var a;return a=this.value,/(\d+):00/.exec(a)[1]%2===1?a:""}},yAxis:{title:{text:"Views"}},series:[{name:"Your mod",data:a.result.data}],credits:{enabled:!1}})})},angular.module("opencubesDashboardApp").controller("StatsCtrl",["$scope","$routeParams","$rootScope",function(d,e,f){return f.navbarSection="mod",f.navbarHrefPre=""+e.slug+"/",c(new Date(Date.now()-864e6),e.slug),b(new Date(Date.now()-864e6),e.slug),a(e.slug)}])}.call(this),function(){var a,b={}.hasOwnProperty;a=function(){function a(a){var c,d;for(c in a)b.call(a,c)&&(d=a[c],this[c]=d)}return a.prototype._dirty=!1,a.prototype._dirtyFields=[],a.prototype._new=!1,a.prototype.set=function(a,b){return"string"==typeof a&&b?(this._dirty=!0,this[a]=b,this._dirtyFields.push(a)):void 0},a.prototype.remove=function(a){return a&&this[a]?(this._dirty=!0,delete this[a],this._dirtyFields.push(a)):void 0},a.prototype.isDirty=function(){return this._dirty},a.prototype.isNew=function(){return this._new},a.prototype.dirtyFields=function(){return this._dirtyFields},a.prototype.save=function(){},a.prototype.drop=function(){},a.list=function(){},a.find=function(){},a}(),window.Model=a}.call(this),function(){var a,b,c=function(a,b){return function(){return a.apply(b,arguments)}},d={}.hasOwnProperty,e=function(a,b){function c(){this.constructor=a}for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a};b={},a=function(a){function d(){return this.save=c(this.save,this),d.__super__.constructor.apply(this,arguments)}return e(d,a),d.prototype.save=function(a){var b;return b=_.pick(this,this.dirtyFields()),this.isDirty()&&!this.isNew()?$.ajax({url:"//"+window.config.host+"/api/v1/mods/"+this.slug,dataType:"json",type:"PUT",data:b,success:function(){return a()},error:a}):void 0},d.find=function(a,c){return console.log("find"),b[a]?c(void 0,b[a]):$.ajax({url:"//"+window.config.host+"/api/v1/mods/"+a,dataType:"jsonp",success:function(e){return b[a]=new d(e.result),console.log("cached",b[a]),c(void 0,b[a])},error:c})},d.list=function(a,b){return $.ajax({url:"//"+window.config.host+"/api/v1/mods",dataType:"jsonp",data:a,success:function(a){var c,e,f,g,h;for(c=[],h=a.mods,f=0,g=h.length;g>f;f++)e=h[f],c.push(new d(e));return console.log(c),b(c)}})},d}(Model),window.Mod=a}.call(this);