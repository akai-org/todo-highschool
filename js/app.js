(function (window, document, Handlebars, Router) {
  'use strict';

  var $ = document.querySelector.bind(document);

  Handlebars.registerHelper('completed?', function (completed) {
    return completed ? 'class=completed' : '';
  });
  Handlebars.registerHelper('checked?', function (pred) {
    return pred ? 'checked' : '';
  });
  Handlebars.registerHelper('selected?', function (filter, value) {
    return filter === value ? 'class=selected' : '';
  });
  Handlebars.registerHelper('pluralize', function (word, count) {
    return word + (count === 1 ? '' : 's');
  });

  var Keys = {
    ENTER: 13,
    ESCAPE: 27
  };

  var util = {
    uuid: function () {
      /*jshint bitwise:false */
      var i, random;
      var uuid = '';

      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }

      return uuid;
    },
    pluralize: function (count, word) {
      return word + (count === 1 ? '' : 's');
    },
    store: function (namespace, data) {
      if (data === undefined) {
        var store = window.localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      } else {
        return window.localStorage.setItem(namespace, JSON.stringify(data));
      }
    },
    find: function (arr, fn) {
      for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) {
          return i;
        }
      }
    }
  };

  var Events = {
    toggleAll: function (event) {
      var checked = event.target.checked;

      this.todos.forEach(function (elem) {
        elem.completed = checked;
      });

      this.render();
    },
    toggle: function (event) {
      var parent = event.target.parentElement.parentElement;
      var id = parent.dataset.id;
      var i = util.find(this.todos, function (elem) { return elem.id == id; });

      this.todos[i].completed = !this.todos[i].completed;

      this.render();
    },
    add: function (event) {
      var value = event.target.value.trim();

      if (event.which !== Keys.ENTER || !value) return;

      this.todos.push({
        id: util.uuid(),
        title: value,
        completed: false
      });

      event.target.value = '';

      this.render();
    },
    remove: function (event) {
      var parent = event.target.parentElement.parentElement;
      var id = parent.dataset.id;
      var i = util.find(this.todos, function (elem) { return elem.id === id; });

      this.todos.splice(i, 1);

      this.render();
    },
    clearCompleted: function (event) {
      this.todos = this.getActive();
      this.filter = 'all';
      this.render();
    }
  };

  var Elements = {
    list: function () {
      return this._list || (this._list = $('#todo-list'));
    },
    newTodo: function () {
      return this._newTodo || (this._newTodo = $('#new-todo'));
    },
    toggleAll: function () {
      return this._toggleAll || (this._toggleAll = $('#toggle-all'));
    },
    footer: function () {
      return this._footer || (this._footer = $('#footer'));
    }
  };

  var Templates = {
    compile: function () {
      this.todo = Handlebars.compile($('#todo-template').innerHTML);
      this.footer = Handlebars.compile($('#footer-template').innerHTML);
    }
  };

  var App = {
    run: function () {
      Templates.compile();
      this.bindEvents();

      this.todos = util.store('todos');

      Router({
        '/:filter': function (filter) {
          this.filter = filter;
          this.render();
        }.bind(this)
      }).init('/all');

      this.render();
    },
    getActive: function () {
      return this.todos.filter(function (e) { return !e.completed; });
    },
    getCompleted: function () {
      return this.todos.filter(function (e) { return e.completed; });
    },
    getFiltered: function () {
      switch (this.filter) {
        case 'active':
          return this.getActive();
        case 'completed':
          return this.getCompleted();
        default:
          return this.todos;
      }
    },
    bindEvents: function () {
      var self = this;

      Elements.list().addEventListener('change', function (event) {
        if (event.target.className.split(' ').indexOf('toggle') > -1)
          Events.toggle.call(self, event);
      });
      Elements.list().addEventListener('click', function (event) {
        if (event.target.className.split(' ').indexOf('destroy') > -1)
          Events.remove.call(self, event);
      });

      Elements.footer().addEventListener('click', function (event) {
        if (event.target.id === 'clear-completed')
          Events.clearCompleted.call(self, event);
      });

      Elements.newTodo().addEventListener('keyup', Events.add.bind(this));
      Elements.toggleAll().addEventListener('change', Events.toggleAll.bind(this));
    },
    render: function () {
      Elements.list().innerHTML = Templates.todo(this.getFiltered());
      Elements.footer().innerHTML = Templates.footer(function (all, active) {
        return {
          activeCount: active,
          completed: (all - active),
          filter: this.filter
        };
      }.call(this, this.todos.length, this.getActive().length));

      Elements.newTodo().focus();

      Elements.toggleAll().checked = this.getActive().length === 0;

      util.store('todos', this.todos);
    }
  };

  document.addEventListener('DOMContentLoaded', App.run.bind(App));

  window.App = App;
}.call(null, window, window.document, window.Handlebars, window.Router));
