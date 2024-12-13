// ==UserScript==
// @name         MediaWiki Enhanced Reading
// @namespace    https://github.com/tomviner/mediawiki-userscripts/
// @version      0.1
// @description  Improves MediaWiki reading experience with fixed TOC and better text width
// @author       Tom Viner
// @license      MIT
// @match        *://wiki.sohonet.co.uk/wiki/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        #bodyContent {
            max-width: 800px;
        }

        #toc {
            position: fixed;
            right: 0;
            top: 7em;
            z-index: 10000;
            background-color: rgba(249, 249, 249, 0.9);
            width: 300px;
        }

        #toc > ul {
            max-height: 80vh;
            overflow: auto;
            overscroll-behavior: contain; /* Prevents scroll chaining */
        }

        .toctoggle {
            float: right;
        }

        /* Active section highlight */
        li.toc-active > a {
            background-color: #e8f2ff;
            box-shadow: -3px 0 0 #3366cc;
        }
    `;
    document.head.appendChild(style);

    function updateActiveTocSection() {
        const headlines = Array.from(document.querySelectorAll('.mw-headline'));
        const toc = document.getElementById('toc');

        if (!headlines.length || !toc) return;

        // Find which headline is most visible
        const viewportMiddle = window.innerHeight / 400;
        let closestHeadline = null;
        let minDistance = Infinity;

        headlines.forEach(headline => {
            const rect = headline.getBoundingClientRect();
            const distance = Math.abs(rect.top - viewportMiddle);
            if (distance < minDistance) {
                minDistance = distance;
                closestHeadline = headline;
            }
        });

        if (!closestHeadline) return;

        // Update active section
        document.querySelectorAll('#toc li.toc-active').forEach(item => {
            item.classList.remove('toc-active');
        });

        const activeLink = document.querySelector(`#toc a[href="#${closestHeadline.id}"]`);
        if (activeLink) {
            const activeLi = activeLink.closest('li');
            if (activeLi) {
                activeLi.classList.add('toc-active');
                activeLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    // Add scroll event listener with debouncing
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveTocSection();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initialize
    setTimeout(updateActiveTocSection, 1000);
})();
