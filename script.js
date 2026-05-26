(() => {
  // Prevent browser from restoring scroll in SPAs / reloads.
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


  // Smooth scrolling + active link sync (IntersectionObserver)
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const menu = $('#nav-menu');
  const navLinks = $$('[data-nav-link]');

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const is = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', is);
    });
  };

  if (menu && toggle) {
    const updateExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      menu.dataset.open = expanded ? 'true' : 'false';
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      updateExpanded(!expanded);
    });

    // Close on link click (mobile)
    $$('[data-nav-link]').forEach((a) => {
      a.addEventListener('click', () => updateExpanded(false));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const target = e.target;
      const clickedToggle = toggle.contains(target);
      const clickedInsideMenu = menu.contains(target);
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded && !clickedToggle && !clickedInsideMenu) updateExpanded(false);
    });
  }

  // IntersectionObserver for active state
  const sections = ['home', 'about', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: '-20% 0px -55% 0px' }
    );

    sections.forEach((s) => obs.observe(s));
  }

  // Contact form: submit via AJAX when Formspree is configured (no page navigation).
  const form = $('#contact-form');
  if (form) {
    const action = form.getAttribute('action') || '';
    const method = (form.getAttribute('method') || 'POST').toUpperCase();

    const isFormspree = typeof action === 'string' && action.startsWith('https://formspree.io/');

    const setToast = (text, ok = true) => {
      let toast = $('.form__toast', form);
      if (!toast) {
        toast = document.createElement('p');
        toast.className = 'form__toast';
        toast.setAttribute('role', 'status');
        toast.style.marginTop = '14px';
        toast.style.fontWeight = '800';
        form.appendChild(toast);
      }

      toast.style.color = ok ? 'rgba(34,197,94,0.95)' : 'rgba(244,63,94,0.95)';
      toast.textContent = text;
    };

    form.addEventListener('submit', async (e) => {
      const name = form.elements['name']?.value?.trim();
      const email = form.elements['email']?.value?.trim();
      const message = form.elements['message']?.value?.trim();

      const okFields = Boolean(name && email && message);
      if (!okFields) return; // let browser validation handle it

      if (!isFormspree) {
        // Demo-only behavior when no Formspree configured
        e.preventDefault();
        setToast('Message ready to send — hook your backend anytime.', true);
        form.reset();
        return;
      }

      // Formspree AJAX submission to avoid redirect
      e.preventDefault();

      const fd = new FormData(form);

      try {
        const res = await fetch(action, {
          method: method === 'GET' ? 'GET' : 'POST',
          headers: { 'Accept': 'application/json' },
          body: method === 'GET' ? undefined : fd
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setToast('Message sent successfully. I will get back to you soon!', true);
        form.reset();
      } catch (err) {
        console.error('Contact form error:', err);
        setToast('Failed to send message. Please try again.', false);
      }
    });
  }
window.generateResumePDF = async function generateResumePDF() {
  console.log('PDF Generation Started');

  const element = document.body;

  const opt = {
    margin: 0,
    filename: 'Felo_Portfolio.pdf',
    image: { type: 'png', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      onclone: function (clonedDoc) {
        // 1) Remove backdrop-filters and complex effects from cloned styles
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const style = window.getComputedStyle(el);

          if (style.backdropFilter && style.backdropFilter !== 'none') {
            el.style.backdropFilter = 'none';
            el.style.webkitBackdropFilter = 'none';
          }

          if (style.filter && style.filter !== 'none') {
            el.style.filter = 'none';
          }
        });

        // 2) Hide navigational components and floating download buttons
        const toHide = clonedDoc.querySelectorAll(
          'nav, button, footer, .nav-menu, a[href*="javascript"]'
        );
        toHide.forEach((el) => {
          el.style.display = 'none';
        });
      },
    },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    console.log('PDF Generated Successfully!');
  } catch (error) {
    console.error('PDF Error:', error);
  }
  // 1. عند تحميل الصفحة، نجيب العدد الحالي من السيرفر
window.onload = function() {
    fetch('https://api.countapi.xyz/get/felo-portfolio/likes')
        .then(response => response.json())
        .then(data => {
            document.getElementById('love-count').innerText = data.value;
        })
        .catch(error => console.log('Error:', error));
};


};
})();


