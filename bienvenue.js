/* ==========================================================================
   Offre de bienvenue : -15 % sur le premier transfert
   --------------------------------------------------------------------------
   - Pop-up affiché UNE fois au premier passage (après quelques secondes, un
     début de lecture ou une intention de sortie sur ordinateur). Sur mobile,
     il s'ouvre en panneau bas, jamais à l'arrivée sur la page.
   - « Réserver avec -15 % » active l'offre et descend au formulaire. Un
     bandeau dans chaque formulaire rappelle l'offre (ou permet de l'activer).
   - Une demande envoyée avec l'offre active porte le sujet « Offre de
     bienvenue -15 % » et le rappel en tête du message (via sendBoth).
   - Mémoire locale au navigateur (localStorage), aucune donnée envoyée.
   Conditions : CGV, article 14 (cgv.html#offre-bienvenue).
   ========================================================================== */
(function () {
    'use strict';

    var CODE = 'BIENVENUE15';
    var CLE = 'adt_bienvenue_v1';
    var WHATSAPP = '33766539254';
    var MESSAGE_WA = "Bonjour, je souhaite réserver mon premier transfert avec l'offre de bienvenue -15 % (code " + CODE + ').';

    /* --- Mémoire --------------------------------------------------------- */
    var etat = {};
    try { etat = JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { etat = {}; }
    function memoriser(modif) {
        for (var k in modif) { etat[k] = modif[k]; }
        try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* navigation privée */ }
    }
    function offreActive() { return !!etat.actif && !etat.utilise; }

    /* --- Utilisé par sendBoth() au moment de l'envoi --------------------- */
    window.ADT_PROMO = {
        appliquer: function (donnees, msg) {
            if (!offreActive()) { return msg; }
            donnees.append('subject', 'Offre de bienvenue -15 % (premier transfert)');
            return '*** OFFRE DE BIENVENUE : -15 % sur le premier transfert (code ' + CODE + ') ***\n\n' + msg;
        }
    };

    /* --- Pop-up ---------------------------------------------------------- */
    var racine = null, carte = null, dernierFocus = null, ferme = true;

    function construire() {
        racine = document.createElement('div');
        racine.className = 'adt-bv';
        racine.hidden = true;
        racine.innerHTML =
            '<div class="adt-bv-fond" data-bv-fermer></div>' +
            '<div class="adt-bv-carte" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="adt-bv-titre" aria-describedby="adt-bv-texte">' +
                '<button type="button" class="adt-bv-x" aria-label="Fermer" data-bv-fermer>&times;</button>' +
                '<div class="adt-bv-visuel"><img data-src="van-classe-v-paris.webp" alt="Vans Mercedes Classe V de L\'Art du Transfert à Paris" width="900" height="973"></div>' +
                '<div class="adt-bv-corps">' +
                    '<img class="adt-bv-logo" data-src="logo/lart-du-transfert-dore-300.webp" alt="L\'Art du Transfert" width="300" height="100">' +
                    '<p class="adt-bv-sur">Offre de bienvenue</p>' +
                    '<p class="adt-bv-remise" id="adt-bv-titre"><span class="adt-bv-moins">-</span>15<span class="adt-bv-pct">%</span></p>' +
                    '<p class="adt-bv-pour">sur votre premier transfert</p>' +
                    '<span class="adt-bv-filet" aria-hidden="true"></span>' +
                    '<p class="adt-bv-texte" id="adt-bv-texte">Première réservation chez L\'Art du Transfert&nbsp;? Profitez de 15&nbsp;% de remise sur votre premier trajet en Mercedes avec chauffeur.</p>' +
                    '<div class="adt-bv-code">' +
                        '<span class="adt-bv-code-lib">Votre code</span>' +
                        '<strong class="adt-bv-code-val">' + CODE + '</strong>' +
                        '<button type="button" class="adt-bv-copier">Copier</button>' +
                    '</div>' +
                    '<button type="button" class="adt-bv-cta">Réserver avec -15&nbsp;%</button>' +
                    '<a class="adt-bv-wa" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(MESSAGE_WA) + '" target="_blank" rel="noopener">' +
                        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35zM12.05 21.79a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.86 9.86 0 0 1 2.17 11.9c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88z"/></svg>' +
                        'Réserver sur WhatsApp' +
                    '</a>' +
                    '<button type="button" class="adt-bv-non" data-bv-fermer>Non merci</button>' +
                    '<p class="adt-bv-cond">Une fois par client, sur un premier transfert, non cumulable. <a href="cgv.html#offre-bienvenue">Conditions</a></p>' +
                '</div>' +
            '</div>';
        document.body.appendChild(racine);
        carte = racine.querySelector('.adt-bv-carte');

        racine.addEventListener('click', function (e) {
            if (e.target.closest('[data-bv-fermer]')) { fermer(); }
        });
        racine.querySelector('.adt-bv-cta').addEventListener('click', function () {
            memoriser({ actif: true });
            majBandeaux();
            fermer();
            allerAuFormulaire();
        });
        racine.querySelector('.adt-bv-wa').addEventListener('click', function () {
            memoriser({ actif: true });
            majBandeaux();
        });
        racine.querySelector('.adt-bv-copier').addEventListener('click', copierCode);
        document.addEventListener('keydown', function (e) {
            if (ferme) { return; }
            if (e.key === 'Escape') { fermer(); }
            if (e.key === 'Tab') { pieger(e); }
        });
    }

    function ouvrir() {
        if (!racine) { construire(); }
        [].forEach.call(racine.querySelectorAll('img[data-src]'), function (img) {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
        dernierFocus = document.activeElement;
        racine.hidden = false;
        document.documentElement.classList.add('adt-bv-bloque');
        ferme = false;
        memoriser({ vu: Date.now() });
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { racine.classList.add('adt-bv-ouvert'); });
        });
        // Focus sur la fenêtre elle-même (lecteurs d'écran, touche Tab) sans anneau sur un bouton
        setTimeout(function () { carte.focus({ preventScroll: true }); }, 60);
    }

    function fermer() {
        if (ferme) { return; }
        ferme = true;
        if (!etat.vu) { memoriser({ vu: Date.now() }); }
        racine.classList.remove('adt-bv-ouvert');
        document.documentElement.classList.remove('adt-bv-bloque');
        var duree = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350;
        setTimeout(function () { if (ferme) { racine.hidden = true; } }, duree);
        if (dernierFocus && dernierFocus.focus) { dernierFocus.focus({ preventScroll: true }); }
    }

    function pieger(e) {
        var f = [].filter.call(carte.querySelectorAll('button, a[href]'), function (el) { return el.offsetParent !== null; });
        if (!f.length) { return; }
        var premier = f[0], dernier = f[f.length - 1];
        if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
        else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    }

    function copierCode() {
        var bouton = racine.querySelector('.adt-bv-copier');
        var ok = function () {
            bouton.textContent = 'Copié ✓';
            bouton.classList.add('adt-bv-copie');
            setTimeout(function () { bouton.textContent = 'Copier'; bouton.classList.remove('adt-bv-copie'); }, 2000);
        };
        var secours = function () {
            var r = document.createRange();
            r.selectNodeContents(racine.querySelector('.adt-bv-code-val'));
            var s = window.getSelection();
            s.removeAllRanges();
            s.addRange(r);
            try { document.execCommand('copy'); ok(); } catch (e) { /* le code reste sélectionné */ }
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(CODE).then(ok, secours);
        } else {
            secours();
        }
    }

    function allerAuFormulaire() {
        var form = document.getElementById('contactForm');
        if (!form) { window.location.href = 'contact.html#contactForm'; return; }
        var bloc = form.closest('.form-container') || form;
        var haut = bloc.getBoundingClientRect().top + window.pageYOffset - 95;
        window.scrollTo({ top: Math.max(haut, 0), behavior: 'smooth' });
    }

    /* --- Bandeau dans les formulaires ------------------------------------ */
    function majBandeaux() {
        [].forEach.call(document.querySelectorAll('form[onsubmit*="sendBoth"]'), function (form) {
            var b = form.querySelector('.adt-bv-bandeau');
            if (etat.utilise) { if (b) { b.remove(); } return; }
            if (!b) {
                b = document.createElement('div');
                b.className = 'adt-bv-bandeau';
                form.insertBefore(b, form.firstChild);
                b.addEventListener('click', function (e) {
                    if (e.target.closest('.adt-bv-activer')) { ouvrir(); }
                });
            }
            if (offreActive()) {
                b.classList.add('adt-bv-bandeau-actif');
                b.innerHTML = '<span class="adt-bv-bandeau-ico" aria-hidden="true">✓</span>' +
                    '<span>Offre de bienvenue activée&nbsp;: <strong>-15&nbsp;%</strong> sur ce premier transfert <em>(code ' + CODE + ')</em></span>';
            } else {
                b.classList.remove('adt-bv-bandeau-actif');
                b.innerHTML = '<span class="adt-bv-bandeau-pct" aria-hidden="true">-15%</span>' +
                    '<span>Premier transfert avec nous&nbsp;? <button type="button" class="adt-bv-activer">Profiter de -15&nbsp;%</button></span>';
            }
        });
    }

    // Une demande envoyée avec l'offre active la consomme (le bandeau disparaît ensuite).
    document.addEventListener('submit', function (e) {
        if (e.target.matches && e.target.matches('form[onsubmit*="sendBoth"]') && offreActive()) {
            memoriser({ utilise: Date.now() });
        }
    });

    /* --- Déclenchement au premier passage -------------------------------- */
    function saisieEnCours() {
        var a = document.activeElement;
        return !!(a && a.closest && a.closest('form') && /INPUT|SELECT|TEXTAREA/.test(a.tagName));
    }

    function programmer() {
        if (etat.vu || etat.actif || etat.utilise) { return; }
        var mobile = window.matchMedia('(max-width: 767.98px)').matches;
        var lance = false;
        var declencher = function () {
            if (lance) { return; }
            if (saisieEnCours()) { setTimeout(declencher, 4000); return; } // ne pas couper une saisie
            lance = true;
            window.removeEventListener('scroll', auDefilement);
            document.removeEventListener('mouseout', aLaSortie);
            ouvrir();
        };
        var auDefilement = function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            if (max > 0 && window.pageYOffset / max > (mobile ? 0.25 : 0.35)) { declencher(); }
        };
        var aLaSortie = function (e) {
            if (!e.relatedTarget && e.clientY <= 0) { declencher(); }
        };
        setTimeout(declencher, mobile ? 9000 : 6000);
        setTimeout(function () { window.addEventListener('scroll', auDefilement, { passive: true }); }, 2500);
        if (!mobile) { document.addEventListener('mouseout', aLaSortie); }
    }

    function demarrer() {
        majBandeaux();
        programmer();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', demarrer);
    } else {
        demarrer();
    }
})();
