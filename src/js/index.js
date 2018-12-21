"use strict"
import '../styles/default.scss';
var Eventable = require('./Eventable.js');
document.addEventListener("DOMContentLoaded", function () {
    var templates = {
        item: function (data) {
            var item_template = document.getElementById('todos-list-item_template');
            var div_item = document.createElement('div');
            div_item.innerHTML = item_template.innerHTML;
            var txt = div_item.querySelector('.todos-list_item_text');
            if(data.text) {
                txt.innerText = data.text;
            }
            var deleteLink = div_item.querySelector('.todos-list_item_remove');
            return {
                root: div_item,
                deleteLink: deleteLink
            };
        }
    };

    //Компонент добавления
    AddComponent.prototype = new Eventable();
    AddComponent.prototype.useCurrentText = function () {
        var text = this._input.value.trim();
        if (text) {
            this._input.value = '';
            this.trigger('add', text);
        }
    };

    AddComponent.prototype.handleEvent = function (e) {
        switch (e.type) {
            case 'keydown':
                if (e.keyCode === 13) {
                    e.preventDefault();
                    this.useCurrentText();
                }
                break;
            case 'click': {
                    e.preventDefault();
                    this.useCurrentText();
                    break;
                }
        }
    };

    function AddComponent(root) {
        this._input = root.querySelector('.todo-creator_text-input');
        this._submit = root.querySelector('.todo-creator_text-input');
        this._input.addEventListener('keydown', this);
        this._submit.addEventListener('click', this);
        this._initEventable();
    }

    //Компонент элементов списка
    function ListItemComponent(text) {
    	var templateResult = templates.item({text: text});
    	this._root = templateResult.root;
    	var checkbox = templateResult.root.querySelector('.custom-checkbox_target');
    	checkbox.addEventListener('change', checkFilters);
    	checkbox.addEventListener('change', renewUnreadyCounter);
    	templateResult.deleteLink.addEventListener('click', this);
    	this._initEventable();
    }

    ListItemComponent.prototype = new Eventable();
    ListItemComponent.prototype.getRoot = function () {
    	return this._root;
    };

    ListItemComponent.prototype.remove = function () {
    	this.trigger('remove', this);
    };

    ListItemComponent.prototype.handleEvent = function () {
    	this.remove();
    };

    //Компонент списка
    function ListComponent(root) {
    	this._root = root;
    	this._items = [];
    	this._initEventable();
    }

    ListComponent.prototype = new Eventable();
    ListComponent.prototype.add = function (text) {
    	var item = new ListItemComponent(text);
    	this._items.push(item);
    	this._root.appendChild(item.getRoot());
    	item.on('remove', this._onItemRemove, this);
    	renewUnreadyCounter();
    	checkFilters();
    };

    ListComponent.prototype._onItemRemove = function (item) {
    	var itemIndex = this._items.indexOf(item);
    	if (itemIndex !== -1) {
    		this._root.removeChild(item.getRoot());
    		this._items.splice(itemIndex, 1);
    	}
    	renewUnreadyCounter();
    };

    //Определение текущих компонентов
    var addNode = document.querySelector('.todo-creator');
    var listNode = document.querySelector('.todos-list');
    var add = new AddComponent(addNode);
    var list = new ListComponent(listNode);
    add.on('add', list.add, list);

    var listItems = listNode.getElementsByClassName('todos-list_item');
    var checkboxes = listNode.getElementsByClassName('custom-checkbox_target');

    //Поставить галочку на всех элементах
    var checkAll = document.querySelector('.todo-creator_check-all');
    checkAll.addEventListener('click', function(e) {
        e.preventDefault();
        var numOfChecked = 0;
        for(var i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checked === true) {
                numOfChecked++;
            }
        }
        for(var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = (numOfChecked === checkboxes.length)
            ? false
            : true;
        }
        checkFilters();
        renewUnreadyCounter();
    });

    //Удаление выполненных
    var clearCompleted = document.querySelector('.todos-toolbar_clear-completed');
    clearCompleted.addEventListener('click', function(e) {
        e.preventDefault();
        for(var i = 0; i < checkboxes.length; ) {
            if(checkboxes[i].checked === true) {
                listItems[i].remove();
            } else {
                i++;
            }
        }
        renewUnreadyCounter();
    });

    //Выбор фильтра
    var filters = document.querySelector('.todos-toolbar_filters');
    filters.addEventListener('click', function (e) {
        e.preventDefault();
        var all = filters.querySelector('._all');
        var active = filters.querySelector('._active');
        var complete = filters.querySelector('._complete');

        switch(e.target.className.replace(' __selected', '')) {
            case 'filters-item _all' : {
                active.className = active.className.replace(' __selected', '');
                complete.className = complete.className.replace(' __selected', '');
                e.target.className = 'filters-item _all __selected';
                checkFilters();
                break;
            }
            case 'filters-item _active' : {
                all.className = all.className.replace(' __selected', '');
                complete.className = complete.className.replace(' __selected', '');
                e.target.className = 'filters-item _active __selected';
                checkFilters();
                break;
            }
            case 'filters-item _complete' : {
                all.className = all.className.replace(' __selected', '');
                active.className = active.className.replace(' __selected', '');
                e.target.className = 'filters-item _complete __selected';
                checkFilters();
                break;
            }
        }
    });

    //Отображение элементов соответствующих выбранному фильтру
    function checkFilters() {
        var selected = filters.querySelector('.__selected');
        switch(selected.className.replace(' __selected', '')) {
            case 'filters-item _all' : {
                for (var i = 0; i < listItems.length; i++) {
                    listItems[i].style.display = 'block';
                }
                break;
            }
            case 'filters-item _active' : {
                for (var i = 0; i < listItems.length; i++) {
                    if(checkboxes[i].checked === true) {
                        listItems[i].style.display = 'none';
                    } else {
                        listItems[i].style.display = 'block';
                    }
                }
                break;
            }
            case 'filters-item _complete' : {
                for (var i = 0; i < listItems.length; i++) {
                    if(checkboxes[i].checked === true) {
                        listItems[i].style.display = 'block';
                    } else {
                        listItems[i].style.display = 'none';
                    }
                }
                break;
            }
        }
    }

    //Обновление счетчика невыполненных задач
    function renewUnreadyCounter() {
        var unreadyCounter = 0;
        for (var i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checked === false) {
                unreadyCounter++;
            }
        }
        var toolbar_item = document.querySelector('.todos-toolbar_unready-counter');
        toolbar_item.innerText = unreadyCounter + ' items left';
    }

    console.log('init');
});