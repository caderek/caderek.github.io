(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const i of e.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function n(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();async function a(r){const o=await fetch(`https://api.npmjs.org/downloads/point/last-month/${r}`);if(o.ok)return(await o.json()).downloads}async function u(r){const o=await fetch(`https://api.github.com/repos/${r}`);if(o.ok)return(await o.json()).stargazers_count}async function c(r,o){const s=document.querySelectorAll(`[data-${r}]`);for(const n of s){const t=n.dataset[r]??"",e=await o(t);e!==void 0&&(n.innerText=new Intl.NumberFormat("en-US").format(e))}}async function f(){c("npm",a),c("github",u)}f();