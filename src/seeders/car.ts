import db from "../extensions/drizzle.ts";
import { car } from "../schemas/car.ts";

await db().insert(car).values([
    {
        name:  "Armadillo",
        picture: "a9ea160e791509568760.png"
    },
    {
        name:  "Backfire",
        picture: "3c7ff0545e1600442975.png"
    },
    {
        name:  "Breakout",
        picture: "ef9bd5b25b1600443062.png"
    },
    {
        name:  "Dominus",
        picture: "b094084cc71575549720.png"
    },
    {
        name:  "Gizmo",
        picture: "51c0360c881600441830.png"
    },
    {
        name:  "Hogsticker",
        picture: "269befbbba1509568078.png"
    },
    {
        name:  "Hotshot",
        picture: "47dfc7b9fe1600441677.png"
    },
    {
        name:  "Luigi NSR",
        picture: "687c2b1f771510607820.png"
    },
    {
        name:  "Mario NSR",
        picture: "d723df3c081510618307.png"
    },
    {
        name:  "Merc",
        picture: "f06410cb161600442941.png"
    },
    {
        name:  "Octane",
        picture: "1d349731e61509568153.png"
    },
    {
        name:  "Paladin",
        picture: "3a5202083e1600441729.png"
    },
    {
        name:  "Road Hog",
        picture: "2e728e55941600443110.png"
    },
    {
        name:  "Samus' Gunship",
        picture: "e2abff71df1510607873.png"
    },
    {
        name:  "Sweet Tooth",
        picture: "c111b503e21620156982.png"
    },
    {
        name:  "Venom",
        picture: "4773372fef1600445113.png"
    },
    {
        name:  "X-Devil",
        picture: "095928b7bd1600445068.png"
    },
    {
        name:  "Psyclops",
        picture: "ca8746b4361648829276.png"
    },
    {
        name:  "Ace",
        picture: "ffcc7f06a01701885935.png"
    },
    {
        name:  "Artemis",
        picture: "f4da1a41201544467975.png"
    },
    {
        name:  "Artemis G1",
        picture: "b57c61d09d1544468244.png"
    },
    {
        name:  "Artemis GXT",
        picture: "00ad69006d1544468396.png"
    },
    {
        name:  "Battle Bus",
        picture: "4df829ee2e1601164675.png"
    },
    {
        name:  "Chikara",
        picture: "0e5f702b0b1575502505.png"
    },
    {
        name:  "Chikara G1",
        picture: "b745e489261575502490.png"
    },
    {
        name:  "Chikara GXT",
        picture: "393ae777561575502473.png"
    },
    {
        name:  "Emperor",
        picture: "1c471fd5741670429492.png"
    },
    {
        name:  "Emperor II",
        picture: "fc5d7246001670429508.png"
    },
    {
        name:  "Emperor II: Frozen",
        picture: "262905dcd71670429518.png"
    },
    {
        name:  "Emperor II: Scorched",
        picture: "2fddcae4db1670429525.png"
    },
    {
        name:  "Gardian",
        picture: "5af99b9a551555515949.png"
    },
    {
        name:  "Guardian G1",
        picture: "dcf10ce6d31555515967.png"
    },
    {
        name:  "Guardian GXT",
        picture: "17125dcb641555515933.png"
    },
    {
        name:  "Harbinger",
        picture: "5d8ae9fa041600942276.png"
    },
    {
        name:  "Harbinger GXT",
        picture: "bc656de3651600885515.png"
    },
    {
        name:  "Honda Civic Type R",
        picture: "074833eeb91662531042.png"
    },
    {
        name:  "Honda Civic Type R-LE",
        picture: "4579e3f56f1662531051.png"
    },
    {
        name:  "Maestro",
        picture: "47a4ef28b81655294240.png"
    },
    {
        name:  "Maverick",
        picture: "70a04d0a8a1535733041.png"
    },
    {
        name:  "Maverick G1",
        picture: "125c5150bc1535733070.png"
    },
    {
        name:  "Maverick GXT",
        picture: "d380d88a461535733094.png"
    },
    {
        name:  "Mudcat",
        picture: "74ac403f391566940808.png"
    },
    {
        name:  "Mudcat G1",
        picture: "c4cced05b01566940830.png"
    },
    {
        name:  "Mudcat GXT",
        picture: "bcdfcd596a1566940876.png"
    },
    {
        name:  "Nemesis",
        picture: "0d6e0cbe3f1570120718.png"
    },
    {
        name:  "Nexus",
        picture: "2f195b58f71637111337.png"
    },
    {
        name:  "Nexus SC",
        picture: "2c6b7e37ff1637111380.png"
    },
    {
        name:  "Nissan Silvia",
        picture: "c518917b981686157003.png"
    },
    {
        name:  "Nissan Silvia RLE",
        picture: "d5aeaa7bf81686157180.png"
    },
    {
        name:  "Nomad",
        picture: "25fe16f7601646812498.png"
    },
    {
        name:  "Nomad GXT",
        picture: "2d8e5710941646812521.png"
    },
    {
        name:  "Outlaw",
        picture: "382ea01d0e1628668011.png"
    },
    {
        name:  "Outlaw GXT",
        picture: "1d3342b6031628668039.png"
    },
    {
        name:  "Porsche 911 Turbo",
        picture: "e9c136106a1694011441.png"
    },
    {
        name:  "Porsche 911 Turbo RLE",
        picture: "a0fd64542d1694011467.png"
    },
    {
        name:  "Primo",
        picture: "3bbccec2b31701885956.png"
    },
    {
        name:  "R3mx",
        picture: "88dec781681607535772.png"
    },
    {
        name:  "R3mx GXT",
        picture: "481f19969e1607530719.png"
    },
    {
        name:  "Redline",
        picture: "d8fbc97e421682514337.png"
    },
    {
        name:  "Ronin",
        picture: "5c1cb04ec91585159681.png"
    },
    {
        name:  "Ronin G1",
        picture: "48d394e52f1585159717.png"
    },
    {
        name:  "Ronin GXT",
        picture: "7d7d76b8cc1585156992.png"
    },
    {
        name:  "Scorpion",
        picture: "21fabf60971701885979.png"
    },
    {
        name:  "Tyranno",
        picture: "3b565f3d731617811762.png"
    },
    {
        name:  "Tyranno GXT",
        picture: "94642e76ac1617811779.png"
    },
    {
        name:  "Volkswagen Golf GTI",
        picture: "cfcab1870f1678268809.png"
    },
    {
        name:  "Volkswagen Golf GTI RLE",
        picture: "10e10d92841678268824.png"
    },
    {
        name:  "Whiplash",
        picture: "6c3344236a1668529838.png"
    },
    {
        name:  "Aftershock",
        picture: "a0d270b2fb1641286580.png"
    },
    {
        name:  "Bone Shaker",
        picture: "7e50bdd6fd1487707163.png"
    },
    {
        name:  "Esper",
        picture: "b7a927c24a1600443180.png"
    },
    {
        name:  "Fast 4wd",
        picture: "1db2c2b85e1538916457.png"
    },
    {
        name:  "Gazella GT",
        picture: "89f6a5456e1538916410.png"
    },
    {
        name:  "Grog",
        picture: "6d576caa171641285142.png"
    },
    {
        name:  "Mr11",
        picture: "2e3df25e811538916432.png"
    },
    {
        name:  "Marauder",
        picture: "beda88924c1641286470.png"
    },
    {
        name:  "Masamune",
        picture: "23aefd7b6e1466509351.png"
    },
    {
        name:  "Proteus",
        picture: "79b3c9d2d21475938184.png"
    },
    {
        name:  "Ripper",
        picture: "b4d47c49061641285226.png"
    },
    {
        name:  "Scarab",
        picture: "c484fefe711520345137.png"
    },
    {
        name:  "Takumi",
        picture: "47748e5c631600443263.png"
    },
    {
        name:  "Triton",
        picture: "62643796791641286514.png"
    },
    {
        name:  "Twin Mill II",
        picture: "4bc00247701487707111.png"
    },
    {
        name:  "Vulcan",
        picture: "3a8007c2ba1641286642.png"
    },
    {
        name:  "Zippy",
        picture: "7244fbd8c01520345219.png"
    },
    {
        name:  "Animus GP",
        picture: "71870b6aeb1499307713.png"
    },
    {
        name:  "Breakout Type-S",
        picture: "97eb34e7631475683880.png"
    },
    {
        name:  "Centio",
        picture: "cbe61ba9141499307544.png"
    },
    {
        name:  "Cyclone",
        picture: "674e458cdb1532975461.png"
    },
    {
        name:  "Diesel",
        picture: "c4f3fe5ddc1702056659.png"
    },
    {
        name:  "Diestro",
        picture: "1d4b6ecc7a1551122201.png"
    },
    {
        name:  "Dingo",
        picture: "2549bad5ec1628023034.png"
    },
    {
        name:  "Dominus GT",
        picture: "75e8bb7e5d1473412157.png"
    },
    {
        name:  "Ecto-1",
        picture: "96faebf1381603202799.png"
    },
    {
        name:  "Endo",
        picture: "1f5724c5fb1490221547.png"
    },
    {
        name:  "Fennec",
        picture: "59a07ffb751560084126.png"
    },
    {
        name:  "Ice Charger",
        picture: "cf857a5cb61491816943.png"
    },
    {
        name:  "Imperator Dt5",
        picture: "24ebcba1a51512416966.png"
    },
    {
        name:  "Insido",
        picture: "e16f8d96021603151503.png"
    },
    {
        name:  "Jackal",
        picture: "d1c73cf8ac1637911413.png"
    },
    {
        name:  "Jäger 619",
        picture: "d02e13ec9f1506786587.png"
    },
    {
        name:  "Mamba",
        picture: "1ee25473d71646812484.png"
    },
    {
        name:  "Mantis",
        picture: "76c4b20ea71494793660.png"
    },
    {
        name:  "Nascar Chevrolet Camaro",
        picture: "ea84d0691b1620294477.png"
    },
    {
        name:  "Nascar Ford Mustang",
        picture: "9171387b671620294451.png"
    },
    {
        name:  "Nascar Toyota Camry",
        picture: "5a2d18d60c1620294467.png"
    },
    {
        name:  "Next Gen Nascar Chevrolet Camaro",
        picture: "55cc5561a81648667276.png"
    },
    {
        name:  "Next Gen Nascar Ford Mustang",
        picture: "71eb148e121648667283.png"
    },
    {
        name:  "Next Gen Nascar Toyota Camry",
        picture: "7d3a7a85cb1648667290.png"
    },
    {
        name:  "Nimbus",
        picture: "2d78d2cffa1539016064.png"
    },
    {
        name:  "Octane ZSR",
        picture: "6db50395201481302229.png"
    },
    {
        name:  "Peregrine TT",
        picture: "8dbb713eed1592899767.png"
    },
    {
        name:  "Road Hog XL",
        picture: "1e05b9143a1641286721.png"
    },
    {
        name:  "Samurai",
        picture: "70bc818c8a1522775851.png"
    },
    {
        name:  "Scarab",
        picture: "41fb041c4b1592336588.png"
    },
    {
        name:  "Sentinel",
        picture: "a944d78ddc1570120664.png"
    },
    {
        name:  "Takumi RX-T",
        picture: "7bd39778fe1473412354.png"
    },
    {
        name:  "Twinzer",
        picture: "ffe9cb78061527626246.png"
    },
    {
        name:  "Tygris",
        picture: "538155de741614103939.png"
    },
    {
        name:  "Werewolf",
        picture: "cc3f2dd5381518045919.png"
    },
    {
        name:  "X-Devil Mk2",
        picture: "fa26b845f91473412371.png"
    },
    {
        name:  "OO7\'s Aston Martin DBS",
        picture: "05bef070d41657701779.png"
    },
    {
        name:  "OO7\'s Aston Martin Valhalla",
        picture: "328f0bfa821633519788.png"
    },
    {
        name:  "OO7\'s Aston Martin DB5",
        picture: "4b37a85a971627560755.png"
    },
    {
        name:  "BMW M240i",
        picture: "bd1d74b4621635887101.png"
    },
    {
        name:  "Batmobile (1989)",
        picture: "76daf065b41520288725.png"
    },
    {
        name:  "Batmobile (2016)",
        picture: "9e97acd0931457510614.png"
    },
    {
        name:  "Batmobile (2022)",
        picture: "96ce97728b1646241006.png"
    },
    {
        name:  "Bugatti Centodieci",
        picture: "e2c444c9441671212726.png"
    },
    {
        name:  "Delorean Time Machin",
        picture: "a9a4e7f88f1447515506.png"
    },
    {
        name:  "Fast & Furious Dodge Charger",
        picture: "7a653a5b2c1507752125.png"
    },
    {
        name:  "Fast & Furious Dodge Charger SRT Hellcat",
        picture: "7b0ca14b0d1684340724.png"
    },
    {
        name:  "Fast & Furious Nissan Skyline",
        picture: "7d631f5c941507752286.png"
    },
    {
        name:  "Fast & Furious Pontiac Fiero",
        picture: "c0a327a4671623927547.png"
    },
    {
        name:  "Ferrari 296 GTB",
        picture: "9c809abedd1661890281.png"
    },
    {
        name:  "Ford Bronco Raptor RLE",
        picture: "4a1074f7351659628128.png"
    },
    {
        name:  "Ford F-150 RLE",
        picture: "60d8fbf9291613743607.png"
    },
    {
        name:  "Ford Mustang Mach-E RLE",
        picture: "7eb63071111638969365.png"
    },
    {
        name:  "Ford Mustang Shelby GT350R RLE",
        picture: "e5bfd364441638963315.png"
    },
    {
        name:  "Formula 1 2021",
        picture: "6f4a4c7e331621447932.png"
    },
    {
        name:  "Formula 1 2022",
        picture: "1acc4c67ae1651119512.png"
    },
    {
        name:  "Jurassic Jeep Wrangler (Bleu)",
        picture: "939f2098b41529540314.png"
    },
    {
        name:  "Jurassic Jeep Wrangler (Rouge)",
        picture: "67e36792c31529540273.png"
    },
    {
        name:  "K.I.T.T.",
        picture: "c6abe315771603202917.png"
    },
    {
        name:  "Komodo",
        picture: "011fa898411583959932.png"
    },
    {
        name:  "Lamborghini Countach LPI 800-4",
        picture: "8a30f5bd4b1648667255.png"
    },
    {
        name:  "Lamborghini Huracán STO",
        picture: "e7d1a37f291619606394.png"
    },
    {
        name:  "Mclaren 570S",
        picture: "75ad2fdf601544150314.png"
    },
    {
        name:  "Mclaren 765LT",
        picture: "f7203dd23d1642008843.png"
    },
    {
        name:  "Nissan Z Performance",
        picture: "a97d504f351653643083.png"
    },
    {
        name:  "The Dark Knight\'s Tumbler",
        picture: "96e8b361f11520288595.png"
    },
    {
        name:  "Bumblebee",
        picture: "26d187c18f1686729666.png"
    },
    {
        name:  "Lightning McQueen",
        picture: "109a66d1711699377998.png"
    },
    {
        name:  "Octane Gold",
        picture: "a0196c4bcd1680530523.png"
    }
]);

console.log("Cars seeded successfully.");
