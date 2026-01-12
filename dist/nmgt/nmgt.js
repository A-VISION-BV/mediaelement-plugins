/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.nmgt-chooser'] = 'NmG / NGT Chooser';

Object.assign(mejs.MepDefaults, {});

Object.assign(MediaElementPlayer.prototype, {
	buildnmgt: function buildnmgt(player) {
		var t = this;
		t.generateNmgtButton(t, player);
	},
	generateNmgtButton: function generateNmgtButton(t, player) {

		if (!videoHasBothSources()) {
			return;
		}

		var arrowSVGIcon = '' + '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">' + ('<path class="' + t.options.classPrefix + 'nmgt-arrow-up" d="m480-541.85-184 184L253.85-400 480-626.15 706.15-400 664-357.85l-184-184Z"/>') + ('<path class="' + t.options.classPrefix + 'nmgt-arrow-down mejs__offscreen" d="M480-357.85 253.85-584 296-626.15l184 184 184-184L706.15-584 480-357.85Z"/>') + '</svg>';

		if (MediaElementPlayer.prototype.nmgtUserPreference == undefined) {
			MediaElementPlayer.prototype.nmgtUserPreference = getDefaultStreamName();
		}

		t.cleannmgt(player);

		var nmgtTitle = mejs.i18n.t('mejs.nmgt-chooser');

		var userPreference = void 0;
		{
			userPreference = MediaElementPlayer.prototype.nmgtUserPreference;
			var userPreferenceSet = userPreference == nmgName() || userPreference == ngtName();

			if (!userPreferenceSet) {
				userPreference = getDefaultStreamName();
			}
		}

		{
			var generateId = Date.now() + '.nmgt.' + Math.floor(Math.random() * 100);

			player.nmgtContainer = document.createElement('div');
			player.nmgtContainer.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'nmgt-button';
			player.nmgtContainer.innerHTML = '<button ' + 'type="button" ' + ('aria-controls="' + generateId + '" ') + 'aria-expanded="false" ' + ('title="' + nmgtTitle + '" ') + ('aria-label="' + nmgtTitle + '" ') + 'tabindex="0"' + '>' + userPreference + arrowSVGIcon + '</button>' + '<div ' + 'class="' + t.options.classPrefix + 'nmgt-selector ' + t.options.classPrefix + 'offscreen' + '"' + '>' + '<ul ' + 'id="' + generateId + '" ' + 'class="' + t.options.classPrefix + 'nmgt-selector-list' + '"' + 'tabindex="-1"' + '></ul>' + '</div>';

			t.addControlElement(player.nmgtContainer, 'nmgt');

			var items = [nmgName(), ngtName()];
			var fullNames = [nmgFullname(), ngtFullname()];
			var ulHTML = '';
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var fullName = fullNames[i];

				var inputId = t.id + '-stream-' + item;

				var isDefaultItem = item === userPreference;

				var liHTML = '<li class="' + t.options.classPrefix + 'nmgt-selector-list-item">' + '<input ' + ('class="' + t.options.classPrefix + 'nmgt-selector-input ' + (isDefaultItem ? t.options.classPrefix + 'nmgt-selected-input' : '') + '" ') + 'type="radio" ' + ('name="' + t.id + '_nmgt"') + 'disabled="disabled" ' + ('value="' + item + '" ') + ('id="' + inputId + '"') + ('' + (isDefaultItem ? ' checked="checked"' : '')) + '/>' + '<label ' + ('for="' + inputId + '" ') + ('class="' + t.options.classPrefix + 'nmgt-selector-label') + ((isDefaultItem ? ' ' + t.options.classPrefix + 'nmgt-selected' : '') + '"') + '>' + ('' + fullName) + '</label>' + '</li>';

				ulHTML += liHTML;
			}

			player.nmgtContainer.querySelector('ul').innerHTML = ulHTML;
		}

		player.nmgtSelector = player.nmgtContainer.querySelector('.' + t.options.classPrefix + 'nmgt-selector');

		var nmgtButton = player.nmgtContainer.querySelector('button'),
		    radios = player.nmgtContainer.querySelectorAll('input[type="radio"]'),
		    labels = player.nmgtContainer.querySelectorAll('.' + t.options.classPrefix + 'nmgt-selector-label'),
		    nmgtList = player.nmgtContainer.querySelector('.' + t.options.classPrefix + 'nmgt-selector-list');

		var menuIsHidden = true;

		var lastShowChange = Date.now();
		function showMenu() {
			console.log('showMenu');
			var now = Date.now();
			var diff = now - lastShowChange;
			if (diff < 16) {
				return;
			}
			lastShowChange = now;

			mejs.Utils.removeClass(player.nmgtSelector, t.options.classPrefix + 'offscreen');
			player.nmgtSelector.style.height = player.nmgtSelector.querySelector('ul').offsetHeight + 'px';
			player.nmgtSelector.style.top = -1 * Number(player.nmgtSelector.offsetHeight) + 'px';
			nmgtButton.setAttribute('aria-expanded', 'true');

			var selectedNmgtInput = nmgtList.querySelector('.' + t.options.classPrefix + 'nmgt-selected-input');
			if (selectedNmgtInput != undefined) {
				selectedNmgtInput.focus();
			}

			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-up').classList.add('mejs__offscreen');
			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-down').classList.remove('mejs__offscreen');

			menuIsHidden = false;
		}

		function hideMenu() {
			console.log('hideMenu');
			var now = Date.now();
			var diff = now - lastShowChange;
			if (diff < 16) {
				return;
			}
			lastShowChange = now;

			mejs.Utils.addClass(player.nmgtSelector, t.options.classPrefix + 'offscreen');
			nmgtButton.setAttribute('aria-expanded', 'true');
			nmgtButton.focus();

			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-up').classList.remove('mejs__offscreen');
			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-down').classList.add('mejs__offscreen');

			menuIsHidden = true;
		}

		function hideShowMenu() {
			if (menuIsHidden === true) {
				showMenu();
			} else {
				hideMenu();
			}
		}

		nmgtButton.addEventListener('mouseenter', showMenu);

		player.nmgtContainer.addEventListener('mouseleave', hideMenu);
		nmgtList.addEventListener('focusout', function (event) {
			if (!player.nmgtContainer.contains(event.relatedTarget)) {
				hideMenu();
			}
		});

		nmgtButton.addEventListener('click', hideShowMenu);

		player.nmgtContainer.addEventListener('keydown', function (event) {
			if (event.key === "Escape") {
				hideMenu();
			}

			event.stopPropagation();
		});

		for (var _i = 0, total = radios.length; _i < total; _i++) {
			var radio = radios[_i];
			radio.disabled = false;
			radio.addEventListener('change', handleChangeStream);
		}

		for (var _i2 = 0, _total = labels.length; _i2 < _total; _i2++) {
			labels[_i2].addEventListener('click', function () {
				var radio = mejs.Utils.siblings(this, function (el) {
					return el.tagName === 'INPUT';
				})[0],
				    event = mejs.Utils.createEvent('click', radio);

				radio.dispatchEvent(event);
			});
		}

		function handleChangeStream() {
			var total = radios.length;
			for (var _i3 = 0; _i3 < total; _i3++) {
				var _radio = radios[_i3];

				if (_radio.checked) {

					var correctSourceEl = getCorrectSourceEl();

					var newSource = void 0;
					if (_radio.value === nmgName()) {
						newSource = correctSourceEl && correctSourceEl.dataset && correctSourceEl.dataset.srcNmg;
						MediaElementPlayer.prototype.nmgtUserPreference = nmgName();
					} else if (_radio.value === ngtName()) {
						newSource = correctSourceEl && correctSourceEl.dataset && correctSourceEl.dataset.srcNgt;
						MediaElementPlayer.prototype.nmgtUserPreference = ngtName();
					} else {}

					if (newSource != undefined) {
						player.src = newSource;
						player.container.classList.remove('me-video-player-loaded');
					}

					try {
						player.play();
					} catch (e) {}

					nmgtButton.innerHTML = _radio.value + arrowSVGIcon;

					addSelected(_radio);
				} else {
					removeSelected(_radio);
				}
			}
		}

		function getCorrectSourceEl() {
			var correctSourceEl = void 0;
			var sources = player.node.querySelectorAll('source');
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var source = _step.value;

					if (source.dataset.srcNmg && source.dataset.srcNgt) {
						correctSourceEl = source;
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return correctSourceEl;
		}
		function videoHasBothSources() {
			return getCorrectSourceEl() != undefined;
		}

		function addSelected(radio) {
			mejs.Utils.addClass(radio, t.options.classPrefix + 'nmgt-selected-input');
			var siblings = mejs.Utils.siblings(radio, function (el) {
				return mejs.Utils.hasClass(el, t.options.classPrefix + 'nmgt-selector-label');
			});

			for (var _i4 = 0, _total2 = siblings.length; _i4 < _total2; _i4++) {
				mejs.Utils.addClass(siblings[_i4], t.options.classPrefix + 'nmgt-selected');
			}
		}
		function removeSelected(radio) {
			mejs.Utils.removeClass(radio, t.options.classPrefix + 'nmgt-selected-input');
			var siblings = mejs.Utils.siblings(radio, function (el) {
				return mejs.Utils.hasClass(el, t.options.classPrefix + 'nmgt-selector-label');
			});

			for (var _i5 = 0, _total3 = siblings.length; _i5 < _total3; _i5++) {
				mejs.Utils.removeClass(siblings[_i5], t.options.classPrefix + 'nmgt-selected');
			}
		}

		function nmgName() {
			return 'NmG';
		}
		function ngtName() {
			return 'NGT';
		}

		function nmgFullname() {
			return nmgName();
		}
		function ngtFullname() {
			return ngtName();
		}

		function getDefaultStreamName() {
			return nmgName();
		}
	},
	cleannmgt: function cleannmgt(player) {
		if (player) {
			if (player.nmgtContainer) {
				player.nmgtContainer.remove();
			}
			if (player.nmgtSelector) {
				player.nmgtSelector.parentNode.removeChild(player.nmgtSelector);
			}
		}
	}
});

},{}]},{},[1]);
