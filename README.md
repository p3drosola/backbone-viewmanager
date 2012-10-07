# Backbone.ViewManager


This ViewManger avoids zombie views, memory leaks & duplicate event bindings by performs serveral simple functions.

- Keeps track of the view hirarchy
- Creates view specific event bindings (will be cleaned up autmatically when the view is destroyed)
- Cleans up child views when the parent is destroyed

It's really quite simple though, and just 1K when minified.

## View Creation

For the Backbone Manager to track views it's important to create them the correctly.

Instead of creating view like this:

    var view = new App.Views.MyView({
      model: some_model
    });

Use `this.addSubview` to create a subview (where `this` is an instance of a View)

    var view = this.addSubview( App.Views.MyView, {
      model: some_model
    });

To create a view that does not have a parent. ie: a top-level view.

    var view = Backbone.ViewManager.create( App.Views.MyView, {
      collection: some_collection
    });


**NOTE:** a subview does not necesarily need to be a child element in the dom. Only a logical child.
For example if your subview is a modal popup window, that's fine. Because you still want it to be cleaned up & removed when the parent view is closed.

## View Bindings

The goal here is to easily create bindings that will be destroyed when the view is detroyed.
Because if not, the closures still exist in memory, and that means the view still exists in memory.

The function we use is `view.viewBind`.
Here's how to do it.

    var MyView = Backbone.View.extend({
        initialize: function () {

          // instead of binding directly to the model use this.viewBind
          //this.model.bind('change', this.render);
          this.viewBind(this.model, 'change', this.render);

          // you can use viewBind for anything, not just models + collections
          this.viewBind($(this.el), 'mouseover', this.showHover);
        }
      });

By binding our event handlers in this way we ensure that they'll be cleaned up automatically when the view is detroyed.

## Destroying Views

`view.closeView` is the function that destroys a view, and clean up it's bindings, and all it's children;

We can run a custom cleanup function by listening for the 'closeView' event in the view.

    view.viewBind(view, 'closeView', function (){
      alert("I run when the view is destroyed");
    });
    view.closeView();

**NOTE:** `closeView` can be configured to run automatically when the view's element is removed from the dom. It listens for the 'remove' event on the view's element.
jQuery can be configured to trigger this event when removing elements from the dom.
 [jQuery UI does it like this](https://gist.github.com/3848926)

## Navigating the View Tree

    this.subViews();    // returns an Array of views
    this.parentView();  // returns a reference to the parent View

## Migrating to Backbone.ViewManager

The first step is to make sure all views are being created correctly.
This snippet will help you to track down rouge views that are being created the "old" way. Run it before any views are created.

    // helps migrate your code to use the ViewManager
    var _configure = Backbone.View.prototype._configure;
    Backbone.View.prototype._configure = function (options) {
      if (options.viewManager !== true) {
        console.warn('Warning: view created without the viewManager. Backbone.ViewManager cannot manage views if they are not created correctly.', this);
        console.trace();
      }
      return _configure.apply(this, arguments);
    };

![screenshot](http://cl.ly/image/0g0c2H0h1P11/content)

## Resources

Checkout the sample app in the `example` folder.
If you have any questions feel free to [contact me](mailto:p3dro.sola@gmail.com)

