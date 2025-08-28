'use strict';

/**
 * Qualities feature
 *
 * This feature allows the generation of a menu with different video/audio qualities, depending of the elements set
 * in the <source> tags, such as `title` and `data-nmgt`
 */

// Translations (English required)
mejs.i18n.en['mejs.nmgt-chooser'] = 'NmG/NGT Chooser';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	
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
	buildnmgt (player) {
		const
			t = this
		;
		t.generateNmgtButton(t, player);
	},

	generateNmgtButton (t, player) {
		
		if(!videoHasBothSources()) {
			return
		}
		
		const arrowSVGIcon = '' +
		'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">' +
			`<path class="${t.options.classPrefix}nmgt-arrow-up" d="m480-541.85-184 184L253.85-400 480-626.15 706.15-400 664-357.85l-184-184Z"/>` +
			`<path class="${t.options.classPrefix}nmgt-arrow-down mejs__offscreen" d="M480-357.85 253.85-584 296-626.15l184 184 184-184L706.15-584 480-357.85Z"/>` +
		'</svg>'
		
		if(MediaElementPlayer.prototype.nmgtUserPreference == undefined) {
			MediaElementPlayer.prototype.nmgtUserPreference = getDefaultStreamName()
		}
		
		t.cleannmgt(player)
		
		const nmgtTitle = mejs.i18n.t('mejs.nmgt-chooser');
		
		
		// get the current stream name from the system.
		let userPreference
		{
			userPreference = MediaElementPlayer.prototype.nmgtUserPreference
			const userPreferenceSet = userPreference == nmgName() || userPreference == ngtName()
			
			if(!userPreferenceSet) {
				userPreference = getDefaultStreamName()
			}
		}
		
		
		// Build up the main button and the <div><ul></ul></div> next to it within the player bar.
		{
			const generateId = Date.now() + '.nmgt.' + Math.floor(Math.random() * 100);
		
			player.nmgtContainer = document.createElement('div');
			player.nmgtContainer.className = `${t.options.classPrefix}button ${t.options.classPrefix}nmgt-button`
			player.nmgtContainer.innerHTML = '<button ' +
				'type="button" ' +
				`aria-controls="${generateId}" ` + 
				'aria-expanded="false" ' +
				`title=${nmgtTitle} ` +
				`aria-label="${nmgtTitle}" ` +
				'tabindex="0"' +
			'>' + 
				userPreference + arrowSVGIcon +
			'</button>' +
			'<div ' + 
				'class="' + t.options.classPrefix + 'nmgt-selector ' + t.options.classPrefix + 'offscreen' + '"' +
			'>' + 
				'<ul ' +
					'id="' + generateId + '" ' +
					'class="' + t.options.classPrefix + 'nmgt-selector-list' + '"' + 
					'tabindex="-1"' +
				'></ul>' +
			'</div>'
			
			
			// add the button into the DOM
			t.addControlElement(player.nmgtContainer, 'nmgt');
			
			
			// Add NmG / NGT li items.
			var items = [nmgName(), ngtName()]
			var fullNames = [nmgFullname(), ngtFullname()]
			let ulHTML = ''
			for (let i = 0; i < items.length; i++) {
				const item = items[i]
				const fullName = fullNames[i]
				
				const inputId = `${t.id}-stream-${item}`;
				
				const isDefaultItem = item === userPreference
				
				const liHTML = 
				`<li class="${t.options.classPrefix}nmgt-selector-list-item">` +
					`<input `+
						`class="${t.options.classPrefix}nmgt-selector-input ${(isDefaultItem ? `${t.options.classPrefix}nmgt-selected-input` : '')}" ` +
						`type="radio" `+
						`name="${t.id}_nmgt"` +
						`disabled="disabled" `+
						`value="${item}" `+
						`id="${inputId}"` +
						`${(isDefaultItem ? ' checked="checked"' : '')}` +
					'/>' +
					'<label ' +
						`for="${inputId}" `+
						`class="${t.options.classPrefix}nmgt-selector-label` + `${(isDefaultItem ? ` ${t.options.classPrefix}nmgt-selected` : '')}"`+
					'>' +
						`${fullName}`+
					'</label>' +
				'</li>';
				
				ulHTML += liHTML
			}
			
			player.nmgtContainer.querySelector('ul').innerHTML = ulHTML
		}
		
		player.nmgtSelector = player.nmgtContainer.querySelector(`.${t.options.classPrefix}nmgt-selector`)
		
		// Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
		const 
			nmgtButton = player.nmgtContainer.querySelector('button'),
			radios     = player.nmgtContainer.querySelectorAll('input[type="radio"]'),
			labels     = player.nmgtContainer.querySelectorAll(`.${t.options.classPrefix}nmgt-selector-label`),
			nmgtList   = player.nmgtContainer.querySelector(`.${t.options.classPrefix}nmgt-selector-list`)
		;
		
		
		
		// Handle the events.
		let menuIsHidden = true;
		
		let lastShowChange = Date.now();
		function showMenu() {
			console.log('showMenu')
			const now = Date.now();
			const diff = now - lastShowChange;
			if(diff < 16) {
				return;
			}
			lastShowChange = now;
			
			// show the ul menu.
			mejs.Utils.removeClass(player.nmgtSelector, `${t.options.classPrefix}offscreen`);
			player.nmgtSelector.style.height = `${player.nmgtSelector.querySelector('ul').offsetHeight}px`;
			player.nmgtSelector.style.top = `${(-1 * Number(player.nmgtSelector.offsetHeight))}px`;
			nmgtButton.setAttribute('aria-expanded', 'true');
			
			// focus on selected radio input
			const selectedNmgtInput = nmgtList.querySelector('.' + t.options.classPrefix + 'nmgt-selected-input')
			if(selectedNmgtInput != undefined) {
				selectedNmgtInput.focus();
			}
			
			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-up').classList.add('mejs__offscreen')
			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-down').classList.remove('mejs__offscreen')
			
			
			menuIsHidden = false;
		}
		
		function hideMenu() {
			console.log('hideMenu')
			const now = Date.now();
			const diff = now - lastShowChange;
			if(diff < 16) {
				return;
			}
			lastShowChange = now;
			
			// hide ul menu
			mejs.Utils.addClass(player.nmgtSelector, `${t.options.classPrefix}offscreen`);
			nmgtButton.setAttribute('aria-expanded', 'true');
			nmgtButton.focus()
			
			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-up').classList.remove('mejs__offscreen')
			nmgtButton.querySelector('.' + t.options.classPrefix + 'nmgt-arrow-down').classList.add('mejs__offscreen')
			
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
		
		nmgtButton.addEventListener('mouseenter', showMenu);
		
		player.nmgtContainer.addEventListener('mouseleave', hideMenu);
		nmgtList.addEventListener('focusout', (event) => {
			if (!player.nmgtContainer.contains(event.relatedTarget)) {
				hideMenu();
			}
		});
		
		nmgtButton.addEventListener('click', hideShowMenu);
		
		
		// Close with Escape key.
		// Allow up/down arrow to change the selected radio without changing the volume.
		player.nmgtContainer.addEventListener('keydown', (event) => {
			if(event.key === "Escape"){
				hideMenu();
			}

			event.stopPropagation();
		});
		
		
		// handle speed change when the value of the radio changes.
		for (let i = 0, total = radios.length; i < total; i++) {
			const radio = radios[i];
			radio.disabled = false;
			radio.addEventListener('change', handleChangeStream);
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
		
		function handleChangeStream() {
			const total = radios.length;
			for(let i = 0; i < total; i++) {
				const radio = radios[i]
				
				// handle the new speed.
				if(radio.checked) {
					
					let correctSourceEl = getCorrectSourceEl()
					
					let newSource
					if(radio.value === nmgName()) {
						// newSource = correctSourceEl?.dataset?.srcNmg
						newSource = correctSourceEl && correctSourceEl.dataset && correctSourceEl.dataset.srcNmg
						MediaElementPlayer.prototype.nmgtUserPreference = nmgName()
					} else
					if(radio.value === ngtName()) {
						// newSource = correctSourceEl?.dataset?.srcNgt
						newSource = correctSourceEl && correctSourceEl.dataset && correctSourceEl.dataset.srcNgt
						MediaElementPlayer.prototype.nmgtUserPreference = ngtName()
					} else {
						// don't do anything I suppose
					}
					
					if(newSource != undefined) {
						player.src = newSource
						player.container.classList.remove('me-video-player-loaded')
						// debugger
					}
					
					// try to play because it might fail
					try {
						player.play()
					} catch(e) {
						// no catch content
					}
					
					nmgtButton.innerHTML = radio.value + arrowSVGIcon
					
					addSelected(radio)
				} else {
					removeSelected(radio)
				}
			}
		}
		
		function getCorrectSourceEl() {
			let correctSourceEl
			const sources = player.node.querySelectorAll('source')
			for(const source of sources) {
				if(source.dataset.srcNmg && source.dataset.srcNgt) {
					correctSourceEl = source
				}
			}
			return correctSourceEl
		}
		function videoHasBothSources() {
			return getCorrectSourceEl() != undefined
		}
		
		function addSelected(radio) {
			mejs.Utils.addClass(radio, `${t.options.classPrefix}nmgt-selected-input`);
			const siblings = mejs.Utils.siblings(radio, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}nmgt-selector-label`));
			
			for (let i = 0, total = siblings.length; i < total; i++) {
				mejs.Utils.addClass(siblings[i], `${t.options.classPrefix}nmgt-selected`);
			}
		}
		function removeSelected(radio) {
			mejs.Utils.removeClass(radio, `${t.options.classPrefix}nmgt-selected-input`);
			const siblings = mejs.Utils.siblings(radio, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}nmgt-selector-label`));
			
			for (let i = 0, total = siblings.length; i < total; i++) {
				mejs.Utils.removeClass(siblings[i], `${t.options.classPrefix}nmgt-selected`);
			}
		}
		
		function nmgName() {
			return 'NmG'
		}
		function ngtName() {
			return 'NGT'
		}
		
		function nmgFullname() {
			return 'Nederlands met Gebaren'
		}
		function ngtFullname() {
			return 'Nederlandse Gebarentaal'
		}
		
		function getDefaultStreamName() {
			return nmgName()
		}
	},

	/**
	 * Feature destructor.
	 *
	 * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 */
	cleannmgt (player) {
		if (player) {
			if (player.nmgtContainer) {
				player.nmgtContainer.remove();
			}
			if (player.nmgtSelector) {
				player.nmgtSelector.parentNode.removeChild(player.nmgtSelector);
			}
		}
	},
});
