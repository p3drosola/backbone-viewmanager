(function () {

var BaseView = {
  _view_bindings: [] // keeps track of the view bindings
};
Backbone.ViewManager = {};

/**
 * Creates a new child view
 * @param {Function} View creation function. eg: Backbone.View
 * @param {object} options to be passed to the view
 * @returns {Backbone.View instance}
 */
BaseView.addSubview = function (View, options) {
  var view, parent_view;

  view = new View(_.extend(options, {viewManager: true}));
  parent_view = (this instanceof Backbone.View) ? this : null;

  $(view.el).bind('remove', view.closeView); // bind our closeView function

  Backbone.ViewManager.children_of[view.cid] = [];
  if (parent_view !== null){
    Backbone.ViewManager.children_of[parent_view.cid].push(view);
  }
  Backbone.ViewManager.parent_of[view.cid] = parent_view;
  return view;
};

/**
 * Recursive view cleanup and unbinding
 */
BaseView.closeView = function () {

  // prevent endless recursive calls because of the 'remove' event
  if (Backbone.ViewManager.parent_of[this.cid] === undefined) return;
  this.trigger('closeView'); // run any custom cleanup functions
  var children = this.subViews(),
      parent = Backbone.ViewManager.parent_of[this.cid];

  // remove references from the view manager
  delete Backbone.ViewManager.parent_of[this.cid];
  delete Backbone.ViewManager.children_of[this.cid];

  // remove from parent's list of children
  if (parent){
    var parents_children = Backbone.ViewManager.children_of[parent.cid];
    var i = _(parents_children).indexOf(this);
    if (i !== -1) parents_children.splice(i, 1);
  }

  _(children).each(function (c) {
    c.closeView();
  });

  // release callbacks bound by viewBind
  _(this._view_bindings).each(function (arr){
    var unbinder = arr[3] ? arr[3][0] : 'unbind';
    arr[0]['unbind'](arr[1], [arr[2]]);
  }, this);
  this.unbind(); // unbind dom events
  this.remove(); // remove this.el from dom before removing children to avoid redraws
};


/**
 * Returns a array of children views
 * @return {Array} array of views
 */
BaseView.subViews = function () {
  return Backbone.ViewManager.children_of[this.cid];
};

/**
 * Returns a reference to a view's parent view
 * @return {Backbone.View instance} parent
 */
BaseView.parentView = function () {
  return Backbone.ViewManager.parent_of[this.cid];
};


/**
 * Binds a function to an event, only for the lifetime of the view
 * @param  {Object}   obj     model, collection, dom element
 * @param  {String}   event   name
 * @param  {Function} fn      the callback function
 *
 * @param  {Array}    methods optional array of bind/unbind method names eg: ['on', 'off']
 */
BaseView.viewBind = function (obj, event, fn, methods) {
  var binder = methods ? methods[0] : 'bind';
  this._view_bindings.push([obj, event, fn, methods]);
  obj[binder](event, fn);
};

/*
  we keep the nesting data in two different data stuctures
  because it's faster to search it this way, and it's real lightweight anyways
 */

/**
 * References to child views
 * @type {Object}
 */
Backbone.ViewManager.children_of = {};

/**
 * References to aview's parent
 * @type {Object}
 */
Backbone.ViewManager.parent_of = {};

// shortcut for creating top-level views. (without parents)
Backbone.ViewManager.create = BaseView.addSubview;

// mixin to backbone views
_.extend(Backbone.View.prototype, BaseView);

}());