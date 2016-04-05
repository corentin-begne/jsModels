/*global ActionModel, ucfirst, isDefined, extendSingleton, getSingleton, InterfaceHelper */
var ManagerModel;
(function(){
    "use strict";
    /**
    * @name ManagerModel
    * @constructor
    * @property {ActionModel} [action = new ActionModel()] Instance of ActionModel
    * @description Manage global manager functions and actions
    */
    ManagerModel = function(cb){        
        var that = this;
        extendSingleton(ManagerModel);                
        this.container = $("body");

        require([
            "bower_components/cb-models/action.min", 
        ], loaded);

        function loaded(){
            ActionModel.getInstance(loadedModel);

            function loadedModel(instance){
                that.actionModel = instance;
                if(isDefined(cb)){
                    cb(that);
                }
            }
        }
    };

    /**
     * @member ManagerModel#getInstance
     * @description get the single class instance
     * @return {ManagerModel} the single class instance
     */
    ManagerModel.getInstance = function(cb){
        if(isDefined(cb)){
            getSingleton(ManagerModel, cb);
        } else {
            return getSingleton(ManagerModel);
        }
    };

    ManagerModel.prototype.getVars = function(container){     
        var data = {};
        $(container).find(".varInterface").each(addData);

        function addData(i, element){
            data[$(element).attr("id")] = $(element).html().trim();
            $(element).remove();
        }
        return data;
    };

    ManagerModel.prototype.init = function(container) {
        var that = this;       
        this.container = isDefined(container) ? container : $('body');                    
        that.container.find(".action").each(addEvent);

        function addEvent(i, element){
            var data = $(element).is("[action-data]") ? $.parseJSON($(element).attr("action-data")) : {};
            if(isDefined(data.class)){
                window[data.class].getInstance(loadedClass);
                
            }
            init();

            function loadedClass(instance){
                data.class = instance;
                init();
            }

            function init(){
                if(!isDefined(data.type)){
                    data.type = "click";                    
                }
                if(data.type=== "init"){
                    that[data.fn](element, data, event);
                } else {
                    var events = data.type.split(', ');
                    $.each(events, bindEvent);
                    
                }

                function bindEvent(i, event){
                    $(element).unbind(event);
                    $(element).bind(event, sendEvent);
                }

                function sendEvent(event){                
                    data.fn = isDefined(data.fn) ? data.fn : "action";
                    if($(element).is("[preventDefault]")){
                        event.preventDefault();
                    }
                    if($(element).is("[stopPropagation]")){
                        event.stopPropagation();
                    }
                    if(isDefined(that[data.fn])){
                        that[data.fn](element, data, event);                    
                    }
                }
            }
        }
    };

    ManagerModel.prototype.autocompletion = function(element, data, event) {
        data.data.container = $(element);
        data.data.cbFind = data.class[data.data.cbFind].bind(data.class);
        data.data.cbSelect = data.class[data.data.cbSelect].bind(data.class);
        if(isDefined(data.data.cbBlur)){
            data.data.cbBlur = data.class[data.data.cbBlur].bind(data.class);
        }
        new AutocompletionHelper(data.data);
    };

    ManagerModel.prototype.action = function(element, data, event) {
        if(isDefined(data.class) && isDefined(data.class[data.name])){
            data.class[data.name](element, event, data);
        }
    };

    ManagerModel.prototype.pagination = function(element, data, event) {
        data.class.pagination = new PaginationHelper({
            nbPage: data.data.nbPage,
            container: element,
            cb:data.class[data.data.cbContent].bind(data.class)
        });
    };

    ManagerModel.prototype.redirect = function(element, data, event) {
        this.actionModel.redirect(data.data.path, $(element).attr("type"));
    };


})();