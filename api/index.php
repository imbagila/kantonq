<?php

declare(strict_types=1);

use Phalcon\Mvc\Micro;

$app = new Micro();

$app->get(
    '/',
    function () {
        echo "<h1>Hello World!</h1>";
    }
);

$app->handle(
    $_SERVER["REQUEST_URI"]
);
