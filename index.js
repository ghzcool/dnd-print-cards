const jimp = require("jimp");
const fs = require("fs");

const OUTPUT_PATH = "./output";
const CONFIGS_PATH = "./configs";

const list = fs.readdirSync(CONFIGS_PATH);

// for all configs in configs
list.forEach(async (name) => {
    if (name.includes(".json")) {
        // read config (paper, card, cards)
        const config = require(CONFIGS_PATH + "/" + name);
        const configName = name.split(".json").join("");
        console.log("Processing " + configName);
        const {paperProps, cardProps, cards} = config;
        // calc amount of cards per page
        const cardsPerPage = Math.floor((paperProps.width - paperProps.offset) / (cardProps.width + paperProps.offset));
        const pagesAmount = Math.ceil(cards.length / cardsPerPage);

        // create page images to fit cards
        console.log("0%");
        for (let i = 0; i < pagesAmount; i++) {
            const pageImage = await jimp.create(paperProps.width, paperProps.height, "#ffffffff");

            // TODO: render card images to paper images
            for (let j = i * cardsPerPage, k = 0; j < i * cardsPerPage + cardsPerPage && j < cards.length; j++, k++) {
                const card = cards[j];
                const cardFrontImage = await jimp.create(card.front);
                const cardBackImage = await jimp.create(card.back);
                cardBackImage.flip(false, true);
                pageImage.composite(cardFrontImage, paperProps.offset + (k * (cardProps.width + paperProps.offset)), paperProps.offset);
                pageImage.composite(cardBackImage, paperProps.offset + (k * (cardProps.width + paperProps.offset)), paperProps.offset + cardProps.height);
                console.log(Math.floor(i / pagesAmount * 100) + ((k + 1) / cardsPerPage * 100 / pagesAmount) + "%");
            }

            // save paper images as <configName>_<pageIndex>.png
            pageImage.write(OUTPUT_PATH + "/" + configName + "_" + i + ".png");
            if ((i + 1) === pagesAmount) {
                console.log(Math.floor((i + 1) / pagesAmount * 100) + "%");
            }
        }
    }
});
