<div class="flex h-screen overflow-y-auto p-5">
    <div class="card m-auto w-full max-w-sm p-8">
        <h3 class="mb-1 text-lg font-bold text-heading">Welcome to Kantonq!</h3>
        <div class="mb-5 text-muted">Please sign in to continue to the system</div>

        <form class="mb-3">
            <div class="form-control mb-2 flex items-center px-2.5">
                <i class="icon mr-2 flex-shrink-0">account_circle</i>
                <input type="text" class="h-9 w-full bg-transparent" placeholder="Username" autocomplete="username" />
            </div>
            <div class="form-control mb-5 flex items-center px-2.5">
                <i class="icon mr-2 flex-shrink-0">lock</i>
                <input type="password" class="h-9 w-full bg-transparent" placeholder="Password" autocomplete="current-password" />
            </div>
            <button type="submit" class="h-9 w-full justify-center rounded bg-blue-500 font-bold text-white hover:bg-blue-600">Sign in</button>
        </form>

        <div class="text-center text-sm text-muted">
            <a href="/register" class="mb-1 block hover:text-body">Register for a new account</a>
            <a href="/forgot-password" class="block hover:text-body">Forgot Password?</a>
        </div>
    </div>
</div>