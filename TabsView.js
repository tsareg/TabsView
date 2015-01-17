(function (factory, global) {
    if (typeof define === "function" && define.amd) {
        define(["bower_components/backbone/backbone"], factory);
    } else {
        global.TabsView = factory(global.Backbone);
    }
}(function(Backbone) {

    var TabView = Backbone.View.extend({
        el: "<li class='tab'></li>",

        events: {
            'click': 'makeTabActive'
        },

        initialize: function (options) {
            options || (options = {});

            this.listenTo(this.model, "change:active", this.updateActiveState);
            this.listenTo(this.model, "change:title", this.updateTitle);

            this.updateActiveState();
            this.updateTitle();
        },

        updateActiveState: function () {
            this.$el[this.model.get("active") === true ? "addClass" : "removeClass"]("active");
        },

        updateTitle: function () {
            this.$el.text(this.model.get("title"));
        },

        makeTabActive: function () {
            this.model.set("active", true);
        }
    });

    function onTabContentChange(model) {
        this.collection.findWhere({active: true}) === model && renderContent.call(this)
    }

    function onActiveTabChange(changedModel, value) {
        if (value === true) {
            // make all other tabs not active
            this.collection.forEach(function (model) {
                model !== changedModel && model.set("active", false);
            });

            renderContent.call(this);
        }
    }

    function onTabModelAdd(model) {
        var view = new TabView({model: model});

        this.tabs.push(view);

        this.$(".tabs").append(view.$el);
    }

    function onTabModelRemove(model) {
        var view = this.tabs.filter(function (view) {
            return view.model === model;
        })[0];

        view && view.remove();

        this.tabs.splice(this.tabs.indexOf(view), 1);

        renderContent.call(this);
    }

    function renderContent() {
        var tab = this.collection.findWhere({active: true});

        this.$(".content").html(tab ? tab.get("content") : "");
    }

    return Backbone.View.extend({
        el: "<div class='tabsView'>" +
                "<ul class='tabs'></ul>" +
                "<div class='content'></div>" +
            "</div>",

        /**
         * @constructor
         * @param options
         * @param {Array} [options.tabs=[]] - array of tabs
         * @param {String} [options.active] - ID of active tab
         * @example
         *  var tabs = new TabsView({
         *      active: "tab2",
         *      tabs: [
         *          { id: "tab1", title: "My Tab 1", content: "<div>test 1</div>" },
         *          { id: "tab2", title: "My Tab 2", content: "<div>test 2</div>" }
         *      ]);
         *
         *  document.querySelector("#someElement").appendChild(tabs.el);
         */
        constructor: function (options) {
            Backbone.View.apply(this, arguments);

            options || (options = {});

            this.collection = new Backbone.Collection();
            this.tabs = [];

            this.listenTo(this.collection, "add", onTabModelAdd.bind(this));
            this.listenTo(this.collection, "remove", onTabModelRemove.bind(this));
            this.listenTo(this.collection, "change:active", onActiveTabChange.bind(this));
            this.listenTo(this.collection, "change:content", onTabContentChange.bind(this));

            this.collection.set(options.tabs);

            typeof options.active !== "undefined" && this.setActiveTab(options.active);
        },

        /**
         * @method addTab
         * @description Adds new tab to view
         * @param {Object} tabObj - object representing a tab
         * @throws {Error} Throws "Tab ID is not defined" error in case if tab ID is not defined
         */
        addTab: function (tabObj) {
            if (typeof tabObj.id === "undefined") {
                throw new Error("Tab ID is not defined");
            }

            this.collection.add(tabObj);
        },

        /**
         * @method removeTab
         * @description Removes existing tab
         * @param {String} tabId - ID of tab to remove
         * @throws {Error} Throws "Tab doesn't exist" error in case if tab with specified ID does not exist
         */
        removeTab: function (tabId) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            this.collection.remove(tab);
        },

        /**
         * @method setActiveTab
         * @description Sets specified tab as active
         * @param {String} tabId - ID of tab to remove
         * @throws {Error} Throws "Tab doesn't exist" error in case if tab with specified ID does not exist
         */
        setActiveTab: function (tabId) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            tab.set("active", true);
        },

        /**
         * @method getActiveTab
         * @description Gets ID of current active tab or undefined if no tab is selected
         * @returns {String|undefined}
         */
        getActiveTab: function () {
            var tab = this.collection.findWhere({active: true});

            return tab ? tab.get("id") : undefined;
        },

        /**
         * @method setTabContent
         * @description Sets content of specified tab
         * @param {String} tabId
         * @param {String|Node} content
         * @throws {Error} Throws "Tab doesn't exist" error in case if tab with specified ID does not exist
         */
        setTabContent: function (tabId, content) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            tab.set("content", content);
        },

        /**
         * @method setTabTitle
         * @description Sets title of specified tab
         * @param {String} tabId
         * @param {String} title
         * @throws {Error} Throws "Tab doesn't exist" error in case if tab with specified ID does not exist
         */
        setTabTitle: function (tabId, title) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            tab.set("title", title);
        },

        /**
         * @method remove
         * @description Removes TabsView from DOM and clears memory
         */
        remove: function () {
            this.tabs.forEach(function (tab) {
                tab.remove();
            });

            Backbone.View.prototype.remove.apply(this, arguments);
        }
    });
}, this));