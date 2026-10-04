# Gold is valued at the dealer buyback price from a community API

Gold holdings are valued at what an Indonesian dealer would pay today (the buyback price per brand), not the international spot price, because that's what selling would actually return. The only free source of buyback prices is the community API [logam-mulia-api](https://github.com/iamutaki/logam-mulia-api), which scrapes dealer websites and may break. When it fails, we fall back to the GoldAPI.io XAU/IDR spot price, fetched at most once a day to stay inside its free 100 requests a month.
