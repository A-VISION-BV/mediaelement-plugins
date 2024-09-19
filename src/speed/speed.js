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
			for(let i = 0; i < length; i++) {
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
			player.speedButton = document.createElement('div');
			player.speedButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}speed-button`;
			
			player.speedButton.innerHTML = 
			'<button ' + 
				'type="button" ' +
				`aria-controls="${t.id}" `+
				'aria-expanded="false" ' +
				`title="${speedTitle}" ` +
				`aria-label="${speedTitle}" ` +
				'tabindex="0"' +
			'>'+
				getSpeedNameFromValue(t.options.defaultSpeed) +
			'</button>' +
			`<div class="${t.options.classPrefix}speed-selector ${t.options.classPrefix}offscreen">` +
				`<ul class="${t.options.classPrefix}speed-selector-list"></ul>` +
			'</div>' +
			
			// Add this button into the DOM
			t.addControlElement(player.speedButton, 'speed');
			
			
			// Add speed li items.
			let ulHTML = ''
			const length = speeds.length;
			for(let i = 0; i < length; i++) {
				const speed = speeds[i]
				
				const inputId = `${t.id}-speed-${speeds[i].value}`;
				
				const speedIsDefaultSpeed = Number(speed.value) === Number(t.options.defaultSpeed)
				
				const liHTML = 
				`<li class="${t.options.classPrefix}speed-selector-list-item">` +
					`<input `+
						`class="${t.options.classPrefix}speed-selector-input" `+
						`type="radio" `+
						`name="${t.id}_speed"` +
						`disabled="disabled" `+
						`value="${speed.value}" `+
						`id="${inputId}"` +
						`${(speedIsDefaultSpeed ? ' checked="checked"' : '')}` +
					'/>' +
					'<label ' +
						`for="${inputId}" `+
						`class="${t.options.classPrefix}speed-selector-label` +
						`${(speedIsDefaultSpeed ? ` ${t.options.classPrefix}speed-selected` : '')}"`+
					'>' +
						`${speed.name}`+
					'</label>' +
				'</li>';
				
				ulHTML += liHTML
				
			}
			
			player.speedButton.querySelector('ul').innerHTML = ulHTML
		}
		
		player.speedSelector = player.speedButton.querySelector(`.${t.options.classPrefix}speed-selector`)
		
		// Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
		const 
			radios = player.speedButton.querySelectorAll('input[type="radio"]'),
			labels = player.speedButton.querySelectorAll(`.${t.options.classPrefix}speed-selector-label`),
			speedList = player.speedButton.querySelector(`.${t.options.classPrefix}speed-selector-list`)
		;
		
		// Handle the events.
		let menuIsHidden = true;
		
		function showMenu() {
			// show the ul menu.
			mejs.Utils.removeClass(player.speedSelector, `${t.options.classPrefix}offscreen`);
			player.speedSelector.style.height = `${player.speedSelector.querySelector('ul').offsetHeight}px`;
			player.speedSelector.style.top = `${(-1 * Number(player.speedSelector.offsetHeight))}px`;
			player.speedButton.setAttribute('aria-expanded', 'true');
			
			// focus first radio input
			
			
			menuIsHidden = false;
		}
		
		function hideMenu() {
			// hide ul menu
			mejs.Utils.addClass(player.speedSelector, `${t.options.classPrefix}offscreen`);
			player.speedButton.setAttribute('aria-expanded', 'true');
			
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
		
		player.speedButton.addEventListener('mouseenter', showMenu);
		// player.speedButton.addEventListener('focusin', showMenu);
		
		player.speedButton.addEventListener('mouseleave', hideMenu);
		speedList.addEventListener('focusout', (event) => {
			if (!player.speedButton.contains(event.relatedTarget)) {
				hideMenu();
			}
		});
		
		player.speedButton.addEventListener('click', hideShowMenu);
		
		
		// handle speed change when the value of the radio changes.
		for (let i = 0, total = radios.length; i < total; i++) {
			const radio = radios[i];
			radio.disabled = false;
			radio.addEventListener('change', function () {
				
				
				// loop through all of the options.
				for(let i = 0; i < total; i++) {
					const radio = radios[i]
					
					// remove the speed-selected class from the label
					const siblings = mejs.Utils.siblings(radio, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}speed-selector-label`));
					for (let i = 0, total = siblings.length; i < total; i++) {
						mejs.Utils.removeClass(siblings[i], `${t.options.classPrefix}speed-selected`);
					}
					
					if(radio.checked) {
						
						
						// add the speed-selected class to the label
						const siblings = mejs.Utils.siblings(radio, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}speed-selector-label`));
						for (let i = 0, total = siblings.length; i < total; i++) {
							mejs.Utils.addClass(siblings[i], `${t.options.classPrefix}speed-selected`);
						}
						
						// set the speed onto the media
						const newSpeed = Number(radio.value)
						media.playbackRate = newSpeed
						currentPlaybackSpeed = newSpeed
					}
					
				}
				// debugger
				/*const 
					radioEl = this,
					newSpeed = Number(radioEl.value)
				;
				
				// set the speed.
				currentPlaybackSpeed = newSpeed;
				media.playbackRate = newSpeed
				*/
				// debugger
				// t.changeSpeed(this, player, )
			});
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
		
		
		
		// @TODO: make events work.
		
		
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
			if (player.speedButton) {
				player.speedButton.parentNode.removeChild(player.speedButton);
			}
			if (player.speedSelector) {
				player.speedSelector.parentNode.removeChild(player.speedSelector);
			}
		}
	}
	
});