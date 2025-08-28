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

mejs.i18n.en['mejs.speed-rate'] = 'Speed Rate';

Object.assign(mejs.MepDefaults, {
	speeds: ['2.00', '1.50', '1.25', '1.00', '0.75'],

	defaultSpeed: '1.00',

	speedChar: 'x',

	speedText: null
});

Object.assign(MediaElementPlayer.prototype, {
	buildspeed: function buildspeed(player, controls, layers, media) {
		var t = this,
		    isNative = t.media.rendererName !== null && /(native|html5)/i.test(t.media.rendererName);

		if (!isNative) {
			return;
		}

		var speedSVGIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M183.85-241.85q-36.08-44-56.58-92.8-20.5-48.81-26.5-105.35H162q6 44 22 83.5t42 72.5l-42.15 42.15ZM100.77-520q7.23-56.54 27.12-105.15 19.88-48.62 55.96-92.62L226-675.62q-26 33-42 72.31T162-520h-61.23ZM438-102q-58.85-7.16-106.19-27.66-47.35-20.5-91.96-54.96L282-228q33.85 25.62 72.73 42.81Q393.62-168 438-162v60ZM284-732.38l-43.38-43.39q44.61-34.46 91.96-54.77Q379.92-850.84 440-858v60q-45 6-84.19 23T284-732.38Zm106 413.92v-323.08L641.54-480 390-318.46ZM520-102v-60q121-17 200.5-107T800-480q0-121-79.5-211T520-798v-60q145.92 15.85 242.96 123.46Q860-626.92 860-480t-97.04 254.54Q665.92-117.85 520-102Z"/></svg>';

		var speeds = [],
		    speedTitle = mejs.Utils.isString(t.options.speedText) ? t.options.speedText : mejs.i18n.t('mejs.speed-rate');

		var currentPlaybackSpeed = t.options.defaultSpeed,
		    defaultSpeedInSpeedsArray = false;

		{
			var length = t.options.speeds.length;
			for (var i = 0; i < length; i++) {
				var speed = t.options.speeds[i];

				if (typeof speed === 'string') {

					speeds.push({
						name: speed + t.options.speedChar,
						value: speed
					});

					if (Number(speed) === Number(t.options.defaultSpeed)) {
						defaultSpeedInSpeedsArray = true;
					}
				} else {
					speeds.push(speed);
					if (Number(speed.value) === Number(t.options.defaultSpeed)) {
						defaultSpeedInSpeedsArray = true;
					}
				}
			}

			if (!defaultSpeedInSpeedsArray) {
				speeds.push({
					name: t.options.defaultSpeed + t.options.speedChar,
					value: t.options.defaultSpeed
				});
			}
		}

		speeds.sort(function (a, b) {
			return Number(b.value) - Number(a.value);
		});

		t.cleanspeed(player);

		{
			player.speedContainer = document.createElement('div');
			player.speedContainer.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'speed-button';

			var generateId = Date.now() + '.' + Math.floor(Math.random() * 100);

			player.speedContainer.innerHTML = '<button ' + 'type="button" ' + ('aria-controls="' + generateId + '" ') + 'aria-expanded="false" ' + ('title="' + speedTitle + '" ') + ('aria-label="' + speedTitle + '" ') + 'tabindex="0"' + '>' + speedSVGIcon + ('<span class="' + t.options.classPrefix + 'speed-btn-label">' + getSpeedNameFromValue(t.options.defaultSpeed) + '</span>') + '</button>' + ('<div class="' + t.options.classPrefix + 'speed-selector ' + t.options.classPrefix + 'offscreen">') + ('<ul id="' + generateId + '" class="' + t.options.classPrefix + 'speed-selector-list" tabindex="-1"></ul>') + '</div>';

			t.addControlElement(player.speedContainer, 'speed');

			var ulHTML = '';
			var _length = speeds.length;
			for (var _i = 0; _i < _length; _i++) {
				var _speed = speeds[_i];

				var inputId = t.id + '-speed-' + speeds[_i].value;

				var speedIsDefaultSpeed = Number(_speed.value) === Number(t.options.defaultSpeed);

				var liHTML = '<li class="' + t.options.classPrefix + 'speed-selector-list-item">' + '<input ' + ('class="' + t.options.classPrefix + 'speed-selector-input ' + (speedIsDefaultSpeed ? t.options.classPrefix + 'speed-selected-input' : '') + '" ') + 'type="radio" ' + ('name="' + t.id + '_speed"') + 'disabled="disabled" ' + ('value="' + _speed.value + '" ') + ('id="' + inputId + '"') + ('' + (speedIsDefaultSpeed ? ' checked="checked"' : '')) + '/>' + '<label ' + ('for="' + inputId + '" ') + ('class="' + t.options.classPrefix + 'speed-selector-label') + ((speedIsDefaultSpeed ? ' ' + t.options.classPrefix + 'speed-selected' : '') + '"') + '>' + ('' + _speed.name) + '</label>' + '</li>';

				ulHTML += liHTML;
			}

			player.speedContainer.querySelector('ul').innerHTML = ulHTML;
		}

		player.speedSelector = player.speedContainer.querySelector('.' + t.options.classPrefix + 'speed-selector');

		var speedButton = player.speedContainer.querySelector('button'),
		    speedButtonLabel = speedButton.querySelector('.' + t.options.classPrefix + 'speed-btn-label'),
		    radios = player.speedContainer.querySelectorAll('input[type="radio"]'),
		    labels = player.speedContainer.querySelectorAll('.' + t.options.classPrefix + 'speed-selector-label'),
		    speedList = player.speedContainer.querySelector('.' + t.options.classPrefix + 'speed-selector-list');

		var menuIsHidden = true;

		var lastShowChange = Date.now();
		function showMenu() {
			var now = Date.now();
			var diff = now - lastShowChange;
			if (diff < 16) {
				return;
			}
			lastShowChange = now;

			mejs.Utils.removeClass(player.speedSelector, t.options.classPrefix + 'offscreen');
			player.speedSelector.style.height = player.speedSelector.querySelector('ul').offsetHeight + 'px';
			player.speedSelector.style.top = -1 * Number(player.speedSelector.offsetHeight) + 'px';
			speedButton.setAttribute('aria-expanded', 'true');

			var selectedSpeedInput = speedList.querySelector('.' + t.options.classPrefix + 'speed-selected-input');
			if (selectedSpeedInput != undefined) {
				selectedSpeedInput.focus();
			}

			menuIsHidden = false;
		}

		function hideMenu() {
			var now = Date.now();
			var diff = now - lastShowChange;
			if (diff < 16) {
				return;
			}
			lastShowChange = now;

			mejs.Utils.addClass(player.speedSelector, t.options.classPrefix + 'offscreen');
			speedButton.setAttribute('aria-expanded', 'true');
			speedButton.focus();

			menuIsHidden = true;
		}

		function hideShowMenu() {
			if (menuIsHidden === true) {
				showMenu();
			} else {
				hideMenu();
			}
		}

		speedButton.addEventListener('mouseenter', showMenu);

		player.speedContainer.addEventListener('mouseleave', hideMenu);
		speedList.addEventListener('focusout', function (event) {
			if (!player.speedContainer.contains(event.relatedTarget)) {
				hideMenu();
			}
		});

		speedButton.addEventListener('click', hideShowMenu);

		player.speedContainer.addEventListener('keydown', function (event) {
			if (event.key === "Escape") {
				hideMenu();
			}

			event.stopPropagation();
		});

		for (var _i2 = 0, total = radios.length; _i2 < total; _i2++) {
			var radio = radios[_i2];
			radio.disabled = false;
			radio.addEventListener('change', handleChangeSpeed);
		}

		for (var _i3 = 0, _total = labels.length; _i3 < _total; _i3++) {
			labels[_i3].addEventListener('click', function () {
				var radio = mejs.Utils.siblings(this, function (el) {
					return el.tagName === 'INPUT';
				})[0],
				    event = mejs.Utils.createEvent('click', radio);

				radio.dispatchEvent(event);
			});
		}

		function updateSpeedButtonLabel() {
			speedButtonLabel.innerHTML = getSpeedNameFromValue(currentPlaybackSpeed);
		}

		media.addEventListener('loadedmetadata', function () {
			if (currentPlaybackSpeed) {
				media.playbackRate = Number(currentPlaybackSpeed);
				updateSpeedButtonLabel();
			}
		});

		media.addEventListener('ratechange', function () {
			var numericPlaybackRate = Number(media.playbackRate);
			if (numericPlaybackRate != currentPlaybackSpeed) {
				currentPlaybackSpeed = numericPlaybackRate;
			}
			updateSpeedButtonLabel();

			var total = radios.length;
			for (var _i4 = 0; _i4 < total; _i4++) {
				var _radio = radios[_i4];

				mejs.Utils.removeClass(_radio, t.options.classPrefix + 'speed-selected-input');
				var siblings = mejs.Utils.siblings(_radio, function (el) {
					return mejs.Utils.hasClass(el, t.options.classPrefix + 'speed-selector-label');
				});
				for (var _i5 = 0, _total2 = siblings.length; _i5 < _total2; _i5++) {
					mejs.Utils.removeClass(siblings[_i5], t.options.classPrefix + 'speed-selected');
				}

				var radioSpeed = Number(_radio.value);
				if (radioSpeed == numericPlaybackRate) {

					_radio.checked = true;

					mejs.Utils.addClass(_radio, t.options.classPrefix + 'speed-selected-input');

					var _siblings = mejs.Utils.siblings(_radio, function (el) {
						return mejs.Utils.hasClass(el, t.options.classPrefix + 'speed-selector-label');
					});
					for (var _i6 = 0, _total3 = _siblings.length; _i6 < _total3; _i6++) {
						mejs.Utils.addClass(_siblings[_i6], t.options.classPrefix + 'speed-selected');
					}
				}
			}
		});

		function handleChangeSpeed() {
			var total = radios.length;
			for (var _i7 = 0; _i7 < total; _i7++) {
				var _radio2 = radios[_i7];

				if (_radio2.checked) {
					var newSpeed = Number(_radio2.value);
					media.playbackRate = newSpeed;
				}
			}
		}

		function getSpeedNameFromValue(speedValue) {
			var numSpeedValue = Number(speedValue);
			var length = speeds.length;
			for (var _i8 = 0; _i8 < length; _i8++) {
				var _speed2 = speeds[_i8];
				if (Number(_speed2.value) === numSpeedValue) {
					return _speed2.name;
				}
			}

			return speedValue;
		}
	},
	cleanspeed: function cleanspeed(player) {
		if (player) {
			if (player.speedContainer) {
				player.speedContainer.parentNode.removeChild(player.speedContainer);
			}
			if (player.speedSelector) {
				player.speedSelector.parentNode.removeChild(player.speedSelector);
			}
		}
	}
});

},{}]},{},[1]);
