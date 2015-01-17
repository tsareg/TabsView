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

        addTab: function (tabObj) {
            this.collection.add(tabObj);
        },

        removeTab: function (tabId) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            this.collection.remove(tab);
        },

        setActiveTab: function (tabId) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            tab.set("active", true);
        },

        getActiveTab: function () {
            var tab = this.collection.findWhere({active: true});

            return tab ? tab.get("id") : undefined;
        },

        setTabContent: function (tabId, content) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            tab.set("content", content);
        },

        setTabTitle: function (tabId, title) {
            var tab = this.collection.get(tabId);

            if (!tab) {
                throw new Error("Tab doesn't exist");
            }

            tab.set("title", title);
        },

        onTabDomEvent: function (event, handler) {
            var self = this;

            this.tabs.forEach(function (tab) {
                tab.$el.on(event, handler.bind(self, tab.model.get("id")));
            });
        },

        remove: function () {
            this.tabs.forEach(function (tab) {
                tab.remove();
            });

            Backbone.View.prototype.remove.apply(this, arguments);
        }
    });
}, this));