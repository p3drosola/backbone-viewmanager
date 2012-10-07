$(function (){

  le_model = new (Backbone.Model.extend({ defaults: {color: 'green'} }));

  var ListView = Backbone.View.extend({
    className: 'list',
    events: {
      'click .create' : 'create',
      'click .change-color': 'changeColor'
    },

    initialize: function (options) {
      this.title = (options.title || '') + _.uniqueId();
      _.bindAll(this);
    },

    create: function (){
      var view = this.addSubview(ItemView, {
        model: le_model
      });
      this.$('ul').append(view.render().el);
    },

    changeColor: function () {
      var color = prompt('Type a CSS color. (eg: blue, red)');
      le_model.set('color', color);
    },

    render: function () {
      var $html = $('<h2>List View #'+this.cid+'</h2>'+
                 '<button class="create">Add Subview</button>'+
                 '<button class="change-color">Change Color</button>'+
                 '<ul></ul>');

      _(this.subViews()).each(function(view){
        $html.find('ul').append(view.render().el);
      });

      $(this.el).html($html);
      return this;
    }
  });

  var ItemView = Backbone.View.extend({
    className: 'item',
    nodeName: 'li',
    events: {
      'click .delete' : 'delete'
    },
    initialize: function () {
      _.bindAll(this, ['render']);
      this.viewBind(le_model, 'change', this.render);
    },

    delete: function (){
      this.closeView();
    },

    render: function (){
      var html = '<h4>Item View #' + this.cid + '<button class="delete">Delete</button></h4>'+
                 '<span style="background: '+this.model.get('color')+
                 ';color: white;" >'+this.model.get('color')+'<span>';
      $(this.el).html(html);
      return this;
    }
  });

  // initialize the baseview
  base_view = Backbone.ViewManager.create(ListView, {});
  $('body').html(base_view.render().el);


});