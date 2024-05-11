<script>
	import dropdown from "./dropdown";
    dropdown();
</script>

<header class="relative z-20 flex h-16 flex-shrink-0 items-center rounded-b-lg bg-theme text-white shadow-md shadow-theme/20 print:hidden">
    <!-- Logo -->
    <div class="flex flex-shrink-0 items-center px-5 lg:w-[var(--sidebar-width)]">
        <button id="sidebar-toggle" type="button" class="-ml-2 mr-2 grid h-9 w-9 place-content-center rounded font-light hover:bg-white/10 xl:hidden">
            <i class="icon text-2xl">dock_to_right</i>
        </button>

        <svg viewBox="0 96 960 960" fill="currentColor" class="mr-3 hidden w-6 xl:block">
            <path
                d="M461 896q-42 0-71-21.5T351 815q-3-13 6-23t24-10q9 0 17.5 7t14.5 19q6 14 18.5 21t29.5 7q24 0 39-15t15-39q0-24-15-39t-39-15H110q-13 0-21.5-8.5T80 698q0-13 8.5-21.5T110 668h351q50 0 82 32t32 82q0 50-32 82t-82 32ZM110 488q-13 0-21.5-8.5T80 458q0-13 8.5-21.5T110 428h513q35 0 55.5-20.5T699 352q0-35-20.5-55.5T623 276q-28 0-44.5 12.5T555 321q-4 12-12.5 19.5T523 348q-14 0-22.5-10t-5.5-22q10-41 43-70.5t85-29.5q57 0 96.5 39.5T759 352q0 57-39.5 96.5T623 488H110Zm670 321q-12 2-22-6.5T748 780q0-11 7.5-19.5T775 748q22-7 33.5-24t11.5-44q0-35-18.5-53.5T748 608H110q-13 0-21.5-8.5T80 578q0-13 8.5-21.5T110 548h638q59 0 95.5 36.5T880 680q0 51-27 85t-73 44Z"
            />
        </svg>

        <span class="hidden text-lg font-bold leading-none sm:block">Kantonq</span>
    </div>

    <i class="ml-auto"></i>

    <!-- Top right menu -->
    <ul class="flex items-center pr-2">
        <!-- Profile -->
        <li class="relative mx-1" data-tb-dropdown>
            <button
                type="button"
                data-tb-dropdown-toggle
                aria-expanded="false"
                title="Profile"
                class="icon grid h-9 w-9 place-content-center rounded hover:bg-white/10 aria-expanded:bg-white/20"
            >
                <img class="w-7 rounded-full" src="./avatar.jpg" alt="" />
            </button>

            <div class="rounded-tr p-1" data-tb-dropdown-menu>
                <a href="/login" class="flex items-center" data-tb-dropdown-item>
                    <i class="icon me-2">logout</i>
                    Sign Out
                </a>
            </div>
        </li>
    </ul>
</header>