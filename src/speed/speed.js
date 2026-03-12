'use strict';

/**
 * Speed button
 *
 * This feature creates a button to speed media in different levels.
 */

// Translations (English required)
mejs.i18n.en['mejs.speed-rate'] = 'Speed Rate';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * The speeds media can be accelerated
	 *
	 * Supports an array of float values or objects with format
	 * [{name: 'Slow', value: '0.75'}, {name: 'Normal', value: '1.00'}, ...]
	 * @type {{String[]|Object[]}}
	 */
	speeds: ['2.00', '1.50', '1.25', '1.00', '0.75'],
	/**
	 * @type {String}
	 */
	defaultSpeed: '1.00',
	/**
	 * @type {String}
	 */
	speedChar: 'x',
	/**
	 * @type {?String}
	 */
	speedText: null
});

Object.assign(MediaElementPlayer.prototype, {
	
	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	buildspeed (player, controls, layers, media)  {
		const
			t = this,
			isNative = t.media.rendererName !== null && /(native|html5)/i.test(t.media.rendererName)
		;
		
		if (!isNative) {
			return;
		}
		
		const speedSVGIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M183.85-241.85q-36.08-44-56.58-92.8-20.5-48.81-26.5-105.35H162q6 44 22 83.5t42 72.5l-42.15 42.15ZM100.77-520q7.23-56.54 27.12-105.15 19.88-48.62 55.96-92.62L226-675.62q-26 33-42 72.31T162-520h-61.23ZM438-102q-58.85-7.16-106.19-27.66-47.35-20.5-91.96-54.96L282-228q33.85 25.62 72.73 42.81Q393.62-168 438-162v60ZM284-732.38l-43.38-43.39q44.61-34.46 91.96-54.77Q379.92-850.84 440-858v60q-45 6-84.19 23T284-732.38Zm106 413.92v-323.08L641.54-480 390-318.46ZM520-102v-60q121-17 200.5-107T800-480q0-121-79.5-211T520-798v-60q145.92 15.85 242.96 123.46Q860-626.92 860-480t-97.04 254.54Q665.92-117.85 520-102Z"/></svg>`
		
		const
			speeds = [],
			speedTitle = (
				mejs.Utils.isString(t.options.speedText) ? t.options.speedText : mejs.i18n.t('mejs.speed-rate')
			)
		;
		
		// define the current speed.
		let currentPlaybackSpeed = t.options.defaultSpeed,
			defaultSpeedInSpeedsArray = false
		;
		
		// Convert t.options.speeds into the following format:
		// [{name: '2x label', value: 2}, {name: '1.5 label', value: 1.5}]
		// And always include the defaultSpeed
		{
			const length = t.options.speeds.length;
			for (let i = 0; i < length; i++) {
				const speed = t.options.speeds[i];
				
				if (typeof speed === 'string') {
					
					speeds.push({
						name: speed + t.options.speedChar,
						value: speed
					});
					
					if (Number(speed) === Number(t.options.defaultSpeed)) {
						defaultSpeedInSpeedsArray = true;
					}
				}
				else {
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
		
		// Sort the speeds based on their values
		speeds.sort((a, b) => {
			return Number(b.value) - Number(a.value);
		});
		
		
		// Before doing any DOM work, clean up.
		t.cleanspeed(player);
		
		// Build up the main button and the <div><ul></ul></div> next to it within the player bar.
		{
			player.speedContainer = document.createElement('div');
			player.speedContainer.className = `${t.options.classPrefix}button ${t.options.classPrefix}speed-button`;
			
			const generateId = Date.now() + '.' + Math.floor(Math.random() * 100);
			
			player.speedContainer.innerHTML = 
			'<button ' + 
				'type="button" ' +
				`aria-controls="${generateId}" `+
				'aria-expanded="false" ' +
				`title="${speedTitle}" ` +
				`aria-label="${speedTitle}" ` +
				'tabindex="0"' +
			'>'+
				speedSVGIcon + `<span class="${t.options.classPrefix}speed-btn-label">${getSpeedNameFromValue(t.options.defaultSpeed)}</span>` +
			'</button>' +
			`<div class="${t.options.classPrefix}speed-selector ${t.options.classPrefix}offscreen">` +
				`<ul id="${generateId}" class="${t.options.classPrefix}speed-selector-list" tabindex="-1"></ul>` +
			'</div>'
			
			// Add this button into the DOM
			t.addControlElement(player.speedContainer, 'speed');
			
			
			// Add speed li items.
			let ulHTML = ''
			const length = speeds.length;
			for (let i = 0; i < length; i++) {
				const speed = speeds[i]
				
				const inputId = `${t.id}-speed-${speeds[i].value}`;
				
				const speedIsDefaultSpeed = Number(speed.value) === Number(t.options.defaultSpeed)
				
				const liHTML = 
				`<li class="${t.options.classPrefix}speed-selector-list-item">` +
					`<input `+
						`class="${t.options.classPrefix}speed-selector-input ${(speedIsDefaultSpeed ? `${t.options.classPrefix}speed-selected-input` : '')}" ` +
						`type="radio" `+
						`name="${t.id}_speed"` +
						`disabled="disabled" `+
						`value="${speed.value}" `+
						`id="${inputId}"` +
						`${(speedIsDefaultSpeed ? ' checked="checked"' : '')}` +
					'/>' +
					'<label ' +
						`for="${inputId}" `+
						`class="${t.options.classPrefix}speed-selector-label` + `${(speedIsDefaultSpeed ? ` ${t.options.classPrefix}speed-selected` : '')}"`+
					'>' +
						`${speed.name}`+
					'</label>' +
				'</li>';
				
				ulHTML += liHTML
				
			}
			
			player.speedContainer.querySelector('ul').innerHTML = ulHTML
		}
		
		player.speedSelector = player.speedContainer.querySelector(`.${t.options.classPrefix}speed-selector`)
		
		// Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
		const 
			speedButton = player.speedContainer.querySelector('button'),
			speedButtonLabel = speedButton.querySelector(`.${t.options.classPrefix}speed-btn-label`),
			radios = player.speedContainer.querySelectorAll('input[type="radio"]'),
			labels = player.speedContainer.querySelectorAll(`.${t.options.classPrefix}speed-selector-label`),
			speedList = player.speedContainer.querySelector(`.${t.options.classPrefix}speed-selector-list`)
		;
		
		// Handle the events.
		let menuIsHidden = true;
		
		let lastShowChange = Date.now();
		function showMenu() {
			const now = Date.now();
			const diff = now - lastShowChange;
			if(diff < 16) {
				return;
			}
			lastShowChange = now;
			
			// show the ul menu.
			mejs.Utils.removeClass(player.speedSelector, `${t.options.classPrefix}offscreen`);
			player.speedSelector.style.height = `${player.speedSelector.querySelector('ul').offsetHeight}px`;
			player.speedSelector.style.top = `${(-1 * Number(player.speedSelector.offsetHeight))}px`;
			speedButton.setAttribute('aria-expanded', 'true');
			
			// focus on selected radio input
			const selectedSpeedInput = speedList.querySelector('.' + t.options.classPrefix + 'speed-selected-input')
			if(selectedSpeedInput != undefined) {
				selectedSpeedInput.focus();
			}
			
			menuIsHidden = false;
		}
		
		function hideMenu() {
			const now = Date.now();
			const diff = now - lastShowChange;
			if(diff < 16) {
				return;
			}
			lastShowChange = now;
			
			// hide ul menu
			mejs.Utils.addClass(player.speedSelector, `${t.options.classPrefix}offscreen`);
			speedButton.setAttribute('aria-expanded', 'true');
			speedButton.focus()
			
			menuIsHidden = true;
		}
		
		function hideShowMenu() {
			// Ideally, we check for the ${t.options.classPrefix}offscreen class, and if it's not there, it should be visible.
			if (menuIsHidden === true) {
				showMenu();
			} else {
				hideMenu();
			}
		}
		
		speedButton.addEventListener('mouseenter', showMenu);
		
		player.speedContainer.addEventListener('mouseleave', hideMenu);
		speedList.addEventListener('focusout', (event) => {
			if (!player.speedContainer.contains(event.relatedTarget)) {
				hideMenu();
			}
		});
		
		speedButton.addEventListener('click', hideShowMenu);
		
		
		// Close with Escape key.
		// Allow up/down arrow to change the selected radio without changing the volume.
		player.speedContainer.addEventListener('keydown', (event) => {
			if(event.key === "Escape"){
				hideMenu();
			}

			event.stopPropagation();
		});
		
		// handle speed change when the value of the radio changes.
		for (let i = 0, total = radios.length; i < total; i++) {
			const radio = radios[i];
			radio.disabled = false;
			radio.addEventListener('change', handleChangeSpeed);
		}
		
		// simulate clicks on radio elements.
		for (let i = 0, total = labels.length; i < total; i++) {
			labels[i].addEventListener('click', function () {
				const
					radio = mejs.Utils.siblings(this, (el) => el.tagName === 'INPUT')[0],
					event = mejs.Utils.createEvent('click', radio)
				;
				
				radio.dispatchEvent(event);
			});
		}
		
		function updateSpeedButtonLabel() {
			speedButtonLabel.innerHTML = getSpeedNameFromValue(currentPlaybackSpeed)
		}

		media.addEventListener('loadedmetadata', () => {
			if (currentPlaybackSpeed) {
				media.playbackRate = Number(currentPlaybackSpeed);
				updateSpeedButtonLabel()
			}
		});
		
		media.addEventListener('ratechange', () => {
			const numericPlaybackRate = Number(media.playbackRate);
			if (numericPlaybackRate != currentPlaybackSpeed) {
				currentPlaybackSpeed = numericPlaybackRate;
			}
			updateSpeedButtonLabel()
			
			const total = radios.length;
			for(let i = 0; i < total; i++) {
				const radio = radios[i];
				
				// remove the speed-selected class from the previous selected speed label
				mejs.Utils.removeClass(radio, `${t.options.classPrefix}speed-selected-input`);
				const siblings = mejs.Utils.siblings(radio, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}speed-selector-label`));
				for (let i = 0, total = siblings.length; i < total; i++) {
					mejs.Utils.removeClass(siblings[i], `${t.options.classPrefix}speed-selected`);
				}
				
				const radioSpeed = Number(radio.value)
				if(radioSpeed == numericPlaybackRate) {
					
					radio.checked = true;
					
					mejs.Utils.addClass(radio, `${t.options.classPrefix}speed-selected-input`);
					
					// add the speed-selected class to the label
					const siblings = mejs.Utils.siblings(radio, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}speed-selector-label`));
					for (let i = 0, total = siblings.length; i < total; i++) {
						mejs.Utils.addClass(siblings[i], `${t.options.classPrefix}speed-selected`);
					}
				}
			}
			
		});
		
		
		function handleChangeSpeed() {
			const total = radios.length;
			for(let i = 0; i < total; i++) {
				const radio = radios[i]
				
				// handle the new speed.
				if (radio.checked) {
					
					// set the speed onto the media
					const newSpeed = Number(radio.value)
					media.playbackRate = newSpeed
				}
			}
		}
		
		// gets the speed name from a speed value.
		function getSpeedNameFromValue (speedValue) {
			const numSpeedValue = Number(speedValue)
			const length = speeds.length;
			for(let i = 0; i < length; i++) {
				const speed = speeds[i]
				if(Number(speed.value) === numSpeedValue) {
					return speed.name;
				}
			}
			
			return speedValue
		}
	},
	
	
	/**
	 * Feature destructor.
	 *
	 * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 */
	cleanspeed (player) {
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