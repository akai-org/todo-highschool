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
    toggle: function (event) {
      var parent = event.target.parentElement.parentElement;
      var id = parent.dataset.id;
      var i = util.find(this.todos, function (elem) { return elem.id == id; });

      this.todos[i].completed = !this.todos[i].completed;

      this.render();
    }
  };

  var Elements = {
    list: function () {
      return this._list || (this._list = $('#todo-list'));
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

      this.todos = [
        {
          id: util.uuid(),
          completed: false,
          title: 'Kup mleko'
        }
      ];

      this.render();
    },
    bindEvents: function () {
      Elements.list().addEventListener('change', Events.toggle.bind(this));
    },
    render: function () {
      Elements.list().innerHTML = Templates.todo(this.todos);
    }
  };

  document.addEventListener('DOMContentLoaded', App.run.bind(App));

  window.App = App;
}.call(null, window, window.document, window.Handlebars, window.Router));
