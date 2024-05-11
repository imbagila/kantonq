import { onMount } from 'svelte';

export default () => {
	onMount(() => {
		const DROPDOWN_ELS = document.querySelectorAll("[data-tb-dropdown]");
		if (DROPDOWN_ELS) {
			document.addEventListener("click", (e) => {
				let target = e.target as HTMLButtonElement;

				// Toggle dropdowns
				if (target.attributes && target.getAttribute("data-tb-dropdown-toggle") !== null) {
					e.preventDefault();

					let dropdown = target.closest("[data-tb-dropdown]");
					if (dropdown === null) {
						return;
					}
					let menu = dropdown.querySelector("[data-tb-dropdown-menu]");

					setTimeout(() => {
						// Toggle dropdown
						dropdown.classList.toggle("active");
						const isActive = dropdown.classList.contains("active") ? "true" : "false";
						target.setAttribute("aria-expanded", isActive);

						// Check if menu is overflowing
						if (menu === null) {
							return;
						}
						if (menu.getBoundingClientRect().right > window.innerWidth) {
							menu.classList.add("right-0");
						}
					});
				}

				// Close dropdowns on outside click
				const CURRENT = document.querySelector("[data-tb-dropdown].active");
				const CURRENT_TOGGLE = document.querySelector("[data-tb-dropdown].active [data-tb-dropdown-toggle]");

				if (CURRENT) {
					if (!target.closest("[data-tb-dropdown-menu]")) {
						setTimeout(() => {
							CURRENT.classList.remove("active");
							if (CURRENT_TOGGLE === null) {
								return;
							}
							CURRENT_TOGGLE.setAttribute("aria-expanded", "false");
						});
					}
				}
			});
		}
	});
};
