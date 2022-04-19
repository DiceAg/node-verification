var CryptoJS = require("crypto-js");

function hexdec(hexString) {
    //  discuss at: https://locutus.io/php/hexdec/
    // original by: Philippe Baumann
    //   example 1: hexdec('that')
    //   returns 1: 10
    //   example 2: hexdec('a0')
    //   returns 2: 160
    hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
    return parseInt(hexString, 16)
}

function formatNumber(num) {
    var ex = 2;
    var p = Math.pow(10, ex);
    //toFixed的精确度会受9999的影响
    return (Math.floor((Number(num) * p).toFixed(ex)) / p).toFixed(ex);
}

function bcdiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
    try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""))
        r2 = Number(arg2.toString().replace(".", ""))
        return formatNumber((r1 / r2) * pow(10, t2 - t1));
    }
}

function bcmod(arg1, arg2) {
    with (Math) {
        r1 = floor(arg1)
        r2 = floor(arg2)
        return formatNumber((r1 % r2));
    }
}


function rollDice(server_seed_hash, server_seed, secret) {
    var server_seed_hash_check = CryptoJS.SHA256(server_seed).toString();
    var roll_hash = CryptoJS.HmacSHA512(server_seed, secret).toString();

    if (server_seed_hash !== server_seed_hash_check) {
        return 'Hash does not match!';
    }

    for (i = 0; i < roll_hash.length; i += 5) {
        var sub = roll_hash.substr(i, 5);
        if (sub.length == 5) {
            var decimal_number = hexdec(sub);

            if (decimal_number < 1000000) {
                var decimal_fourc = bcmod(decimal_number, 10000);
                var final_decimal = bcdiv(decimal_fourc, 100, 2);
                return final_decimal;
            }
        }
        else {
            break;
        }
    }
}


if (process.argv.length !== 6) {
    console.log('usage: php verify.php serverHash serverSeed userSeed nonce');
    process.exit(0)
}

if (CryptoJS.SHA256(process.argv[3]).toString() === process.argv[2]) {
    console.log("Server Hash is correct!");
} else {
    console.log("Server Hash is incorrect!");
}

console.log(rollDice(process.argv[2], process.argv[3], process.argv[4] + "_" + process.argv[5]))
