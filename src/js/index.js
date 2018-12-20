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
            case 'click':{
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
    };

    ListComponent.prototype._onItemRemove = function (item) {
    	var itemIndex = this._items.indexOf(item);
    	if (itemIndex !== -1) {
    		this._root.removeChild(item.getRoot());
    		this._items.splice(itemIndex, 1);
    	}
    };

    //Определение текущих компонентов
    var addNode = document.querySelector('.todo-creator');
    var listNode = document.querySelector('.todos-list');
    var add = new AddComponent(addNode);
    var list = new ListComponent(listNode);
    add.on('add', list.add, list);

    console.log('init');
});