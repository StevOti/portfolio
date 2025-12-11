// Auto-mark the current nav link as active based on the current filename.
(function(){
	function setActiveLink(){
		const links = document.querySelectorAll('.nav-links a');
		const path = window.location.pathname.split('/').pop() || 'index.html';
		links.forEach(a => {
			const href = (a.getAttribute('href') || '').split('/').pop();
			if(href === path){
				a.classList.add('active');
			} else {
				a.classList.remove('active');
			}
		});
	}

	if(document.readyState === 'loading'){
		document.addEventListener('DOMContentLoaded', setActiveLink);
	} else {
		setActiveLink();
	}
})();


/* Scroll reveal: fade in/out elements when they enter/leave the viewport */
(function scrollReveal(){
	function onReady(){
		// Elements to apply reveal to: top-level sections and important inner elements
		const selectors = [
			'main > section',
			'.expertise',
			'.hero-title',
			'.hero-sub',
			'.hero-intro',
			'.work-inner',
			'.work-links a',
			'.testimonial-inner',
			'.portfolio-grid',
			'.project-card',
			'.project-card .project-body',
			'.site-header',
			'.site-footer'
		];

		const targets = Array.from(document.querySelectorAll(selectors.join(','))).filter(Boolean);

		// Add the base class so elements are initially hidden
		targets.forEach(el => el.classList.add('reveal'));

		// Containers for which we want to stagger immediate children
		const staggerSelectors = ['.work-inner', '.portfolio-grid', '.project-card', '.testimonial-track', '.expertise', '.expertise-group'];

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				const el = entry.target;
				const isStagger = staggerSelectors.some(sel => el.matches && el.matches(sel));

				if (entry.isIntersecting) {
					if (isStagger) {
						// Stagger direct children
						const children = Array.from(el.querySelectorAll(':scope > *'));
						children.forEach((child, i) => {
							child.classList.add('reveal');
							child.style.transitionDelay = `${i * 80}ms`;
							child.classList.add('is-visible');
						});
						el.classList.add('is-visible');
					} else {
						el.classList.add('is-visible');
					}
				} else {
					if (isStagger) {
						const children = Array.from(el.querySelectorAll(':scope > *'));
						children.forEach((child) => {
							child.classList.remove('is-visible');
							child.style.transitionDelay = '';
						});
						el.classList.remove('is-visible');
					} else {
						el.classList.remove('is-visible');
					}
				}
			});
		}, {
			root: null,
			rootMargin: '0px 0px -8% 0px',
			threshold: 0.08
		});

		targets.forEach(el => observer.observe(el));


		// Basic testimonial carousel (if present)
		(function initTestimonialCarousel(){
			const track = document.querySelector('.testimonial-track');
			if(!track) return;
			const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
			const dotsContainer = document.querySelector('.testimonial-dots');
			const prevBtn = document.querySelector('.testimonial-btn[data-action="prev"]');
			const nextBtn = document.querySelector('.testimonial-btn[data-action="next"]');
			let idx = 0;

			// build dots
			slides.forEach((s, i) => {
				const btn = document.createElement('button');
				btn.className = 'testimonial-dot';
				btn.setAttribute('aria-label', `Show testimonial ${i+1}`);
				btn.addEventListener('click', () => show(i));
				if(dotsContainer) dotsContainer.appendChild(btn);
			});

			function updateDots(){
				const dots = dotsContainer ? Array.from(dotsContainer.children) : [];
				dots.forEach((d, i) => d.classList.toggle('active', i === idx));
			}

			function clearStagger(slide){
				const children = Array.from(slide.querySelectorAll(':scope > *'));
				children.forEach(ch => { ch.style.transitionDelay = ''; ch.classList.remove('is-visible'); });
			}

			function applyStagger(slide){
				const children = Array.from(slide.querySelectorAll(':scope > *'));
				children.forEach((ch, i) => { ch.classList.add('reveal'); ch.style.transitionDelay = `${i * 80}ms`; ch.classList.add('is-visible'); });
			}

			function show(n){
				idx = (n + slides.length) % slides.length;
				track.style.transform = `translateX(-${idx * 100}%)`;
				slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== idx));
				// clear previous slides' stagger and apply to current
				slides.forEach((s, i) => { if(i !== idx) clearStagger(s); });
				applyStagger(slides[idx]);
				updateDots();
			}

			if(prevBtn) prevBtn.addEventListener('click', () => show(idx-1));
			if(nextBtn) nextBtn.addEventListener('click', () => show(idx+1));

			// keyboard support for buttons
			if(dotsContainer){ dotsContainer.addEventListener('keydown', (e) => {
				if(e.key === 'ArrowLeft') show(idx-1);
				if(e.key === 'ArrowRight') show(idx+1);
			}); }

			// start on first slide
			show(0);

			// autopause on hover
			let autoplayId = null;
			function startAuto(){ autoplayId = setInterval(() => show(idx+1), 6000); }
			function stopAuto(){ if(autoplayId) clearInterval(autoplayId); autoplayId = null; }
			track.addEventListener('mouseenter', stopAuto);
			track.addEventListener('mouseleave', startAuto);
			startAuto();

			// Swipe support for touch devices
			let touchStartX = 0, touchStartY = 0, touchMoveX = 0, touchMoveY = 0;
			const threshold = 40; // pixels
			track.addEventListener('touchstart', (e) => {
				if(e.touches && e.touches.length === 1){
					touchStartX = e.touches[0].clientX;
					touchStartY = e.touches[0].clientY;
					stopAuto();
				}
			}, {passive:true});

			track.addEventListener('touchmove', (e) => {
				if(e.touches && e.touches.length === 1){
					touchMoveX = e.touches[0].clientX;
					touchMoveY = e.touches[0].clientY;
				}
			}, {passive:true});

			track.addEventListener('touchend', (e) => {
				const dx = touchMoveX - touchStartX;
				const dy = touchMoveY - touchStartY;
				if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold){
					if(dx < 0) show(idx+1); else show(idx-1);
				}
				// reset
				touchStartX = touchStartY = touchMoveX = touchMoveY = 0;
				startAuto();
			});
		})();

		// If footer is already in view (short pages), ensure it's visible
		const footer = document.querySelector('.site-footer');
		if (footer) {
			const r = footer.getBoundingClientRect();
			if (r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0) {
				footer.classList.add('is-visible');
			}
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', onReady);
	} else {
		onReady();
	}
})();

// Insert current year into footer
(function(){
	function setFooterYear(){
		const el = document.getElementById('footer-year');
		if(!el) return;
		el.textContent = new Date().getFullYear();
	}

	if(document.readyState === 'loading'){
		document.addEventListener('DOMContentLoaded', setFooterYear);
	} else {
		setFooterYear();
	}
})();

// Logo animation removed — using initials-only logo

// Mobile nav toggle
(function(){
	function initNavToggle(){
		const toggle = document.querySelector('.nav-toggle');
		const navbar = document.querySelector('.navbar');
		const navLinks = document.querySelectorAll('.nav-links a');
		if(!toggle || !navbar) return;

		toggle.addEventListener('click', function(){
			const expanded = this.getAttribute('aria-expanded') === 'true';
			this.setAttribute('aria-expanded', String(!expanded));
			navbar.classList.toggle('nav-open');
		});

		// Close mobile nav when a link is clicked
		navLinks.forEach(a => {
			a.addEventListener('click', function(){
				if(navbar.classList.contains('nav-open')){
					navbar.classList.remove('nav-open');
					const t = document.querySelector('.nav-toggle');
					if(t) t.setAttribute('aria-expanded','false');
				}
			});
		});
	}

	if(document.readyState === 'loading'){
		document.addEventListener('DOMContentLoaded', initNavToggle);
	} else {
		initNavToggle();
	}
})();


// Portfolio carousel on small screens (uses scroll-snap + JS controls)
(function(){
	function initPortfolioCarousel(){
		const grid = document.querySelector('.portfolio-grid');
		if(!grid) return;
		const container = grid.closest('.carousel-container');
		if(!container) return;

		const prev = container.querySelector('.carousel-prev');
		const next = container.querySelector('.carousel-next');
		const dots = container.querySelector('.carousel-dots');
		const cards = Array.from(grid.querySelectorAll('.project-card'));
		if(!cards.length) return;

		let idx = 0;
		let resizeObserver;
		let attached = false;
		let scrollTimeout = null;
		let prevElem = null;
		let nextElem = null;

		function buildDots(){
			if(!dots) return;
			dots.innerHTML = '';
			cards.forEach((c,i)=>{
				const b = document.createElement('button');
				b.type = 'button';
				if(i===0) b.classList.add('active');
				b.addEventListener('click', ()=>{ scrollToIndex(i); });
				dots.appendChild(b);
			});
		}

		function scrollToIndex(i){
			idx = Math.max(0, Math.min(i, cards.length-1));
			// re-query the card in case DOM changed
			const card = cards[idx];
			if(card && card.scrollIntoView){
				card.scrollIntoView({behavior:'smooth', inline:'center'});
			}
			updateDots();
		}

		function updateDots(){
			if(!dots) return;
			const btns = Array.from(dots.children);
			btns.forEach((b,i)=> b.classList.toggle('active', i===idx));
		}

		function recomputeIndex(){
			const gridRect = grid.getBoundingClientRect();
			const centerX = gridRect.left + gridRect.width/2;
			let closest = 0; let closestDist = Infinity;
			cards.forEach((c,i)=>{
				const r = c.getBoundingClientRect();
				const cCenter = r.left + r.width/2;
				const dist = Math.abs(cCenter - centerX);
				if(dist < closestDist){ closest = i; closestDist = dist; }
			});
			if(closest !== idx){ idx = closest; updateDots(); }
		}

		function onScroll(){
			if(scrollTimeout) clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(()=>{
				recomputeIndex();
			}, 80);
		}

		function attach(){
			if(attached) return;
			attached = true;

			// re-query controls in case they were replaced
			prevElem = container.querySelector('.carousel-prev');
			nextElem = container.querySelector('.carousel-next');

			buildDots();
			grid.addEventListener('scroll', onScroll, {passive:true});

			if(prevElem){
				prevElem.addEventListener('click', prevHandler);
			}
			if(nextElem){
				nextElem.addEventListener('click', nextHandler);
			}

			// observe resize to keep track
			resizeObserver = new ResizeObserver(()=> recomputeIndex());
			resizeObserver.observe(grid);
			recomputeIndex();
		}

		function detach(){
			if(!attached) return;
			attached = false;

			grid.removeEventListener('scroll', onScroll);

			if(prevElem){ prevElem.removeEventListener('click', prevHandler); }
			if(nextElem){ nextElem.removeEventListener('click', nextHandler); }

			// keep DOM intact but clear dots
			if(dots) dots.innerHTML = '';

			if(resizeObserver) resizeObserver.disconnect();
			resizeObserver = null;
			prevElem = nextElem = null;
		}

		// Handlers declared so we can remove them later
		function prevHandler(){ scrollToIndex(idx-1); }
		function nextHandler(){ scrollToIndex(idx+1); }

		// initialize only on small screens; re-evaluate on resize
		function check(){
			if(window.innerWidth <= 800){
				container.classList.add('is-active');
				attach();
			} else {
				container.classList.remove('is-active');
				detach();
			}
		}

		check();
		let rtid = null;
		window.addEventListener('resize', ()=>{ if(rtid) clearTimeout(rtid); rtid = setTimeout(check,120); });
	}

	if(document.readyState === 'loading'){
		document.addEventListener('DOMContentLoaded', initPortfolioCarousel);
	} else {
		initPortfolioCarousel();
	}
})();


